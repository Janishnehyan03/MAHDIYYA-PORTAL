import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";
import { UserAuthContext } from "../../../context/userContext";

function StudyCentreProfile() {
  const initialState = {
    studyCentreName: "",
    place: "",
    postOffice: "",
    district: "",
    state: "",
    pinCode: "",
    phone: "",
    branchImg: "",
    password: "",
    username: "",
    studyCentreCode: "",
    panchayath: "",
    affiliatedYear: "",
    email: "",
    currentPrincipal: "",
    imageCover: "",
    principalContactNumber: "",
  };
  const [inputData, setInputData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { authData } = useContext(UserAuthContext);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res = await Axios.patch(
        `/study-centre/${authData?.branch?._id}`,
        inputData
      );
      if (res.data) {
        toast.success("Edit Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error.response.data);
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Something went wrong",
        {
          autoClose: 3000,
          position: toast.POSITION.TOP_CENTER,
        }
      );
      setErrors(error.response.data);
    }
  };
  const getStudyCentre = async (e) => {
    try {
      let res = await Axios.get(`/study-centre/${authData?.branch?._id}`);
      setInputData(res.data);
    } catch (error) {
      setLoading(false);
    }
  };
  const updateCoverImage = async (e) => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      setLoading(true);
      let res = await Axios.post(
        `/study-centre/${authData?.branch?._id}/upload-cover`,
        formData
      );
      setLoading(false);
      toast.success("Image Updated");
      window.location.reload();
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudyCentre();
  }, []);
  return (
    <div className="w-3/4 ml-6">
      <section className="bg-white p-6">
        <div className="max-w-screen-xl mx-auto">
          <h3 className="text-4xl font-bold text-[#003865] uppercase my-4">
            Edit Your Info
          </h3>
          <div className="max-w-md mx-auto my-10">
            <div className="flex justify-between items-center my-2">
              <h4 className="mb-2 italic">Update Cover Image </h4>
              {image && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setImage(null)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-400"
                  >
                    cancel{" "}
                  </button>
                  <button
                    onClick={updateCoverImage}
                    disabled={loading}
                    className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-400"
                  >
                    {loading ? "uploading..." : "upload"}
                  </button>
                </div>
              )}
            </div>
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {imagePreview ||
              (inputData.imageCover && (
                <div className="mt-4">
                  <img
                    src={imagePreview ? imagePreview : inputData.imageCover}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ))}
          </div>
          <form className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Study Center Name
                  {errors.studyCentreName && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.studyCentreName}
                    </h1>
                  )}
                </label>

                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  onChange={(e) => onChange(e)}
                  required
                  placeholder="Study Center Name"
                  name="studyCentreName"
                  value={inputData.studyCentreName}
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Study Center Code
                  {errors.studyCentreCode && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.studyCentreCode}
                    </h1>
                  )}
                </label>

                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  onChange={(e) => onChange(e)}
                  required
                  placeholder="Study Center Code"
                  name="studyCentreCode"
                  value={inputData.studyCentreCode}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Panchayath
                  {errors.panchayath && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.panchayath}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.panchayath}
                  onChange={(e) => onChange(e)}
                  placeholder="Panchayath"
                  name="panchayath"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Affiliated Year
                  {errors.affiliatedYear && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.affiliatedYear}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.affiliatedYear}
                  onChange={(e) => onChange(e)}
                  placeholder="Affiliated Year"
                  name="affiliatedYear"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Email
                  {errors.email && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.email}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.email}
                  onChange={(e) => onChange(e)}
                  placeholder="Email"
                  name="email"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Phone Number
                  {errors.phone && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.phone}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.phone}
                  onChange={(e) => onChange(e)}
                  placeholder="Phone No :"
                  name="phone"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Place
                  {errors.place && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.place}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  required
                  value={inputData.place}
                  onChange={(e) => onChange(e)}
                  placeholder="Place"
                  name="place"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <label className="block   font-bold mb-2" htmlFor="username">
                District
                {errors.district && (
                  <h1 className="text-red-500 font-sm text-center">
                    {errors.district}
                  </h1>
                )}
              </label>

              <select
                name="district"
                onChange={(e) => onChange(e)}
                id=""
                value={inputData.district}
                className="bg-gray-50 border border-gray-300 text-gray-900  rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 "
              >
                <option hidden>Select YOUR DISTRICT </option>
                {DISTRICT.map((district, index) => (
                  <>
                    <option key={index} value={district}>
                      {district}
                    </option>
                  </>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Post Office
                  {errors.postOffice && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.postOffice}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  required
                  value={inputData.postOffice}
                  onChange={(e) => onChange(e)}
                  placeholder="Post Office"
                  name="postOffice"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Pin Code
                  {errors.pinCode && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.pinCode}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  value={inputData.pinCode}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Pin Code"
                  name="pinCode"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  State
                  {errors.state && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.state}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  value={inputData.state}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="State"
                  name="state"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Principal's Name
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  value={inputData.currentPrincipal}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Principal's Name "
                  name="currentPrincipal"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Principal Contact Number
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="tel"
                  value={inputData.principalContactNumber}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Principal Contact Number "
                  name="principalContactNumber"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Admin Username
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  value={inputData.username}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Admin Username"
                  name="username"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label className="block   font-bold mb-2" htmlFor="username">
                  Admin Password
                </label>
                <input
                  className="block p-4 pl-10 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
                  type="text"
                  value={inputData.password}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Admin Password"
                  name="password"
                />
              </div>
            </div>
          </form>
          <div className="lg:col-span-1 mt-4">
            <div className="px-4 sm:px-0">
              {loading ? (
                <h1 className="text-white text-center w-full lg:w-1/2 bg-[#003865]  font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase">
                  Processing..
                </h1>
              ) : (
                <button
                  onClick={(e) => handleSubmit(e)}
                  className="w-full lg:w-1/2 bg-[#003865] hover:bg-[#231955] text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudyCentreProfile;
