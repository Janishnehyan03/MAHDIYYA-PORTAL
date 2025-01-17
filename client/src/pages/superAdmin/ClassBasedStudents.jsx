import React, { useEffect, useState } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { Link, useLocation, useParams } from "react-router-dom";
import Axios from "../../Axios";
import Loading from "../../components/Loading";

function AllStudents() {
  const { classId } = useParams();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [cols, setCols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState(null);

  const [file, setFile] = useState(null);
  const getClass = async () => {
    try {
      let { data } = await Axios.get(`/class/${classId}`);
      setClassName(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getStudents = async () => {
    try {
      let { data } = await Axios.get(`/student/my-students/data/${classId}`);
      setStudents(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleExcelUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("class", classId);
    try {
      setLoading(true);
      let res = await Axios.post("/student/excel", formData);
      if (res.status === 200) {
        alert("File uploaded successfully");
        setLoading(false);
        window.location.reload();
      }
    } catch (error) {
      console.log(error.response);
      setLoading(false);
      alert(error.response.data.message);
    }
  };

  useEffect(() => {
    getStudents();
    window.scrollTo(0, 0);
  }, [location, classId]);

  useEffect(() => {
    getClass();
  }, [classId]);

  if (students.length < 0) {
    return <Loading />;
  }
  const isEmptyCell = (cell) => {
    return typeof cell === "string" && cell.trim() === "";
  };
  return (
    <>
      <div className="flex flex-col ml-6">
        <h3 className="text-4xl text-center font-bold text-green-500 uppercase my-4">
          {className?.className}
        </h3>

        <div className="mx-auto ">
          <div className="flex"></div>
          <div className="overflow-x-auto sm:-mx-6 lg:mx-auto">
            <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
              {!showModal ? (
                <StudentsTable
                  setShowModal={setShowModal}
                  students={students}
                />
              ) : (
                <>
                  {
                    <div className="p-6 space-y-6">
                      <div>
                        <label
                          className="block mb-2 text-sm font-medium text-[#eeeeee] dark:text-gray-300"
                          htmlFor="file_input"
                        >
                          upload excel file here..
                        </label>
                        <input
                          className="block w-full text-sm text-[#eeeeee] bg-gray-900 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                          id="file_input"
                          type="file"
                          onChange={(e) => {
                            setFile(e.target.files[0]);
                            ExcelRenderer(e.target.files[0], (err, resp) => {
                              console.log(resp);
                              if (err) {
                                console.log(err);
                              } else {
                                setCols(resp.cols);
                                setRows(resp.rows);
                              }
                            });
                          }}
                        />
                        {rows.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="table-auto border-collapse border border-gray-800 mx-auto my-5">
                              <tbody>
                                {rows.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={
                                      row.some((cell) => isEmptyCell(cell))
                                        ? "text-red-500"
                                        : ""
                                    }
                                  >
                                    <td className="border px-4 py-2">
                                      {rowIndex}
                                    </td>
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className={`border px-4 py-2 ${
                                          rowIndex === 0 ? "font-bold" : ""
                                        }`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {loading ? (
                          <button className="bg-green-400 mr-2 text-white  font-bold px-3 py-2 mt-3">
                            Uploading....
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleExcelUpload(e)}
                            className="bg-green-400 mr-2 text-white  font-bold px-3 py-2 mt-3"
                          >
                            Upload{" "}
                          </button>
                        )}
                      </div>
                    </div>
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StudentsTable({ setShowModal, students }) {
  return (
    <div className="sm:-mx-6 lg:-mx-8 w-full">
      <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={(e) => setShowModal(true)}
            className="bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-500 rounded-md shadow-md transition duration-200"
          >
            Add Students
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden border border-gray-700 rounded-lg">
          <table className="min-w-full bg-gray-800 text-gray-300 border-collapse">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  #
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Register No
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Place
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  District
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {students.map((student, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/profile/${student._id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {student.studentName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {student.registerNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {student.place}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {student.district}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/edit-student/${student._id}`}
                      className="text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AllStudents;
