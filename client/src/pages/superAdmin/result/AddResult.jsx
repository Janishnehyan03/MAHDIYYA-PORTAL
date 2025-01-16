import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { ExamContext } from "../../../context/examContext";
import { ClassContext } from "../../../context/classContext";
import { UserAuthContext } from "../../../context/userContext";

const AddResult = () => {
  const { pathname } = useLocation();
  const { authData } = useContext(UserAuthContext);
  const { exams, getExams } = useContext(ExamContext);
  const { classes, getClasses } = useContext(ClassContext);
  const [exam, setExam] = useState(null);
  const [subject, setSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [studentMarks, setStudentMarks] = useState({});
  const [existingResults, setExistingResults] = useState([]); // To hold existing results
  const selectedExam = exams.find((examObj) => {
    return examObj._id.toString() === exam; // Compare as string
  });
  let maxMark = selectedExam?.maxPaperMark;

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
        // Fetch existing results
        const response = await Axios.get(
          `/result/fetch?classId=${selectedClass}&subjectId=${subject}&examId=${exam}`
        );
        const results = response.data;
  
        // Prepare results data
        const resultsData = students.map((student) => {
          const existingResult = results.find(
            (result) => result?.student?._id === student._id
          );
          return {
            student: student._id,
            exam,
            marksObtained: studentMarks[student._id] || "0", // Default to "0" if no mark
            class: selectedClass,
            subject,
            _id: existingResult ? existingResult._id : null,
          };
        });
  
        // Function to send requests in batches
        const sendRequestsInBatches = async (data, batchSize) => {
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const requests = batch.map((result) => {
              if (result._id) {
                // PATCH request if the result exists
                return Axios.patch("/result", [
                  { _id: result._id, marksObtained: parseInt(result.marksObtained) },
                ]);
              } else {
                // POST request if it's a new entry
                return Axios.post("/result", {
                  student: result.student,
                  exam: result.exam,
                  marksObtained: parseInt(result.marksObtained),
                  class: result.class,
                  subject: result.subject,
                });
              }
            });
  
            // Wait for the batch to complete
            const responses = await Promise.all(requests);
            responses.forEach((response) => {
              console.log("Response from server:", response.data);
            });
          }
        };
  
        // Send requests in batches of 10
        await sendRequestsInBatches(resultsData, 10);
  
        // Notify user of success
        toast.success("Marks submitted successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } catch (error) {
        // Handle errors
        console.error("Error submitting marks:", error);
        toast.error(error.response?.data?.error || "An error occurred", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };
  

  const fetchExistingResults = async () => {
    if (selectedClass && selectedBranch && exam && subject) {
      try {
        const response = await Axios.get(
          `/result/fetch?examId=${exam}&subjectId=${subject}&classId=${selectedClass}`
        );
        setExistingResults(response.data);
        const marks = response.data.reduce((acc, result) => {
          acc[result?.student?._id] = result?.marksObtained; // Adjusted for object structure
          return acc;
        }, {});
        setStudentMarks(marks);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getAllBranches = async () => {
    try {
      const response = await Axios.get(
        `/study-centre?sort=studyCentreName${authData.branch?._id ? `&_id=${authData.branch._id}` : ''}`
      );
      setBranches(response.data.docs);
    } catch (error) {
      console.error(error.response);
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
      fetchExistingResults(); // Fetch existing results when class, branch, exam or subject changes
    }
  }, [selectedClass, selectedBranch, exam, subject, getStudents]);

  useEffect(() => {
    getClasses();
    getExams(true);
    getAllSubjects();
    getAllBranches();
  }, [pathname]);

  return (
    <div className="mt-8 bg-gray-900 text-gray-300 p-6 rounded-lg shadow-lg">
    <div className="max-w-4xl space-x-2 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Add SA Mark</h2>
  
      {/* Study Centre Selection */}
      <div className="flex flex-wrap gap-4">
        <div className="mb-4 flex-1">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="branch"
          >
            Study Centre
          </label>
          <select
            className="bg-gray-800 border border-gray-600 rounded w-full py-2 px-3 text-gray-300 focus:outline-none focus:ring focus:ring-teal-500"
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
  
        {/* Class Selection */}
        <div className="mb-4 flex-1">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="class"
          >
            Class
          </label>
          <select
            className="bg-gray-800 border border-gray-600 rounded w-full py-2 px-3 text-gray-300 focus:outline-none focus:ring focus:ring-teal-500"
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
  
        {/* Exam Selection */}
        <div className="mb-4 flex-1">
          <label
            className="block text-gray-400 font-bold mb-2"
            htmlFor="exam"
          >
            Exam
          </label>
          <select
            className="bg-gray-800 border border-gray-600 rounded w-full py-2 px-3 text-gray-300 focus:outline-none focus:ring focus:ring-teal-500"
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
  
      {/* Subject Selection */}
      <div className="mb-4">
        <label
          className="block text-gray-400 font-bold mb-2"
          htmlFor="subject"
        >
          Subject
        </label>
        <select
          className="bg-gray-800 border border-gray-600 rounded w-full py-2 px-3 text-gray-300 focus:outline-none focus:ring focus:ring-teal-500"
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
      <div className="mb-10">
        <p className="text-teal-400 my-3">Maximum Marks: {maxMark}</p>
        <table className="min-w-full border-collapse border border-gray-700">
          <thead>
            <tr>
              <th className="border border-gray-700 px-4 py-2">Register No</th>
              <th className="border border-gray-700 px-4 py-2">Student Name</th>
              <th className="border border-gray-700 px-4 py-2">Marks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="border border-gray-700 px-4 py-2">
                  {student?.registerNo}
                </td>
                <td className="border border-gray-700 px-4 py-2">
                  {student.studentName}
                </td>
                <td className="border border-gray-700 px-4 py-2">
                  <input
                    type="number"
                    className="w-20 bg-gray-800 text-gray-300 border border-gray-600 rounded px-2 py-1 focus:ring focus:ring-teal-500"
                    value={studentMarks[student._id] || "0"}
                    max={maxMark}
                    onChange={(e) =>
                      handleMarkChange(student._id, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {loading ? (
          <button className="bg-teal-700 text-white w-full mt-4 py-3 font-bold rounded">
            Uploading...
          </button>
        ) : (
          <button
            className="bg-teal-700 text-white w-full mt-4 py-3 font-bold rounded hover:bg-teal-600 transition duration-300"
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

export default AddResult;
