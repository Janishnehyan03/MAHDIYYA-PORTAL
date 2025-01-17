import React, { useContext, useEffect, useState } from "react";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";
import { toast } from "react-toastify";

const AddStudent = () => {
  const { authData } = useContext(UserAuthContext);

  let currentYear = new Date().getFullYear().toString();
  let nextYear = (new Date().getFullYear() + 1).toString();

  const onChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  const [formData, setFormData] = useState({
    studentName: "",
    registerNo: "",
    houseName: "",
    fatherName: "",
    place: "",
    district: "",
    postOffice: "",
    pinCode: "",
    state: "",
    registerNo: "",
    dateOfBirth: "",
    phone: "",
    branch: "",
    studyCentreCode: "",
    className: "",
    class: "",
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const forms = [
    {
      labelName: "Student Name",
      type: "text",
      name: "studentName",
      placeholder: "Enter Name",
      required: true,
      value: formData.studentName,
    },
    {
      labelName: "Register Number",
      type: "text",
      name: "registerNo",
      placeholder: "Enter Register Number",
      required: false,
      value: formData.registerNo,
    },
    {
      labelName: "House Name",
      type: "text",
      name: "houseName",
      placeholder: "Enter House Name",
      required: true,
      value: formData.houseName,
    },
    {
      labelName: "Father Name",
      type: "text",
      name: "fatherName",
      placeholder: "Enter Father's Name",
      required: true,
      value: formData.fatherName,
    },

    {
      labelName: "Phone Number",
      type: "number",
      name: "phone",
      placeholder: "Enter Phone Number",
      required: true,
      value: formData.phone,
    },
    {
      labelName: "Date Of Birth (DD-MM-YYYY)",
      type: "date",
      name: "dateOfBirth",
      placeholder: "DD-MM-YYYY",
      required: true,
      value: formData.dateOfBirth,
    },

    {
      labelName: "Place",
      type: "text",
      name: "place",
      placeholder: "Enter Place",
      required: true,
      value: formData.place,
    },
    {
      labelName: "Post Office",
      type: "text",
      name: "postOffice",
      placeholder: "Enter Post Office",
      required: true,
      value: formData.postOffice,
    },
    {
      labelName: "Pin Code",
      type: "number",
      name: "pinCode",
      placeholder: "Enter Your Pincode",
      required: true,
      value: formData.pinCode,
    },
    {
      labelName: "State",
      type: "text",
      name: "state",
      placeholder: "Enter Your State",
      required: true,
      value: formData.state,
    },
    {
      labelName: "District",
      type: "text",
      name: "district",
      placeholder: "Enter Your District",
      required: true,
      value: formData.district,
    },
  ];

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      // Send form data to backend API endpoint
      const response = await Axios.post("/student/add", {
        ...formData,
        academicYear: currentYear + "-" + nextYear,
        branch: authData.branch._id,
      });

      setLoading(false);
      toast.success("Student Added", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      window.location.reload();
    } catch (error) {
      setLoading(false);
      console.error("Error submitting form:", error);
    }
  };
  const getAllClasses = async (e) => {
    try {
      // Send form data to backend API endpoint
      const response = await Axios.get("/class");
      setClasses(response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  useEffect(() => {
    getAllClasses();
  }, []);
  return (
    <div className="max-w-lg mx-auto mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold text-teal-300 mb-6 text-center">Student Form</h1>
  <form onSubmit={handleSubmit}>
    {/* Select Class */}
    <div className="mb-6">
      <label htmlFor="state" className="block text-sm font-semibold text-teal-200 mb-2">
        Select Class
      </label>
      <select
        id="state"
        name="class"
        onChange={onChange}
        className="block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-teal-100 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
      >
        <option hidden>Select a class</option>
        {classes.map((item, key) => (
          <option value={item._id} key={key}>
            {item.className}
          </option>
        ))}
      </select>
    </div>

    {/* Dynamic Form Fields */}
    {forms.map((form, key) => (
      <div key={key} className="mb-6">
        <label htmlFor={form.name} className="block text-sm font-semibold text-teal-200 mb-2">
          {form.labelName}
        </label>
        <input
          id={form.name}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm uppercase"
          type={form.type}
          onChange={(e) => onChange(e)}
          required={form.required}
          placeholder={form.placeholder}
          name={form.name}
          value={form.value}
        />
        {form.error && <p className="text-red-500 text-sm mt-1">{form.error}</p>}
      </div>
    ))}

    {/* Submit Button */}
    <div className="mt-6">
      {loading ? (
        <button
          className="w-full px-4 py-2 bg-teal-700 text-teal-100 font-semibold rounded-md shadow-lg flex items-center justify-center cursor-not-allowed"
          disabled
        >
          Loading...
        </button>
      ) : (
        <button
          type="submit"
          className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Submit
        </button>
      )}
    </div>
  </form>
</div>

  );
};

export default AddStudent;
