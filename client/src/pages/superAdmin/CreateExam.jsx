import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../Axios";

function CreateEditExam() {
  const [examData, setExamData] = useState({
    examName: "",
    academicYear: "",
    maxCceMark: "",
    maxPaperMark: "",
    isActive: false,
  });
  const [exams, setExams] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setExamData({
      examName: "",
      academicYear: "",
      maxCceMark: "",
      maxPaperMark: "",
      isActive: false,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const deleteItem = async (itemId) => {
    try {
      if (window.confirm("Do you want to delete this item?")) {
        let res = await Axios.delete(`/exam/${itemId}`);
        if (res.status === 200) {
          getExams();
          toast.success("Deleted successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      console.log(error.response);
      toast.error("Error Occurred", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const getExams = async () => {
    try {
      let { data } = await Axios.get("/exam/data/admin");
      setExams(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditing) {
        res = await Axios.patch(`/exam/${editingId}`, examData);
      } else {
        res = await Axios.post("/exam", examData);
      }
      if (res.status === 200) {
        getExams();
        resetForm();
        toast.success(isEditing ? "Exam Updated Successfully" : "Exam Created Successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log(error.response.data);
      toast.error("Something went wrong", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (exam) => {
    setExamData({
      examName: exam.examName,
      academicYear: exam.academicYear,
      maxCceMark: exam.maxCceMark,
      maxPaperMark: exam.maxPaperMark,
      isActive: exam.isActive,
    });
    setIsEditing(true);
    setEditingId(exam._id);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    getExams();
  }, []);

  return (
    <>
      {/* Create/Edit Exam Form */}
      <form className="mx-auto my-4 w-1/2 mt-[8rem]" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold">{isEditing ? "Edit Exam" : "Create Exam"}</h1>

        {/* Academic Year */}
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="academicYear"
            className="block py-2.5 px-0 w-full text-sm text-[#eeeeee] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            onChange={handleInputChange}
            value={examData.academicYear}
          />
          <label className="peer-focus:font-medium absolute text-sm text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Academic Year
          </label>
        </div>

        {/* Exam Name */}
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="examName"
            className="block py-2.5 px-0 w-full text-sm text-[#eeeeee] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            onChange={handleInputChange}
            value={examData.examName}
          />
          <label className="peer-focus:font-medium absolute text-sm text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Exam Name
          </label>
        </div>

        {/* Max CCE Mark */}
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="number"
            name="maxCceMark"
            className="block py-2.5 px-0 w-full text-sm text-[#eeeeee] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            onChange={handleInputChange}
            value={examData.maxCceMark}
          />
          <label className="peer-focus:font-medium absolute text-sm text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Max CCE Mark
          </label>
        </div>

        {/* Max Paper Mark */}
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="number"
            name="maxPaperMark"
            className="block py-2.5 px-0 w-full text-sm text-[#eeeeee] bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
            onChange={handleInputChange}
            value={examData.maxPaperMark}
          />
          <label className="peer-focus:font-medium absolute text-sm text-white dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Max Paper Mark
          </label>
        </div>

        {/* Is Active */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="isActive"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            checked={examData.isActive}
            onChange={handleInputChange}
          />
          <label className="ml-2 text-sm font-medium text-white dark:text-gray-300">Is Active</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center mr-2"
        >
          {isEditing ? "Update" : "Submit"}
        </button>

        {/* Cancel Button (only show when editing) */}
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Exam Time Tables */}
      <h1 className="font-bold mt-5 text-center text-indigo-600">
        Exam Time Tables
      </h1>
      <table className="w-full text-sm text-left text-white">
        <thead className="text-xs text-gray-700 bg-gray-900">
          <tr>
            <th className="py-3 px-6">Exam Name</th>
            <th className="py-3 px-6">Academic Year</th>
            <th className="py-3 px-6">Max CCE Mark</th>
            <th className="py-3 px-6">Max Paper Mark</th>
            <th className="py-3 px-6">Is Active</th>
            <th className="py-3 px-6">Edit</th>
            <th className="py-3 px-6">Delete</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((item) => (
            <tr key={item._id} className="bg-gray-900">
              <td className="py-4 px-6">{item?.examName}</td>
              <td className="py-4 px-6">{item.academicYear}</td>
              <td className="py-4 px-6">{item.maxCceMark}</td>
              <td className="py-4 px-6">{item.maxPaperMark}</td>
              <td className="py-4 px-6">{item.isActive ? "Yes" : "No"}</td>
              <td className="py-4 px-6">
                <button 
                  onClick={() => handleEdit(item)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </td>
              <td className="py-4 px-6">
                <button
                  onClick={() => deleteItem(item._id)}
                  className="font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default CreateEditExam;