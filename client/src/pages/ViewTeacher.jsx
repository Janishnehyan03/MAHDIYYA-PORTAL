import React, { useEffect } from "react";
import { useState } from "react";
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
    <div>
      <div className="md:w-3/12 lg:mx-auto md:mx-2">
        {/* Profile Card */}
        <div className="bg-gray-900 p-3 text-center border-t-4 border-green-400">
        
          <h1 className="text-[#eeeeee] font-bold text-xl leading-8 my-1">
            {teacher.teacherName}
          </h1>
          <h3 className="text-white font-lg text-semibold leading-6">
            {teacher?.email}
          </h3>

          <ul className="bg-gray-100 text-white hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
            <li className="flex items-center py-3">
              <span>Phone</span>
              <span className="ml-auto">
                <span className=" py-1 px-2 rounded text-[#eeeeee] text-sm">
                  {teacher.phone}
                </span>
              </span>
            </li>
            <li className="flex items-center py-3">
              <span>Gender</span>
              <span className="ml-auto">
                <span className=" py-1 px-2 rounded text-[#eeeeee] text-sm">
                  {teacher.gender}
                </span>
              </span>
            </li>
            <li className="flex items-center py-3">
              <span className="ml-auto">
                <span className=" py-1 px-2 rounded text-[#eeeeee] text-sm">
                  {teacher?.branch?.studyCentreName}
                </span>
              </span>
            </li>
           
            <li className="py-3">
              <span>Subjects</span>
              <span className="ml-auto">
                {teacher.subjects?.map((subject, key) => (
                  <div
                    key={key}
                    className="bg-indigo-700 py-2 my-2 px-2 rounded text-white text-sm"
                  >
                    {subject.subjectName} {subject.subjectCode}
                  </div>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ViewTeacher;
