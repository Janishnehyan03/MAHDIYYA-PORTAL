import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Axios";

function ViewTeacher() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState({});

  const getTeacher = async () => {
    try {
      let { data } = await Axios.get(`/teacher/${id}`);
      setTeacher(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    getTeacher();
  }, [id]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="md:w-3/12 lg:w-1/3 p-4">
        {/* Profile Card */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-center border-t-4 border-green-400">
          <h1 className="text-[#eeeeee] font-bold text-2xl mb-2">
            {teacher.teacherName}
          </h1>
          <h3 className="text-white text-lg mb-4">
            {teacher?.email}
          </h3>

          <ul className="bg-gray-800 text-white py-4 px-6 rounded shadow-sm">
            <li className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="font-medium">Phone</span>
              <span className="py-1 px-2 rounded text-gray-300 text-sm">
                {teacher.phone}
              </span>
            </li>
            <li className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="font-medium">Gender</span>
              <span className="py-1 px-2 rounded text-gray-300 text-sm">
                {teacher.gender}
              </span>
            </li>
            <li className="flex items-center justify-between py-3 border-b border-gray-700">
              <span className="font-medium">Branch</span>
              <span className="py-1 px-2 rounded text-gray-300 text-sm">
                {teacher?.branch?.studyCentreName}
              </span>
            </li>
            <li className="py-3">
              <span className="font-medium">Subjects</span>
              <div className="mt-2">
                {teacher.subjects?.map((subject, key) => (
                  <div
                    key={key}
                    className="bg-teal-700 py-2 my-2 px-3 rounded text-white text-sm"
                  >
                    {subject.subjectName} ({subject.subjectCode})
                  </div>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ViewTeacher;