// src/components/StudyCentreProfile.jsx
import {
  faSave,
  faSpinner,
  faTimes,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";
import { UserAuthContext } from "../../../context/userContext";

// (Place FormField and FormSelect helper components here if not in a separate file)
const FormField = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  required = false,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
        error ? "border-rose-500" : ""
      }`}
    />
    {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
  </div>
);
const FormSelect = ({
  id,
  label,
  name,
  value,
  onChange,
  error,
  options,
  placeholder,
  required = false,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
        error ? "border-rose-500" : ""
      }`}
    >
      <option value="" disabled className="text-gray-500">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value } className="text-gray-900">
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);
function StudyCentreProfile() {
  const initialState = {
    /* ... keep the same initial state ... */
  };
  const [inputData, setInputData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { authData } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getStudyCentre = useCallback(async () => {
    try {
      setInitialLoading(true);
      const res = await Axios.get(`/study-centre/${authData?.branch?._id}`);
      setInputData(res.data.data);
    } catch (error) {
      toast.error("Failed to load profile data.");
    } finally {
      setInitialLoading(false);
    }
  }, [authData?.branch?._id]);

  useEffect(() => {
    getStudyCentre();
  }, [getStudyCentre]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const updateCoverImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      await Axios.post(
        `/study-centre/${authData?.branch?._id}/upload-cover`,
        formData
      );
      toast.success("Cover image updated successfully!");
      setImage(null);
      setImagePreview(null);
      getStudyCentre(); // Refresh data to show new image
    } catch (error) {
      toast.error("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await Axios.patch(`/study-centre/${authData?.branch?._id}`, inputData);
      toast.success("Profile updated successfully!");
      navigate("/"); // Use navigate for SPA-friendly redirection
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        toast.error(errorData?.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="3x"
          className="text-indigo-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <header className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-200 ring-1 ring-inset ring-white/20">
              Study Centre
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Profile Settings
            </h1>
            <p className="mt-1 text-slate-300">
              Manage your study centre's information and cover image.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="divide-y divide-slate-200"
          >
            {/* Cover Image Section */}
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Cover Image</h2>
              <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-gray-100 relative">
                <img
                  src={
                    imagePreview ||
                    inputData.imageCover ||
                    "https://via.placeholder.com/1200x400?text=Upload+a+Cover+Image"
                  }
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label
                  htmlFor="image-upload"
                  className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" /> Change
                  Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {image && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={updateCoverImage}
                      disabled={loading}
                      className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-purple-700"
                    >
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        "Upload"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTimes} title="Cancel" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="p-6 space-y-6">
              {/* --- Basic Information --- */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    id="studyCentreName"
                    label="Study Centre Name"
                    name="studyCentreName"
                    value={inputData.studyCentreName}
                    onChange={onChange}
                    error={errors.studyCentreName}
                    required
                  />
                  <FormField
                    id="studyCentreCode"
                    label="Study Centre Code"
                    name="studyCentreCode"
                    value={inputData.studyCentreCode}
                    onChange={onChange}
                    error={errors.studyCentreCode}
                    required
                  />
                  <FormField
                    id="panchayath"
                    label="Panchayath"
                    name="panchayath"
                    value={inputData.panchayath}
                    onChange={onChange}
                    error={errors.panchayath}
                  />
                  <FormField
                    id="affiliatedYear"
                    label="Affiliated Year"
                    name="affiliatedYear"
                    value={inputData.affiliatedYear}
                    onChange={onChange}
                    error={errors.affiliatedYear}
                  />
                </div>
              </div>

              {/* --- Contact & Location --- */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Contact & Location
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    name="email"
                    value={inputData.email}
                    onChange={onChange}
                    error={errors.email}
                    required
                  />
                  <FormField
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={onChange}
                    error={errors.phone}
                    required
                  />
                  <FormField
                    id="place"
                    label="Place"
                    name="place"
                    value={inputData.place}
                    onChange={onChange}
                    error={errors.place}
                  />
                  <FormField
                    id="postOffice"
                    label="Post Office"
                    name="postOffice"
                    value={inputData.postOffice}
                    onChange={onChange}
                    error={errors.postOffice}
                  />
                  <FormSelect
                    id="district"
                    label="District"
                    name="district"
                    value={inputData.district}
                    onChange={onChange}
                    error={errors.district}
                    options={DISTRICT}
                    placeholder="Select a District"
                    required
                  />
                  <FormField
                    id="state"
                    label="State"
                    name="state"
                    value={inputData.state}
                    onChange={onChange}
                    error={errors.state}
                    required
                  />
                  <FormField
                    id="pinCode"
                    label="PIN Code"
                    name="pinCode"
                    value={inputData.pinCode}
                    onChange={onChange}
                    error={errors.pinCode}
                    required
                  />
                  <FormField
                    id="googleMapUrl"
                    label="Google Maps URL"
                    name="googleMapUrl"
                    value={inputData.googleMapUrl}
                    onChange={onChange}
                    error={errors.googleMapUrl}
                  />
                </div>
              </div>

              {/* --- Principal Details --- */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Principal Details
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    id="currentPrincipal"
                    label="Principal's Name"
                    name="currentPrincipal"
                    value={inputData.currentPrincipal}
                    onChange={onChange}
                  />
                  <FormField
                    id="principalContactNumber"
                    label="Principal's Contact Number"
                    type="tel"
                    name="principalContactNumber"
                    value={inputData.principalContactNumber}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* --- Admin Credentials --- */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Admin Credentials
                </h2>
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md mt-2">
                  Warning: Changing these will affect how you log in.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    id="username"
                    label="Admin Username"
                    name="username"
                    value={inputData.username}
                    onChange={onChange}
                    error={errors.username}
                    required
                  />
                  <FormField
                    id="password"
                    label="Admin Password"
                    name="password"
                    value={inputData.password}
                    onChange={onChange}
                    placeholder="Enter new password or leave blank"
                    error={errors.password}
                  />
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-3" />
                ) : (
                  <FontAwesomeIcon icon={faSave} className="mr-3" />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudyCentreProfile;
