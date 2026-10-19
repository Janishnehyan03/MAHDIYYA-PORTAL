import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
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
  const maxMark = selectedExam?.maxPaperMark ?? null; // can be null

  // ---------- EXCEL DEMO & IMPORT HANDLERS ----------
  const handleDownloadDemoExcel = () => {
    if (!students.length) {
      toast.warn("No students found for this Class and Study Centre.");
      return;
    }
    const curClass = classes.find((c) => c._id?.toString() === selectedClass?.toString());
    const curSubject = subjects.find((s) => s._id?.toString() === subject?.toString());
    const className = curClass?.className || "Class";
    const subjectName = curSubject?.subjectName || "Subject";
    const markColHeader = `SA Mark (Max ${maxMark || 100})`;

    const rows = [
      ["Sl No", "Register No", "Student Name", markColHeader],
    ];

    students.forEach((student, idx) => {
      const curMark = studentMarks[student._id] ?? "";
      rows.push([
        idx + 1,
        student.registerNo || "",
        student.studentName || "",
        curMark,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 8 }, { wch: 18 }, { wch: 30 }, { wch: 24 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SA Marks");

    XLSX.writeFile(
      workbook,
      `SA_Mark_Entry_${className}_${subjectName}.xlsx`
    );
    toast.success("Demo Excel file downloaded successfully!");
  };

  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!students.length) {
      toast.warn("Please select Study Centre, Class, Exam, and Subject first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rows.length) {
          toast.warn("The uploaded Excel file has no data rows.");
          return;
        }

        const studentRegMap = new Map();
        students.forEach((s) => {
          if (s.registerNo) {
            studentRegMap.set(s.registerNo.trim().toUpperCase(), s);
          }
        });

        let updatedCount = 0;
        let invalidCount = 0;
        const newMarks = { ...studentMarks };

        rows.forEach((row) => {
          const regKey = Object.keys(row).find((k) =>
            k.toLowerCase().includes("reg")
          );
          if (!regKey) return;

          const regVal = String(row[regKey] || "").trim().toUpperCase();
          if (!regVal) return;

          const student = studentRegMap.get(regVal);
          if (!student) {
            invalidCount++;
            return;
          }

          const markKey = Object.keys(row).find((k) => {
            const lk = k.toLowerCase();
            return (
              lk.includes("sa") ||
              lk.includes("mark") ||
              lk.includes("score") ||
              lk.includes("obtained")
            );
          });

          if (!markKey) return;
          const rawVal = row[markKey];
          const rawStr = String(rawVal ?? "").trim().toUpperCase();

          if (rawStr === "" || rawStr === "-") {
            newMarks[student._id] = "";
            updatedCount++;
          } else if (rawStr === "A") {
            newMarks[student._id] = "A";
            updatedCount++;
          } else {
            const num = Number(rawStr);
            if (!Number.isNaN(num) && num >= 0 && (maxMark == null || num <= maxMark)) {
              newMarks[student._id] = num;
              updatedCount++;
            } else {
              invalidCount++;
            }
          }
        });

        setStudentMarks(newMarks);
        toast.success(`Successfully loaded marks for ${updatedCount} student(s) from Excel!`);
        if (invalidCount > 0) {
          toast.warn(`${invalidCount} row(s) had unrecognized register numbers or marks exceeding maximum (${maxMark}).`);
        }
      } catch (err) {
        console.error("Excel import error:", err);
        toast.error("Failed to parse Excel file. Please use the downloaded demo format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // ---------- MARK INPUT HANDLER ----------
  const handleMarkChange = (studentId, value) => {
    const raw = value ?? "";
    const trimmed = raw.trim().toUpperCase();

    // Empty input: clear mark
    if (trimmed === "") {
      setStudentMarks((prev) => ({
        ...prev,
        [studentId]: "",
      }));
      return;
    }

    // Absent: "A"
    if (trimmed === "A") {
      setStudentMarks((prev) => ({
        ...prev,
        [studentId]: "A",
      }));
      return;
    }

    // Numeric marks
    const num = Number(trimmed);

    if (Number.isNaN(num) || num < 0) {
      toast.warn(
        "Please enter a valid non-negative number or 'A' for absent.",
        {
          autoClose: 2000,
          position: "top-center",
        }
      );
      return;
    }

    // If maxMark is defined, enforce upper limit
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBranch || !selectedClass || !exam || !subject) {
      toast.error(
        "Please select all fields: Centre, Class, Exam, and Subject."
      );
      return;
    }

    if (!window.confirm("Are you sure you want to submit this result?")) return;

    setLoading(true);
    try {
      const newResults = [];
      const updateResults = [];

      students.forEach((student) => {
        const existingResult = existingResults.find(
          (result) => result?.student?._id === student._id
        );

        const markValue = studentMarks[student._id];

        // If no value and no existing result, skip (no change)
        if ((markValue === undefined || markValue === "") && !existingResult) {
          return;
        }

        const marksObtained =
          markValue === "A"
            ? "A"
            : markValue === "" || markValue === undefined
            ? 0
            : Number(markValue);

        // Payload for new result
        const basePayload = {
          student: student._id,
          exam,
          marksObtained,
          class: selectedClass,
          subject,
        };

        if (existingResult && existingResult._id) {
          // Update existing
          updateResults.push({
            _id: existingResult._id,
            marksObtained,
          });
        } else {
          // Create new
          newResults.push(basePayload);
        }
      });

      if (!newResults.length && !updateResults.length) {
        toast.info("No changes to submit.", {
          autoClose: 2000,
          position: "top-center",
        });
        setLoading(false);
        return;
      }

      // POST all new results in one request (backend accepts array or single)
      if (newResults.length) {
        await Axios.post("/result", newResults);
      }

      // PATCH all updates in one request (backend expects array)
      if (updateResults.length) {
        await Axios.patch("/result", updateResults);
      }

      toast.success("Marks submitted successfully!", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });

      // Refresh existing results so marks re-load correctly
      fetchExistingResults();
    } catch (error) {
      console.error("Error submitting marks:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "An error occurred while submitting.",
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- FETCH EXISTING RESULTS ----------
  const fetchExistingResults = useCallback(async () => {
    if (selectedClass && selectedBranch && exam && subject) {
      try {
        const response = await Axios.get(
          `/result/fetch?examId=${exam}&subjectId=${subject}&classId=${selectedClass}`
        );

        const fetchedResults = response.data || [];
        setExistingResults(fetchedResults);

        // Map studentId -> mark (keep "A" or number)
        const marks = fetchedResults.reduce((acc, result) => {
          const studentId = result?.student?._id;
          if (!studentId) return acc;

          // If backend sends "A" for absent or number for marks
          acc[studentId] = result.marksObtained ?? "";
          return acc;
        }, {});
        setStudentMarks(marks);
      } catch (error) {
        console.error("Error fetching existing results:", error);
        setExistingResults([]);
        setStudentMarks({});
      }
    } else {
      // Clear when filters not complete
      setExistingResults([]);
      setStudentMarks({});
    }
  }, [selectedClass, selectedBranch, exam, subject]);

  // ---------- BRANCHES ----------
  const getAllBranches = useCallback(async () => {
    try {
      const branchQuery = authData?.branch?._id
        ? `&_id=${authData.branch._id}`
        : "";
      const response = await Axios.get(
        `/study-centre?sort=studyCentreName${branchQuery}`
      );
      setBranches(response.data.docs || []);
    } catch (error) {
      console.error("Error fetching branches:", error?.response || error);
    }
  }, [authData?.branch]);

  // ---------- SUBJECTS ----------
  const getAllSubjects = useCallback(async () => {
    try {
      const response = await Axios.get("/subject");
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }, []);

  // ---------- STUDENTS ----------
  const getStudents = useCallback(async () => {
    if (selectedBranch && selectedClass) {
      try {
        const response = await Axios.get(
          `/student/data/${selectedBranch}/${selectedClass}`
        );
        setStudents(response.data || []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
  }, [selectedBranch, selectedClass]);

  // When filters change, refetch students + results
  useEffect(() => {
    getStudents();
    fetchExistingResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedBranch, exam, subject]);

  // Initial loads (classes, exams, subjects, branches)
  useEffect(() => {
    getClasses();
    getExams(true);
    getAllSubjects();
    getAllBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // or [] if you only want it once on mount

  const isFormFilled = !!(selectedBranch && selectedClass && exam && subject);

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
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Study Centre
              </label>
              <select
                id="branch"
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setStudents([]);
                  setExistingResults([]);
                  setStudentMarks({});
                }}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Study Centre</option>
                {branches
                  .filter((branch) => branch.isActive !== false)
                  .map((branch) => (
                    <option value={branch._id} key={branch._id}>
                      {branch.studyCentreName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Class Selection */}
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setStudents([]);
                  setExistingResults([]);
                  setStudentMarks({});
                }}
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
              <label
                htmlFor="exam"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Exam
              </label>
              <select
                id="exam"
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  setExistingResults([]);
                  setStudentMarks({});
                }}
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
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setExistingResults([]);
                  setStudentMarks({});
                }}
                disabled={!selectedClass}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Subject</option>
                {selectedClass &&
                  subjects
                    .filter((item) => {
                      // support both item.class = id or populated object
                      const cls = item.class;
                      if (!cls) return false;
                      if (typeof cls === "string") return cls === selectedClass;
                      return cls._id === selectedClass;
                    })
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 my-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div>
                  {maxMark != null && (
                    <p className="text-blue-900 font-bold text-sm">
                      Maximum Marks: <span className="text-indigo-700 font-extrabold">{maxMark}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Enter marks manually or use the Demo Excel workflow.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadDemoExcel}
                    disabled={!students.length}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition shadow-xs disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download Demo Excel
                  </button>
                  <label className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-xs cursor-pointer">
                    <FontAwesomeIcon icon={faFileExcel} />
                    Import Filled Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleImportExcel}
                      disabled={!students.length}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Register No
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Student Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Marks Obtained
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student?.registerNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {student.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-24 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                              value={
                                studentMarks[student._id] ?? "" // null/undefined -> ""
                              }
                              placeholder="mark / A"
                              onChange={(e) =>
                                handleMarkChange(student._id, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-10 text-gray-500"
                        >
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
