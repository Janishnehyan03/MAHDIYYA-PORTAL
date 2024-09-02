import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Axios from "../../../Axios";
import Loading from "../../../components/Loading";
import ReactHTMLTableToExcel from "react-html-table-to-excel"; // Import the library

function AllMahdiyyaTeachers() {
  const tableRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [studyCentre, setStudyCentre] = useState("");
  const [studyCentres, setStudyCentres] = useState([]);

  const getStudyCentres = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get("/study-centre?sort=studyCentreName");
      setStudyCentres(data.docs);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const getTeachers = async () => {
    try {
      setLoading(true);
      let query = "";
      if (studyCentre) query += `studyCentre=${studyCentre}`;
      let { data } = await Axios.get(`/teacher?${query}`);
      setTeachers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudyCentres();
  }, []);

  useEffect(() => {
    getTeachers();
  }, [studyCentre]);

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-around">
        <h1 className="text-3xl font-bold mb-8 text-center my-5 uppercase">
          All Teachers
        </h1>
      </div>
      <form className="max-w-sm mx-auto my-4">
        <label
          htmlFor="studyCentre"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Select a study centre
        </label>
        <select
          id="studyCentre"
          value={studyCentre}
          onChange={(e) => setStudyCentre(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">Choose a study centre</option>
          {studyCentres.map((item) => (
            <option key={item._id} value={item._id}>
              {item.studyCentreName}
            </option>
          ))}
        </select>

        <div className="flex justify-between items-center my-4">
          <p className="text-green-500">{teachers.length} teachers</p>

          {teachers.length > 0 && (
            <ReactHTMLTableToExcel
              id="export-button"
              className="bg-green-400 px-3 py-1 text-white font-semibold rounded-2xl"
              table="teachers-table" // The table id must match this
              filename="teachers"
              sheet="teachers"
              buttonText="Download"
            >
              <FontAwesomeIcon icon={faDownload} />
            </ReactHTMLTableToExcel>
          )}
        </div>
      </form>

      {loading ? (
        <Loading />
      ) : (
        <table
          id="teachers-table" // Assign a unique id to your table
          ref={tableRef}
          className="min-w-full divide-y divide-gray-200"
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                NAME
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PHONE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GENDER
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                STUDY CENTRE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MAHDIYYA
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher, index) => (
              <tr key={teacher._id}>
                <td className="text-sm text-center text-gray-600 p-2">
                  {index + 1}
                </td>
                <td className="text-sm text-center text-gray-600 p-2">
                  {teacher.teacherName}
                </td>
                <td className="text-sm text-center text-gray-600 p-2">
                  {teacher.email}
                </td>
                <td className="text-sm text-center text-gray-600 p-2">
                  {teacher.phone}
                </td>
                <td className="text-sm text-center text-gray-600 p-2">
                  {teacher.gender}
                </td>
                <td className="text-sm text-center text-gray-600 p-2">
                  {teacher.branch?.studyCentreName || "N/A"}
                </td>
                <td className="text-sm text-center text-gray-600 p-2">
                  {teacher.mahdiyyaTeacher ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllMahdiyyaTeachers;
