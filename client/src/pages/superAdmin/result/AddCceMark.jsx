import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

const AddCceMark = () => {
  const { pathname } = useLocation();
  const { authData } = useContext(UserAuthContext);

  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [exams, setExams] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const [existingResults, setExistingResults] = useState([]);

  const selectedExam = exams.find((examObj) => examObj._id?.toString() === exam);
  const maxMark = selectedExam?.maxCceMark ?? null; // may be null/undefined

  // ---------- MARK INPUT HANDLER ----------
  const handleMarkChange = (studentId, value) => {
    const raw = value ?? "";
    const trimmed = raw.trim().toUpperCase();

    // empty -> clear
    if (trimmed === "") {
      setStudentMarks((prev) => ({
        ...prev,
        [studentId]: "",
      }));
      return;
    }

    // absent -> "A"
    if (trimmed === "A") {
      setStudentMarks((prev) => ({
        ...prev,
        [studentId]: "A",
      }));
      return;
    }

    // numeric
    const num = Number(trimmed);
    if (Number.isNaN(num) || num < 0) {
      toast.warn("Enter a non-negative number or 'A' for absent.", {
        autoClose: 2000,
        position: "top-center",
      });
      return;
    }

    if (maxMark != null && num > maxMark) {
      toast.warn(`Marks cannot exceed the maximum of ${maxMark}`, {
        autoClose: 2000,
        position: "top-center",
      });
      return;
    }

    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: num,
    }));
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async () => {
    if (!selectedBranch || !selectedClass || !exam || !subject) {
      toast.error("Please select Study Centre, Class, Exam and Subject.", {
        autoClose: 2500,
        position: "top-center",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to submit this result?")) {
      return;
    }

    setLoading(true);
    try {
      const newEntries = [];
      const updates = [];

      students.forEach((student) => {
        const rawMark = studentMarks[student._id];

        // no mark and no existing result -> skip
        const existingResult = existingResults.find(
          (r) => r?.student?._id === student._id
        );
        if ((rawMark === undefined || rawMark === "") && !existingResult) {
          return;
        }

        const cceMark =
          rawMark === "A"
            ? "A"
            : rawMark === "" || rawMark === undefined
            ? "0"
            : String(rawMark);

        if (existingResult && existingResult._id) {
          updates.push({
            _id: existingResult._id,
            cceMark,
          });
        } else {
          newEntries.push({
            student: student._id,
            exam,
            cceMark,
            class: selectedClass,
            subject,
          });
        }
      });

      if (!newEntries.length && !updates.length) {
        toast.info("No changes to submit.", {
          autoClose: 2000,
          position: "top-center",
        });
        setLoading(false);
        return;
      }

      const requests = [];
      if (newEntries.length) {
        // backend createResults upserts array
        requests.push(Axios.post("/cce", newEntries));
      }
      if (updates.length) {
        requests.push(Axios.patch("/cce", updates));
      }

      await Promise.all(requests);

      toast.success("Marks submitted successfully", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });

      // Refresh existing results & marks
      await fetchResults();
    } catch (error) {
      console.error("Error submitting marks:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "An error occurred",
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- FETCH EXISTING RESULTS FOR CURRENT FILTER ----------
  const fetchResults = useCallback(async () => {
    if (subject && selectedClass && selectedBranch && exam) {
      try {
        const response = await Axios.get(
          `/cce/fetch?classId=${selectedClass}&subjectId=${subject}&examId=${exam}`
        );
        const results = response.data || [];

        setExistingResults(results);

        const marks = {};
        results.forEach((result) => {
          const studentId = result?.student?._id;
          if (!studentId) return;
          // if backend returns absent flag, respect it; else treat 0 as numeric
          if (result.absent) {
            marks[studentId] = "A";
          } else if (typeof result.cceMark === "number") {
            marks[studentId] = result.cceMark;
          } else {
            marks[studentId] = result.cceMark ?? "";
          }
        });

        setStudentMarks(marks);
      } catch (error) {
        console.error("Error fetching CCE results:", error);
        setExistingResults([]);
        setStudentMarks({});
      }
    } else {
      setExistingResults([]);
      setStudentMarks({});
    }
  }, [subject, selectedClass, selectedBranch, exam]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ---------- DATA LOADERS ----------
  const getAllClasses = async () => {
    try {
      const response = await Axios.get("/class");
      setClasses(response.data || []);
    } catch (error) {
      console.error("Error getting classes:", error);
    }
  };

  const getAllBranches = async () => {
    try {
      const branchId = authData?.branch?._id;
      const branchQuery = branchId ? `&_id=${branchId}` : "";
      const response = await Axios.get(
        `/study-centre?sort=studyCentreName${branchQuery}`
      );
      setBranches(response.data.docs || []);
    } catch (error) {
      console.error("Error getting branches:", error);
    }
  };

  const getAllExams = async () => {
    try {
      const response = await Axios.get("/exam");
      setExams(response.data || []);
    } catch (error) {
      console.error("Error getting exams:", error);
    }
  };

  const getAllSubjects = async () => {
    try {
      const response = await Axios.get("/subject");
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error getting subjects:", error);
    }
  };

  const getStudents = useCallback(async () => {
    if (!selectedBranch || !selectedClass) {
      setStudents([]);
      return;
    }
    try {
      const response = await Axios.get(
        `/student/data/${selectedBranch}/${selectedClass}`
      );
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error getting students:", error);
      setStudents([]);
    }
  }, [selectedBranch, selectedClass]);

  useEffect(() => {
    if (selectedBranch && selectedClass) {
      getStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedBranch, getStudents]);

  // Initial loads
  useEffect(() => {
    getAllClasses();
    getAllExams();
    getAllSubjects();
    getAllBranches();
  }, [pathname]);

  const isFormFilled = !!(selectedBranch && selectedClass && exam && subject);

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
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setStudents([]);
                setExistingResults([]);
                setStudentMarks({});
              }}
            >
              <option value="">select study centre</option>
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
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setStudents([]);
                setExistingResults([]);
                setStudentMarks({});
              }}
            >
              <option value="">select a class</option>
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
              value={exam}
              onChange={(e) => {
                setExam(e.target.value);
                setExistingResults([]);
                setStudentMarks({});
              }}
            >
              <option value="">select exam</option>
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
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setExistingResults([]);
              setStudentMarks({});
            }}
          >
            <option value="">select subject</option>
            {selectedClass &&
              subjects
                .filter((item) => {
                  const cls = item.class;
                  if (!cls) return false;
                  if (typeof cls === "string") return cls === selectedClass;
                  return cls._id === selectedClass;
                })
                .map((subjectItems) => (
                  <option value={subjectItems._id} key={subjectItems._id}>
                    {subjectItems.subjectName} {subjectItems.subjectCode}
                  </option>
                ))}
          </select>
        </div>

        {/* Student Marks Table */}
        {isFormFilled && (
          <div>
            {maxMark != null && (
              <p className="text-blue-600 my-4 font-semibold">
                Maximum Marks ({maxMark})
              </p>
            )}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Register No
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Student Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
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
                          value={
                            studentMarks[student._id] === undefined
                              ? ""
                              : studentMarks[student._id]
                          }
                          onChange={(e) =>
                            handleMarkChange(student._id, e.target.value)
                          }
                          placeholder={
                            maxMark != null ? `0 - ${maxMark} or A` : "mark or A"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading ? (
              <button
                className="bg-blue-400 text-white w-full mt-6 py-3 font-bold rounded shadow-md cursor-not-allowed"
                disabled
              >
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
        )}

        {!isFormFilled && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Please select Study Centre, Class, Exam and Subject to enter marks.
          </p>
        )}
      </div>
    </div>
  );
};

export default AddCceMark;