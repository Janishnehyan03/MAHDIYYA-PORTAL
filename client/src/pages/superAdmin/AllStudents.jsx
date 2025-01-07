import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import ReactHTMLTableToExcel from "react-html-table-to-excel"; // Import the library
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";

function AllStudents() {
  const tableRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [studyCentre, setStudyCentre] = useState("");
  const [studyCentres, setStudyCentres] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch study centres from the API
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

  // Fetch classes from the API
  const getClasses = async () => {
    setLoading(true);
    try {
      let { data } = await Axios.get("/class");
      setClasses(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.response);
    }
  };

  // Fetch students based on selected filters
  const getStudents = async () => {
    try {
      setLoading(true);
      // Build query string based on provided filters
      let query = "";
      if (classId) query += `classId=${classId}&`;
      if (studyCentre) query += `studyCentre=${studyCentre}`;

      // Fetch students from the server
      let { data } = await Axios.get(`/student?${query}`);
      setStudents(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes and study centres on component mount
  useEffect(() => {
    getClasses();
    getStudyCentres();
  }, []);

  useEffect(() => {
    getStudents();
  }, [classId, studyCentre]);

  return (
    <div className="container mx-auto bg-gray-900">
      <div className="flex items-center justify-around">
        <h1 className="text-3xl font-bold mb-8 text-center my-5 uppercase">
          All Students
        </h1>
      </div>
      <form className="max-w-sm mx-auto my-4">
        <label
          htmlFor="studyCentre"
          className="block mb-2 text-sm font-medium text-white dark:text-white"
        >
          Select a study centre
        </label>
        <select
          id="studyCentre"
          value={studyCentre}
          onChange={(e) => setStudyCentre(e.target.value)}
          className="bg-gray-900 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">Choose a study centre</option>

          {studyCentres.map((item) => (
            <option key={item._id} value={item._id}>
              {item.studyCentreName}
            </option>
          ))}
        </select>

        <label
          htmlFor="class"
          className="block mb-2 text-sm font-medium text-white dark:text-white"
        >
          Select a class
        </label>
        <select
          id="class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="bg-gray-900 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">Choose a class</option>
          {classes.map((item) => (
            <option key={item._id} value={item._id}>
              {item.className}
            </option>
          ))}
        </select>

        <div className="flex justify-between items-center my-4">
          <p className="">{students.length} students</p>
          {students.length > 0 && (
            <ReactHTMLTableToExcel
              id="export-button"
              className="bg-blue-400 px-3 py-1 text-white font-semibold rounded-2xl"
              table="students-table" // The table id must match this
              filename="students"
              sheet="students"
              buttonText="Download"
            >
              <FontAwesomeIcon icon={faDownload} />
            </ReactHTMLTableToExcel>
          )}
        </div>
      </form>

      {/* Table for displaying students */}
      {loading ? (
        <Loading />
      ) : (
        <table
          id="students-table"
          ref={tableRef}
          className="min-w-full divide-y divide-gray-200 bg-gray-900"
        >
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                REG. NO
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                NAME
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                FATHER
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                HOUSE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                PLACE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                PO
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                PINCODE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                DISTRICT
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                STATE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                PHONE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                DOB
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                CLASS
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                STUDY CENTRE
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                CENTRE CODE
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-900 divide-y divide-gray-200">
            {students.map((student, key) => (
              <tr
                key={student._id}
                onClick={() =>
                  (window.location.href = `/profile/${student._id}`)
                }
                className="cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                <td className="text-sm text-center text-white p-2">
                  {key + 1}
                </td>
                <td className="text-sm text-center text-white p-2">
                  {student.registerNo}
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.studentName}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.fatherName}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.houseName}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.place}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.postOffice}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  {student.pinCode}
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.district}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.state}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.phone}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">
                    {student.dobDate}-{student.dobMonth}-{student.dobYear}
                  </p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-40">{student.class.className}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  <p className="w-60">{student?.branch?.studyCentreName}</p>
                </td>
                <td className="text-sm text-center text-white p-2">
                  {student?.branch?.studyCentreCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllStudents;
