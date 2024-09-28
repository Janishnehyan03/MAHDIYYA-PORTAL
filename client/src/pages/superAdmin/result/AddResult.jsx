import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { ExamContext } from "../../../context/examContext";
import { ClassContext } from "../../../context/classContext";

const AddResult = () => {
  const { pathname } = useLocation();
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
        // Fetch existing results based on the selected class, subject, and exam
        const response = await Axios.get(
          `/result/fetch?classId=${selectedClass}&subjectId=${subject}&examId=${exam}`
        );
        const results = response.data;

        // Construct the resultsData array
        const resultsData = students.map((student) => {
          // Find the existing result for the current student
          const existingResult = results.find(
            (result) => result.student._id === student._id
          );

          // Create an entry for this student
          return {
            student: student._id,
            exam: exam,
            marksObtained: studentMarks[student._id] || "0", // Default to "0" if no mark
            class: selectedClass,
            subject,
            _id: existingResult ? existingResult._id : null, // Use fetched result._id if it exists
          };
        });

        // Initialize an array for requests
        const requests = [];

        resultsData.forEach((result) => {
          if (
            result.marksObtained !== undefined &&
            result.marksObtained !== "0"
          ) {
            if (result._id) {
              // Prepare PATCH request if result already exists
              const patchData = [
                {
                  _id: result._id,
                  marksObtained: parseInt(result.marksObtained),
                },
              ];
              requests.push(Axios.patch("/result", patchData)); // Send as an array
            } else {
              // Prepare POST request if it's a new entry
              const postData = {
                student: result.student,
                exam: result.exam,
                marksObtained: parseInt(result.marksObtained), // Ensure it's an integer
                class: result.class,
                subject: result.subject,
              };
              requests.push(Axios.post("/result", postData));
            }
          }
        });

        // Wait for all requests to complete
        const responses = await Promise.all(requests);

        // Notify user of success
        toast.success("Marks submitted successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      } catch (error) {
        // Handle any errors that occur during submission
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

  const fetchExistingResults = async () => {
    if (selectedClass && selectedBranch && exam && subject) {
      try {
        const response = await Axios.get(
          `/result/fetch?examId=${exam}&subjectId=${subject}&classId=${selectedClass}`
        );
        setExistingResults(response.data);
        const marks = response.data.reduce((acc, result) => {
          acc[result.student._id] = result.marksObtained; // Adjusted for object structure
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
      const response = await Axios.get("/study-centre?sort=studyCentreName");
      setBranches(response.data.docs);
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
    <div className="mt-8">
      <div className="max-w-4xl space-x-2 mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Add SA Mark</h2>

        {/* Study Centre Selection */}
        <div className="flex">
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="branch"
            >
              Study Centre
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="class"
            >
              Class
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="exam"
            >
              Exam
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

          {/* Subject Selection */}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="subject"
          >
            Subject
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

        {/* Exam Selection */}

        {/* Student Marks Table */}
        <div>
          <p className="text-red-700 my-3">Maximum Marks {maxMark}</p>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-700 px-2 py-2">
                  Register No
                </th>
                <th className="border border-gray-700 px-2 py-2">
                  Student Name
                </th>
                <th className="border border-gray-700 px-2 py-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="border border-gray-700 px-2 py-2">
                    {student?.registerNo}
                  </td>
                  <td className="border border-gray-700 px-2 py-2">
                    {student.studentName}
                  </td>
                  <td className="border border-gray-700 px-2 py-2">
                    <input
                      type="number"
                      className="w-20"
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
            <button className="bg-blue-900 text-white w-full mt-4 py-3 font-bold">
              Uploading...
            </button>
          ) : (
            <button
              className="bg-blue-900 text-white w-full mt-4 py-3 font-bold"
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
