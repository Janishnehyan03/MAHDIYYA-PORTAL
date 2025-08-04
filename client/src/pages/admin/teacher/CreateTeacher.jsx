// src/components/CreateTeacher.jsx
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner, faTimes, faUserPlus } from "@fortawesome/free-solid-svg-icons";

// (Place FormField and FormSelect helper components here if not in a separate file)
const FormField = ({ id, label, type = "text", name, value, onChange, error, required }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
const FormSelect = ({ id, label, name, value, onChange, error, options, placeholder }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
function CreateTeacher() {
  const navigate = useNavigate();
  const { authData } = useContext(UserAuthContext);
  
  const initialState = {
    email: "",
    phone: "",
    teacherName: "",
    subjects: [],
    gender: "",
    MAHDIYYAHTeacher: true,
  };
  const [formData, setFormData] = useState(initialState);
  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const getSubjects = async () => {
      try {
        setInitialLoading(true);
        const { data } = await Axios.get("/subject");
        setSubjects(data);
      } catch (error) {
        toast.error("Failed to load subjects.");
      } finally {
        setInitialLoading(false);
      }
    };
    getSubjects();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubjectSelect = (e) => {
    const subjectId = e.target.value;
    if (subjectId && !formData.subjects.includes(subjectId)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subjectId],
      }));
    }
    e.target.value = ""; // Reset dropdown after selection
  };

  const removeSubject = (subjectIdToRemove) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((id) => id !== subjectIdToRemove),
    }));
  };

  const selectedSubjects = useMemo(() => {
    return subjects.filter((subject) => formData.subjects.includes(subject._id));
  }, [formData.subjects, subjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Create payload directly to avoid state update race conditions
    const payload = {
      ...formData,
      branch: authData.branch._id,
    };

    try {
      await Axios.post("/teacher", payload);
      toast.success("Teacher created successfully!");
      navigate("/all-teachers");
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      }
      toast.error(errorData?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
      </div>
    );
  }

  
  return (
    <div className="bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <FontAwesomeIcon icon={faUserPlus} className="text-3xl text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Teacher</h1>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the details to add a new teacher to the system.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* --- Basic Information --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="teacherName" label="Teacher's Name" name="teacherName" value={formData.teacherName} onChange={onChange} error={errors.teacherName} required />
            <FormField id="email" label="Email Address" type="email" name="email" value={formData.email} onChange={onChange} error={errors.email} required />
            <FormField id="phone" label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={onChange} error={errors.phone} required />
            <FormSelect id="gender" label="Gender" name="gender" value={formData.gender} onChange={onChange} error={errors.gender} options={['Male', 'Female']} placeholder="Select Gender" required />
          </div>

          {/* --- Teacher Type (Segmented Control) --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Teacher Type</label>
            <div className="mt-2 w-full flex p-1 bg-gray-200 rounded-lg">
              <button type="button" onClick={() => setFormData(p => ({ ...p, MAHDIYYAHTeacher: true, subjects: [] }))} className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${formData.MAHDIYYAHTeacher ? 'bg-white shadow' : 'text-gray-600'}`}>
                MAHDIYYAH Teacher
              </button>
              <button type="button" onClick={() => setFormData(p => ({ ...p, MAHDIYYAHTeacher: false, subjects: [] }))} className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${!formData.MAHDIYYAHTeacher ? 'bg-white shadow' : 'text-gray-600'}`}>
                Non-MAHDIYYAH
              </button>
            </div>
          </div>
          
          {/* --- Subjects Section (Conditional) --- */}
          {formData.MAHDIYYAHTeacher && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <FormSelect
                id="subjects"
                label="Assign Subjects"
                name="subjects"
                value="" // Keep it empty to act as an action trigger
                onChange={handleSubjectSelect}
                options={subjects.map(s => ({ value: s._id, label: `${s.subjectName} (${s.subjectCode})` }))}
                placeholder="Select subjects to add..."
              />
              {selectedSubjects.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Assigned:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((subject) => (
                      <div key={subject._id} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        <span>{subject.subjectName}</span>
                        <button type="button" onClick={() => removeSubject(subject._id)} className="text-blue-500 hover:text-blue-700">
                          <FontAwesomeIcon icon={faTimes} size="sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Form Actions --- */}
          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} spin className="mr-3" />}
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {loading ? 'Creating...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTeacher;