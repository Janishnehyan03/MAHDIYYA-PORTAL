import { faSpinner, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

const inputClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Hero Header */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <FontAwesomeIcon icon={faUserPlus} className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Add New Student
              </h1>
              <p className="mt-1 text-slate-300">
                Register a new student to your study centre.
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Select Class */}
          <div className="mb-6">
            <label
              htmlFor="class"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Select Class<span className="ml-0.5 text-rose-500">*</span>
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={onChange}
              required
              className={inputClass}
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
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            {forms.map((form, key) => (
              <div key={key}>
                <label
                  htmlFor={form.name}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {form.labelName}
                  {form.required && (
                    <span className="ml-0.5 text-rose-500">*</span>
                  )}
                </label>
                <input
                  id={form.name}
                  className={inputClass}
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
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              <FontAwesomeIcon
                icon={loading ? faSpinner : faUserPlus}
                spin={loading}
              />
              {loading ? "Submitting..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;