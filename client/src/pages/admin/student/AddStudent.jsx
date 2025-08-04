import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

const AddStudent = () => {
  const { authData } = useContext(UserAuthContext);

  const currentYear = new Date().getFullYear().toString();
  const nextYear = (new Date().getFullYear() + 1).toString();

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
    dateOfBirth: "",
    phone: "",
    branch: "",
    studyCentreCode: "",
    className: "",
    class: "",
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define form fields for dynamic rendering
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
      type: "tel",
      name: "phone",
      placeholder: "Enter Phone Number",
      required: true,
      value: formData.phone,
    },
    {
      labelName: "Date Of Birth",
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
      type: "text",
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

  // Handle form field changes
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Axios.post("/student/add", {
        ...formData,
        academicYear: `${currentYear}-${nextYear}`,
        branch: authData.branch._id,
      });
      toast.success("Student Added", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4000,
      });
      setLoading(false);
      setFormData({
        studentName: "",
        registerNo: "",
        houseName: "",
        fatherName: "",
        place: "",
        district: "",
        postOffice: "",
        pinCode: "",
        state: "",
        dateOfBirth: "",
        phone: "",
        branch: "",
        studyCentreCode: "",
        className: "",
        class: "",
      });
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.error || "Error submitting form. Please try again.",
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 4000,
        }
      );
    }
  };

  // Fetch classes on mount
  useEffect(() => {
    const getAllClasses = async () => {
      try {
        const response = await Axios.get("/class");
        setClasses(response.data);
      } catch (error) {
        setClasses([]);
      }
    };
    getAllClasses();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center tracking-wide">Add New Student</h1>
      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Select Class */}
        <div className="mb-8">
          <label htmlFor="class" className="block text-sm font-semibold text-blue-800 mb-2">
            Select Class
          </label>
          <select
            id="class"
            name="class"
            value={formData.class}
            onChange={onChange}
            required
            className="block w-full px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-base"
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes.map((item) => (
              <option value={item._id} key={item._id}>
                {item.className}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Form Fields in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {forms.map((form, key) => (
            <div key={key}>
              <label htmlFor={form.name} className="block text-sm font-semibold text-blue-800 mb-1">
                {form.labelName}
              </label>
              <input
                id={form.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 sm:text-base"
                type={form.type}
                onChange={onChange}
                required={form.required}
                placeholder={form.placeholder}
                name={form.name}
                value={form.value}
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            className={`w-full px-5 py-2.5 text-white font-semibold rounded-lg shadow-md transition-all duration-200 
            ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"}`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;