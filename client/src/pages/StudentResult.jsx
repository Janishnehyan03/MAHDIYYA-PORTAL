import React, { useEffect, useState, useRef } from "react";
import Axios from "../Axios";
import ReactToPrint from "react-to-print";

const StudentResultPage = () => {
  const ref = useRef();

  const [registerNumber, setRegisterNumber] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [cceResults, setCceResults] = useState([]);
  const [examId, setExamId] = useState("");
  const [exams, setExams] = useState([]);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState("");

  // Fetch exams once
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await Axios.get(`/exam?isActive=true`);
        setExams(response.data);
      } catch (error) {
        setExams([]);
      }
    };
    fetchExams();
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResultData(null);
    setStudentResults([]);
    setCceResults([]);
    try {
      const response = await Axios.get(`/result/${examId}/${registerNumber}`);
      if (response.data?.results?.length || response.data?.cceResults?.length) {
        setResultData(response.data);
        setStudentResults(response.data?.results || []);
        setCceResults(response.data?.cceResults || []);
      } else {
        setError("No results found for this student and exam.");
      }
    } catch (error) {
      setError("Error fetching student results.");
    }
  };

  // Merge results and CCE by subject for combined table
  const mergedSubjects = React.useMemo(() => {
    const examSubjects = studentResults.map((res) => res.subject?.subjectName);
    const cceSubjects = cceResults.map((res) => res.subject?.subjectName);
    const allSubjects = Array.from(new Set([...examSubjects, ...cceSubjects]));

    return allSubjects.map((subject) => {
      const exam = studentResults.find(
        (res) => res.subject?.subjectName === subject
      );
      const cce = cceResults.find(
        (res) => res.subject?.subjectName === subject
      );
      const examMark = exam?.marksObtained ?? "-";
      const cceMark = cce?.cceMark ?? "-";
      let total = "-";
      if (
        examMark !== "-" &&
        cceMark !== "-" &&
        examMark !== "A" &&
        cceMark !== "A"
      ) {
        total = Number(examMark) + Number(cceMark);
      } else if (examMark === "A" || cceMark === "A") {
        total = "A";
      } else if (examMark !== "-" && cceMark === "-") {
        total = examMark;
      } else if (examMark === "-" && cceMark !== "-") {
        total = cceMark;
      }
      const maxMarks =
        exam?.subject?.totalMarks ||
        cce?.maxMarks ||
        exam?.maxMarks ||
        100;
      return {
        subject,
        examMark,
        cceMark,
        total,
        maxMarks,
      };
    });
  }, [studentResults, cceResults]);

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4 border border-slate-200"
      >
        <div className="mb-4">
          <label
            htmlFor="registerNumber"
            className="block text-slate-700 text-sm font-bold mb-2"
          >
            Enter Register Number:
          </label>
          <input
            type="text"
            id="registerNumber"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            className="w-full border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="examSelect"
            className="block text-slate-700 text-sm font-bold mb-2"
          >
            Select Exam:
          </label>
          <select
            id="examSelect"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className="w-full border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Exam</option>
            {exams.map((item) => (
              <option key={item._id} value={item._id}>
                {item.examName}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition"
          >
            Submit
          </button>
        </div>
      </form>
      {error && (
        <div className="max-w-sm mx-auto rounded bg-red-100 text-red-600 px-4 py-3 mb-4 text-center font-semibold">
          {error}
        </div>
      )}

      {(studentResults.length > 0 || cceResults.length > 0) && resultData && (
        <>
          <div
            className="bg-white my-4 p-8 shadow-lg rounded-xl border border-slate-200"
            ref={ref}
          >
            <img src="/logo.png" className="h-20 mx-auto mb-4" alt="logo" />
            <div className="p-2 mb-6 text-center">
              <p className="text-lg font-semibold text-blue-700 mb-2 uppercase">
                {studentResults[0]?.exam?.examName}
              </p>
              <p className="text-slate-700 mb-1">
                Student Name: <span className="font-semibold">{resultData?.student?.studentName}</span>
              </p>
              <p className="text-slate-700 mb-1">
                Register No: <span className="font-semibold">{resultData?.student?.registerNo}</span>
              </p>
              <p className="text-slate-700 mb-1">
                Study Centre: <span className="font-semibold">{resultData?.student?.branch?.studyCentreName}</span>
              </p>
              <p className="text-slate-700 mb-1">
                Class: <span className="font-semibold">{resultData?.student?.class?.className}</span>
              </p>
            </div>
            {/* Combined Table */}
            <table className="w-full table-auto border rounded-xl mb-6 bg-slate-50">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">
                    Subject
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">
                    Exam Marks
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">
                    CCE Marks
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">
                    Total
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">
                    Max Marks
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mergedSubjects.map((row) => (
                  <tr key={row.subject} className="even:bg-white odd:bg-slate-50">
                    <td className="px-4 py-3 text-center font-medium">{row.subject}</td>
                    <td className="px-4 py-3 text-center">{row.examMark}</td>
                    <td className="px-4 py-3 text-center text-indigo-700 font-semibold">{row.cceMark}</td>
                    <td className="px-4 py-3 text-center font-bold text-green-700">
                      {row.total}
                    </td>
                    <td className="px-4 py-3 text-center">{row.maxMarks}</td>
                    <td
                      className={`px-4 py-3 text-center font-semibold ${
                        (row.total !== "-" && row.total !== "A" && Number(row.total) >= 40)
                          ? "text-green-600"
                          : row.total === "A"
                          ? "text-orange-500"
                          : "text-red-600"
                      }`}
                    >
                      {row.total === "A"
                        ? "Absent"
                        : row.total !== "-" && Number(row.total) >= 40
                        ? "P"
                        : "F"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mx-auto bg-blue-50 rounded-lg flex flex-col md:flex-row justify-center md:justify-around items-center mt-4 p-4 gap-2">
              <p className="text-blue-800 font-semibold p-2">
                Grand Total: {resultData.grandTotal}
              </p>
              <p className="text-blue-800 font-semibold p-2">
                Percentage: {resultData.percentage}%
              </p>
            </div>
            <div className="p-3 text-center bg-blue-100 mt-4 w-full rounded-lg">
              <h1 className="font-semibold text-blue-800">CPET DARUL HUDA</h1>
              <a href="https://cpetdhiu.in" className="text-blue-600 hover:underline">cpetdhiu.in</a>
            </div>
          </div>
          <ReactToPrint
            bodyClass="print-agreement"
            content={() => ref.current}
            documentTitle={
              resultData?.student?.studentName +
              "-" +
              resultData?.student?.registerNo
            }
            trigger={() => (
              <div className="flex flex-col ">
                <button
                  className="text-center bg-blue-600 px-4 py-2 text-white mx-auto rounded-lg mt-2 font-semibold"
                  type="primary"
                >
                  Print Result
                </button>
              </div>
            )}
          />
        </>
      )}
    </div>
  );
};

export default StudentResultPage;