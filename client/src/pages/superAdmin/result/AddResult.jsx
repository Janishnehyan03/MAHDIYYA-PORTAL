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

  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [studentMarks, setStudentMarks] = useState({});
  const [existingResults, setExistingResults] = useState([]);

  const selectedExam = exams.find((examObj) => examObj._id === exam);
  const maxMark = selectedExam?.maxPaperMark;

  const handleMarkChange = (studentId, value) => {
    // Allow clearing the input
    if (value === "") {
      setStudentMarks((prevMarks) => ({
        ...prevMarks,
        [studentId]: "",
      }));
      return;
    }

    const newMarks = parseInt(value, 10);

    // Validate marks are within the allowed range
    if (!isNaN(newMarks) && newMarks >= 0 && newMarks <= maxMark) {
      setStudentMarks((prevMarks) => ({
        ...prevMarks,
        [studentId]: newMarks,
      }));
    } else if (newMarks > maxMark) {
      toast.warn(`Marks cannot exceed the maximum of ${maxMark}`, {
        autoClose: 2000,
        position: "top-center",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !selectedClass || !exam || !subject) {
      toast.error("Please select all fields: Centre, Class, Exam, and Subject.");
      return;
    }

    if (window.confirm("Are you sure you want to submit this result?")) {
      setLoading(true);
      try {
        // Prepare results data by mapping over students
        const resultsData = students.map((student) => {
          const existingResult = existingResults.find(
            (result) => result?.student?._id === student._id
          );
          return {
            student: student._id,
            exam,
            // Use Number() to handle empty strings from input, default to 0
            marksObtained: Number(studentMarks[student._id] || 0),
            class: selectedClass,
            subject,
            _id: existingResult ? existingResult._id : null, // Use existing result ID if available
          };
        });

        // Function to send requests in batches to avoid overwhelming the server
        const sendRequestsInBatches = async (data, batchSize) => {
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const requests = batch.map((result) => {
              if (result._id) {
                // PATCH request to update an existing result
                return Axios.patch("/result", [
                  { _id: result._id, marksObtained: result.marksObtained },
                ]);
              } else {
                // POST request to create a new result
                return Axios.post("/result", {
                  student: result.student,
                  exam: result.exam,
                  marksObtained: result.marksObtained,
                  class: result.class,
                  subject: result.subject,
                });
              }
            });
            await Promise.all(requests);
          }
        };

        // Send requests in batches of 10
        await sendRequestsInBatches(resultsData, 10);

        toast.success("Marks submitted successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        fetchExistingResults(); // Re-fetch to get the latest data with new _ids
      } catch (error) {
        console.error("Error submitting marks:", error);
        toast.error(error.response?.data?.error || "An error occurred while submitting.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchExistingResults = useCallback(async () => {
    if (selectedClass && selectedBranch && exam && subject) {
      try {
        const response = await Axios.get(
          `/result/fetch?examId=${exam}&subjectId=${subject}&classId=${selectedClass}`
        );
        const fetchedResults = response.data || [];
        setExistingResults(fetchedResults);

        const marks = fetchedResults.reduce((acc, result) => {
          if (result?.student?._id) {
            acc[result.student._id] = result.marksObtained;
          }
          return acc;
        }, {});
        setStudentMarks(marks);
      } catch (error) {
        console.error("Error fetching existing results:", error);
        setExistingResults([]);
        setStudentMarks({});
      }
    }
  }, [selectedClass, selectedBranch, exam, subject]);

  const getAllBranches = useCallback(async () => {
    try {
      const branchQuery = authData.branch?._id ? `&_id=${authData.branch._id}` : '';
      const response = await Axios.get(`/study-centre?sort=studyCentreName${branchQuery}`);
      setBranches(response.data.docs);
    } catch (error) {
      console.error(error.response);
    }
  }, [authData.branch]);

  const getAllSubjects = useCallback(async () => {
    try {
      const response = await Axios.get("/subject");
      setSubjects(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const getStudents = useCallback(async () => {
    if (selectedBranch && selectedClass) {
      try {
        const response = await Axios.get(`/student/data/${selectedBranch}/${selectedClass}`);
        setStudents(response.data);
      } catch (error) {
        console.error(error);
        setStudents([]); // Clear students on error
      }
    } else {
      setStudents([]); // Clear students if branch or class is not selected
    }
  }, [selectedBranch, selectedClass]);

  useEffect(() => {
    getStudents();
    fetchExistingResults();
  }, [selectedClass, selectedBranch, exam, subject, getStudents, fetchExistingResults]);

  useEffect(() => {
    getClasses();
    getExams(true);
    getAllSubjects();
    getAllBranches();
  }, [pathname, getClasses, getExams, getAllSubjects, getAllBranches]);

  const isFormFilled = selectedBranch && selectedClass && exam && subject;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Add Student Assessment Marks
          </h2>
          
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Study Centre Selection */}
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Study Centre
              </label>
              <select
                id="branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Study Centre</option>
                {branches.map((branch) => (
                  <option value={branch._id} key={branch._id}>
                    {branch.studyCentreName}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selection */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a Class</option>
                {classes.map((classItem) => (
                  <option value={classItem._id} key={classItem._id}>
                    {classItem.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Selection */}
            <div>
              <label htmlFor="exam" className="block text-sm font-medium text-gray-700 mb-1">
                Exam
              </label>
              <select
                id="exam"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Exam</option>
                {exams.map((examItem) => (
                  <option value={examItem._id} key={examItem._id}>
                    {examItem.examName}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!selectedClass}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Subject</option>
                {selectedClass &&
                  subjects
                    .filter((item) => item.class?._id === selectedClass)
                    .map((subjectItem) => (
                      <option value={subjectItem._id} key={subjectItem._id}>
                        {subjectItem.subjectName} ({subjectItem.subjectCode})
                      </option>
                    ))}
              </select>
            </div>
          </div>
          
          {/* Student Marks Table */}
          {isFormFilled && (
            <div className="mt-8">
              {maxMark && (
                <p className="text-blue-600 font-semibold my-3 text-center">
                  Maximum Marks: {maxMark}
                </p>
              )}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student?.registerNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max={maxMark}
                              className="w-24 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                              value={studentMarks[student._id] || ""}
                              placeholder="N/A"
                              onChange={(e) => handleMarkChange(student._id, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-10 text-gray-500">
                          No students found for the selected criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {students.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Marks"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddResult;