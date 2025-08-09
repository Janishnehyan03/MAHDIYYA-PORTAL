import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../Axios";

function ViewTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState({});

  const getTeacher = async () => {
    try {
      let { data } = await Axios.get(`/teacher/${id}`);
      setTeacher(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const deleteTeacher = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${teacher.teacherName}?`
    );
    if (!confirmDelete) return;

    try {
      await Axios.delete(`/teacher/${id}`);
      alert("Teacher deleted successfully");
      navigate("/all-teachers"); // redirect to teachers list page
    } catch (error) {
      console.error(error);
      alert("Failed to delete teacher");
    }
  };

  useEffect(() => {
    getTeacher();
  }, [id]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-200">
          <h1 className="text-gray-800 font-bold text-2xl mb-1">
            {teacher.teacherName}
          </h1>
          <h3 className="text-gray-600 text-base mb-4">{teacher?.email}</h3>

          <ul className="bg-gray-50 py-4 px-6 rounded-lg shadow-sm border border-gray-200">
            <li className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Phone</span>
              <span className="py-1 px-2 rounded bg-gray-100 text-gray-600 text-sm">
                {teacher.phone}
              </span>
            </li>
            <li className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Gender</span>
              <span className="py-1 px-2 rounded bg-gray-100 text-gray-600 text-sm">
                {teacher.gender}
              </span>
            </li>
            <li className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Centre</span>
              <span className="py-1 px-2 rounded bg-gray-100 text-gray-600 text-sm">
                {teacher?.branch?.studyCentreName}
              </span>
            </li>
            <li className="py-3">
              <span className="font-medium text-gray-700">Subjects</span>
              <div className="mt-2">
                {teacher.subjects?.map((subject, key) => (
                  <div
                    key={key}
                    className="bg-blue-100 text-blue-800 py-2 my-1 px-3 rounded text-sm border border-blue-200"
                  >
                    {subject.subjectName} ({subject.subjectCode})
                  </div>
                ))}
              </div>
            </li>
          </ul>

          {/* Delete Button */}
          <button
            onClick={deleteTeacher}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition duration-200"
          >
            Delete Teacher
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewTeacher;
