import React, { useCallback, useContext, useEffect, useState } from "react";
import Axios from "../../../Axios";
import Loading from "../../../components/Loading";
import { ClassContext } from "../../../context/classContext";
import { UserAuthContext } from "../../../context/userContext";
import * as XLSX from "xlsx"; // Import the XLSX library

function ResultView() {
  const [exams, setExams] = useState([]);
  const { classes, getClasses } = useContext(ClassContext);

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [classId, setClassId] = useState(null);
  const [examId, setExamId] = useState(null);
  const [studyCentreId, setStudyCentreId] = useState(null);

  const [results, setResults] = useState([]);

  const { authData } = useContext(UserAuthContext);

  const getBranches = async () => {
    try {
      let { data } = await Axios.get(`/study-centre?sort=studyCentreName`);
      setBranches(data.docs);
    } catch (error) {
      console.log(error.response);
    }
  };
  const getExams = async () => {
    try {
      let { data } = await Axios.get(`/exam?isActive=true`);
      setExams(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const getResults = useCallback(async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get(
        `/result?examId=${examId}&classId=${classId}&studyCentreId=${
          authData.role === "superAdmin" ? studyCentreId : authData.branch._id
        }`
      );
      setResults(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setResults([]);
      console.log(error.response);
    }
  }, [examId, classId, studyCentreId, authData?.branch?._id, authData.role]);

  useEffect(() => {
    getExams();
    getClasses();
    getBranches();
  }, []);

  useEffect(() => {
    if (examId && classId && (studyCentreId || authData.branch._id)) {
      getResults();
    }
  }, [examId, classId, studyCentreId, authData?.branch?._id, getResults]);

  const subjectNames = new Set();
  results.forEach((result) => {
    result.subjectResults.forEach((subjectResult) => {
      subjectNames.add(subjectResult.subject.subjectName);
    });
  });

  // Function to download the results as an Excel file
  const downloadExcel = (branchName, className) => {
    const worksheetData = results.map((result, index) => {
      const rowData = {
        Index: index + 1,
        RegisterNo: result.student?.registerNo || "N/A",
        StudentName: result.student?.studentName || "N/A",
      };

      subjectNames.forEach((subjectName) => {
        const examResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName && sr.type === "exam"
        );
        const cceResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName && sr.type === "cce"
        );

        const cceMarks = cceResult?.marksObtained ?? 0;
        const saMarks = examResult?.marksObtained ?? 0;
        const totalMarks = cceMarks + saMarks;

        rowData[`${subjectName} FA`] = cceResult ? cceMarks : "-";
        rowData[`${subjectName} SA`] = examResult ? saMarks : "-";
        rowData[`${subjectName} Total`] =
          cceResult || examResult ? totalMarks : "-";
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    XLSX.writeFile(workbook, `${branchName}(${className}).xlsx`);
  };

  return (
    <div>
      <h1 className="text-3xl my-4 font-bold text-center">SA Results</h1>
      <div className="m-4">
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-1/2 w-full mx-auto my-2 p-2.5"
          onChange={(e) => setClassId(e.target.value)}
        >
          <option hidden>select class</option>
          {classes.map((item, key) => (
            <option key={key} value={item._id}>
              {item.className}
            </option>
          ))}
        </select>
        {authData.role === "superAdmin" && (
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-1/2 w-full mx-auto my-2 p-2.5"
            onChange={(e) => setStudyCentreId(e.target.value)}
          >
            <option hidden>select study centre</option>
            {branches.map((item, key) => (
              <option key={key} value={item._id}>
                {item.studyCentreName}
              </option>
            ))}
          </select>
        )}
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block lg:w-1/2 w-full mx-auto my-2 p-2.5"
          onChange={(e) => setExamId(e.target.value)}
        >
          <option hidden>select exam</option>
          {exams?.map((item, key) => (
            <option key={key} value={item._id}>
              {item.examName}
            </option>
          ))}
        </select>
      </div>
      {results.length > 0 && (
        <div className="flex justify-center my-4">
          <button
            onClick={() =>
              downloadExcel(
                results[0].student?.branch?.studyCentreName,
                results[0].student?.class?.className
              )
            }
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Download as Excel
          </button>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto m-10">
          <table className="table-auto w-full border border-collapse border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2" rowSpan="2">
                  #
                </th>
                <th className="border border-gray-300 p-2" rowSpan="2">
                  Register No
                </th>
                <th className="border border-gray-300 p-2" rowSpan="2">
                  Student
                </th>
                {Array.from(subjectNames).map((subjectName) => (
                  <th
                    key={subjectName}
                    className="border border-gray-300 text-center p-2"
                    colSpan="3"
                  >
                    {subjectName}
                  </th>
                ))}
              </tr>
              <tr>
                {Array.from(subjectNames).flatMap((subjectName) => [
                  <th
                    key={`${subjectName}-cce`}
                    className="border border-gray-300 text-center p-2"
                  >
                    <div className="flex flex-col text-xs">
                      <p>FA</p>
                    </div>
                  </th>,
                  <th
                    key={`${subjectName}-sa`}
                    className="border border-gray-300 text-center p-2"
                  >
                    <div className="flex flex-col text-xs">
                      <p>SA </p>
                    </div>
                  </th>,
                  <th
                    key={`${subjectName}-total`}
                    className="border border-gray-300 text-center p-2"
                  >
                    <div className="flex flex-col text-xs">
                      <p>Total</p>
                    </div>
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {authData.role === "superAdmin"
                ? results
                    .filter(
                      (result) => result.student.branch?._id === studyCentreId
                    )
                    .map((result, index) => (
                      <ResultTableRow
                        key={result.student.registerNo}
                        result={result}
                        index={index}
                        subjectNames={subjectNames}
                      />
                    ))
                : results
                    .filter(
                      (result) =>
                        result.student.branch?._id === authData.branch._id
                    )
                    .map((result, index) => (
                      <ResultTableRow
                        key={result.student.registerNo}
                        result={result}
                        index={index}
                        subjectNames={subjectNames}
                      />
                    ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const ResultTableRow = ({ result, index, subjectNames }) => {
  return (
    <tr>
      <td className="border border-gray-300 text-center p-2">{index + 1}</td>
      <td className="border border-gray-300 text-center p-2">
        {result.student?.registerNo || "N/A"}
      </td>
      <td className="border border-gray-300 text-center p-2">
        {result.student?.studentName || "N/A"}
      </td>
      {Array.from(subjectNames).flatMap((subjectName) => {
        const examResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName && sr.type === "exam"
        );
        const cceResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName && sr.type === "cce"
        );

        const cceMarks = cceResult?.marksObtained ?? 0;
        const saMarks = examResult?.marksObtained ?? 0;
        const totalMarks = cceMarks + saMarks;

        return [
          <td
            key={`${subjectName}-cce`}
            className="border border-gray-300 text-center p-2"
          >
            {cceResult ? cceMarks : "-"}
          </td>,
          <td
            key={`${subjectName}-sa`}
            className="border border-gray-300 text-center p-2"
          >
            {examResult ? saMarks : "-"}
          </td>,
          <td
            key={`${subjectName}-total`}
            className="border border-gray-300 text-center p-2"
          >
            {cceResult || examResult ? totalMarks : "-"}
          </td>,
        ];
      })}
    </tr>
  );
};

export default ResultView;
