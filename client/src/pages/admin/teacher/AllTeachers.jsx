import React, { useContext, useEffect, useState } from "react";
import Axios from "../../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { UserAuthContext } from "../../../context/userContext";

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col space-y-4">
        {[...Array(5)].map((_, index) => (
          <div className="flex space-x-4" key={index}>
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1 py-1 space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function AllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authData } = useContext(UserAuthContext);

  const getTeachers = async () => {
    try {
      let { data } = await Axios.get(`/teacher?studyCentre=${authData?.branch._id}`);
      setTeachers(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeachers();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <Skeleton />
      ) : (
        <table className="min-w-full border-collapse border border-gray-800">
          <thead className="bg-gray-700 border-b border-gray-800">
            <tr>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">#</th>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">Name</th>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">Email</th>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">Gender</th>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">Phone</th>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">Mahdiyya Teacher</th>
              <th className="text-sm font-medium text-white px-6 py-4 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 &&
              teachers.map((teacher, i) => (
                <tr className="border-b border-gray-800" key={teacher._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {i + 1}
                  </td>
                  <td className="text-sm text-white hover:text-blue-700 font-semibold cursor-pointer px-6 py-4 whitespace-nowrap">
                    <Link to={`/teacher/${teacher._id}`}>{teacher.teacherName}</Link>
                  </td>
                  <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                    {teacher.email}
                  </td>
                  <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                    {teacher.gender}
                  </td>
                  <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                    {teacher.phone}
                  </td>
                  <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                    {teacher?.mahdiyyaTeacher ? "YES" : "NO"}
                  </td>
                  <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                    <Link to={`/edit-teacher/${teacher._id}`}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllTeachers;