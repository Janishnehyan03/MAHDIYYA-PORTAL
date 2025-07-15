import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

const AddCceMark = () => {
  const { pathname } = useLocation();
  const [exam, setExam] = useState(null);
  const [subject, setSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authData } = useContext(UserAuthContext);

  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [exams, setExams] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const selectedExam = exams.find((examObj) => {
    return examObj._id.toString() === exam; // Compare as string
  });
  let maxMark = selectedExam?.maxCceMark;

  const handleMarkChange = (studentId, newMarks) => {
    setStudentMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: newMarks,
    }));
  };

  const handleSubmit = async (e) => {
    if (window.confirm("Are you sure to submit this result?")) {
      e.preventDefault();
      setLoading(true);
      try {
        // Construct the results array with necessary data
        const response = await Axios.get(
          `/cce/fetch?classId=${selectedClass}&subjectId=${subject}&examId=${exam}`
        );
        const results = response.data;
        const resultsData = students.map((student) => {
          // Find the result for the current student from fetched results
          const existingResult = results.find(
            (result) => result?.student?._id === student._id
          );

          // Create an entry for this student
          return {
            student: student._id,
            exam: exam,
            cceMark: studentMarks[student._id] || "0", // Default to "0" if no mark
            class: selectedClass,
            subject,
            _id: existingResult ? existingResult._id : null, // Use fetched result._id if it exists
          };
        });

        // Determine whether to PATCH or POST based on results length
        const requests = results.length > 0 ? [] : []; // Initialize an empty array for requests

        resultsData.forEach((result) => {
          if (result.cceMark !== undefined && result.cceMark !== "0") {
            if (result._id) {
              // Prepare PATCH request if result already exists
              const patchData = [
                { _id: result._id, cceMark: parseInt(result.cceMark) },
              ];
              console.log("Sending PATCH request with data:", patchData);
              requests.push(Axios.patch("/cce", patchData)); // Send as an array
            } else {
              // Prepare POST request if it's a new entry
              const postData = {
                student: result.student,
                exam: result.exam,
                cceMark: parseInt(result.cceMark), // Ensure it's an integer
                class: result.class,
                subject: result.subject,
              };
              console.log("Sending POST request with data:", postData);
              requests.push(Axios.post("/cce", postData));
            }
          }
        });

        // Wait for all requests to complete
        const responses = await Promise.all(requests);

        // Log responses from the server (optional)
        responses.forEach((response) => {
          console.log("Response from server:", response.data);
        });

        // Notify user of success
        toast.success("Marks submitted successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } catch (error) {
        // Handle any errors that occur during submission
        console.error("Error submitting marks:", error);
        toast.error(error.response?.data?.error || "An error occurred", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } finally {
        // Reset loading state
        setLoading(false);
      }
    }
  };

  const fetchResults = async () => {
    if (subject && selectedClass && selectedBranch && exam) {
      try {
        const response = await Axios.get(
          `/cce/fetch?classId=${selectedClass}&subjectId=${subject}&examId=${exam}`
        );
        const results = response.data;

        const marks = {};
        results.forEach((result) => {
          marks[result.student?._id] = result.cceMark; // Updated to access student ID correctly
        });

        setStudentMarks(marks);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchResults();
  }, [subject, selectedClass, selectedBranch, exam]);

  const getAllClasses = async () => {
    try {
      const response = await Axios.get("/class");
      setClasses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllBranches = async () => {
    try {
      const response = await Axios.get(
        `/study-centre?sort=studyCentreName&_id=${authData.branch._id}`
      );
      setBranches(response.data.docs);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllExams = async () => {
    try {
      const response = await Axios.get("/exam");
      setExams(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllSubjects = async () => {
    try {
      const response = await Axios.get("/subject");
      setSubjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getStudents = useCallback(async () => {
    try {
      const response = await Axios.get(
        `/student/data/${selectedBranch}/${selectedClass}`
      );
      setStudents(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [selectedBranch, selectedClass]);

  useEffect(() => {
    if (selectedBranch && selectedClass) {
      getStudents();
    }
  }, [selectedClass, selectedBranch, getStudents]);

  useEffect(() => {
    getAllClasses();
    getAllExams();
    getAllSubjects();
    getAllBranches();
  }, [pathname]);

  return (
    <div className="mt-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Add FA Mark
        </h2>

        {/* Row for Study Centre, Class, and Exam */}
        <div className="flex flex-wrap -mx-2 mb-6">
          <div className="flex-1 px-2 mb-4 md:mb-0">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="branch"
            >
              Study Centre
            </label>
            <select
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="branch"
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option hidden>select study centre</option>
              {branches.map((branch) => (
                <option value={branch._id} key={branch._id}>
                  {branch.studyCentreName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 px-2 mb-4 md:mb-0">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="class"
            >
              Class
            </label>
            <select
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="class"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option hidden>select a class</option>
              {classes.map((classItem) => (
                <option value={classItem._id} key={classItem._id}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 px-2">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="exam"
            >
              Exam
            </label>
            <select
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="exam"
              onChange={(e) => setExam(e.target.value)}
            >
              <option hidden>select exam</option>
              {exams.map((examItem) => (
                <option value={examItem._id} key={examItem._id}>
                  {examItem.examName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Dropdown */}
        <div className="mb-6">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="subject"
          >
            Subject
          </label>
          <select
            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="subject"
            onChange={(e) => setSubject(e.target.value)}
          >
            <option hidden>select subject</option>
            {selectedClass &&
              subjects
                .filter((item) => item.class?._id === selectedClass)
                .map((subjectItems) => (
                  <option value={subjectItems._id} key={subjectItems._id}>
                    {subjectItems.subjectName} {subjectItems.subjectCode}
                  </option>
                ))}
          </select>
        </div>

        {/* Student Marks Table */}
        <div>
          <p className="text-blue-600 my-4 font-semibold">
            Maximum Marks ({maxMark})
          </p>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Register No
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mark
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {student?.registerNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full bg-white text-gray-800 rounded px-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentMarks[student._id] ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value);

                          if (isNaN(value) || value <= maxMark) {
                            handleMarkChange(
                              student._id,
                              isNaN(value) ? "" : value
                            );
                          }
                        }}
                        max={maxMark}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading ? (
            <button className="bg-blue-400 text-white w-full mt-6 py-3 font-bold rounded shadow-md cursor-not-allowed" disabled>
              Uploading...
            </button>
          ) : (
            <button
              className="bg-blue-600 text-white w-full mt-6 py-3 font-bold rounded shadow-md hover:bg-blue-700 transition-colors"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCceMark;
