import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Use useNavigate
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";

// --- Paste the FormField and SelectField components from above here ---
// Helper components to keep the main form clean

// A reusable text input field
const FormField = ({ id, label, type = "text", ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium leading-6 text-slate-900"
    >
      {label}
    </label>
    <div className="mt-2">
      <input
        id={id}
        name={id}
        type={type}
        className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition"
        {...props}
      />
    </div>
  </div>
);

// A reusable select dropdown field
const SelectField = ({ id, label, value, onChange, options, placeholder }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium leading-6 text-slate-900"
    >
      {label}
    </label>
    <div className="relative mt-2">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="block w-full appearance-none rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition"
      >
        <option value="" disabled>
          {placeholder || "Select an option..."}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  </div>
);

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate(); // Use the navigate hook for routing
  const initialState = {
    studentName: "",
    registerNo: "",
    fatherName: "",
    motherName: "",
    houseName: "",
    dateOfBirth: "",
    place: "",
    postOffice: "",
    guardian: "",
    district: "",
    state: "",
    pinCode: "",
    phone: "",
    class: "",
    branch: "",
  };
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);


  // Fetch initial data
  useEffect(() => {
    const getStudent = async () => {
      try {
        const { data } = await Axios.get(`/student/${id}`);
        console.log("Fetched student data:", data);
  
        setFormData(data);
      } catch (error) {
        console.error("Failed to fetch student:", error);
        toast.error("Could not load student data.");
      }
    };

    const getClasses = async () => {
      try {
        const { data } = await Axios.get("/class/");
        setClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    getStudent();
    getClasses();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.patch(`/student/${id}`, formData);
      if (res.status === 200) {
        toast.success("Student updated successfully!");
        // Use navigate for a smooth SPA transition instead of a page reload
        navigate(`/all-students/${res.data.class}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.error("Update failed:", error.response);
    } finally {
      setLoading(false);
    }
  };

  // Prepare options for select fields
  const districtOptions = DISTRICT.map((d) => ({ value: d, label: d }));
  const classOptions = classes.map((c) => ({
    value: c._id,
    label: c.className,
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
        <form onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">
              Edit Student Information
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update the details for {formData.studentName || "the student"}.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Section 1: Personal Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-3">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="studentName"
                  label="Student Name"
                  value={formData.studentName}
                  onChange={onChange}
                  required
                  placeholder="John Doe"
                />
                <FormField
                  id="registerNo"
                  label="Register Number"
                  value={formData.registerNo}
                  onChange={onChange}
                  required
                  placeholder="STU12345"
                />
                <FormField
                  id="fatherName"
                  label="Father's Name"
                  value={formData.fatherName}
                  onChange={onChange}
                  required
                  placeholder="Richard Doe"
                />
        
                <FormField
                  id="dateOfBirth"
                  label="Date of Birth"
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Section 2: Contact & Address */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-3">
                Contact & Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={onChange}
                  required
                  placeholder="123-456-7890"
                />
                <FormField
                  id="houseName"
                  label="House Name / Number"
                  value={formData.houseName}
                  onChange={onChange}
                  required
                  placeholder="42, Oak Street"
                />
                <FormField
                  id="place"
                  label="Place / City"
                  value={formData.place}
                  onChange={onChange}
                  required
                  placeholder="Springfield"
                />
                <FormField
                  id="postOffice"
                  label="Post Office"
                  value={formData.postOffice}
                  onChange={onChange}
                  placeholder="Central Post"
                />
                <SelectField
                  id="district"
                  label="District"
                  value={formData.district}
                  onChange={onChange}
                  options={districtOptions}
                  placeholder="Select a district..."
                  required
                />
                <FormField
                  id="state"
                  label="State"
                  value={formData.state}
                  onChange={onChange}
                  required
                  placeholder="Illinois"
                />
                <FormField
                  id="pinCode"
                  label="PIN Code"
                  value={formData.pinCode}
                  onChange={onChange}
                  required
                  placeholder="62704"
                />
              </div>
            </div>

            {/* Section 3: Academic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-3">
                Academic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  id="class"
                  label="Class"
                  value={formData.class}
                  onChange={onChange}
                  options={classOptions}
                  placeholder="Select student's class..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions / Footer */}
          <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold text-sm shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-150 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                    ></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudent;
