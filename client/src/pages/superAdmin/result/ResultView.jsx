import React, { useState, useEffect, useCallback, useContext } from "react";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";
import Loading from "../../../components/Loading";

function ResultView() {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
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

  const getClasses = async () => {
    try {
      let { data } = await Axios.get(`/class`);
      setClasses(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const getExams = async () => {
    try {
      let { data } = await Axios.get(`/exam`);
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
      console.log(data);

      setResults(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setResults([]);
      console.log(error.response);
    }
  }, [examId, classId, studyCentreId, authData?.branch?._id, authData.role]);

  useEffect(() => {
    getClasses();
    getBranches();
    getExams();
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

  return (
    <div>
      <h1 className="text-3xl my-4 font-bold text-center">Exam Results </h1>
      <div className=" m-4">
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  lg:w-1/2 w-full mx-auto my-2 p-2.5"
          onChange={(e) => setClassId(e.target.value)}
        >
          <option hidden>select class </option>
          {classes.map((item, key) => (
            <option key={key} value={item._id}>
              {item.className}
            </option>
          ))}
        </select>
        {authData.role === "superAdmin" && (
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  lg:w-1/2 w-full mx-auto my-2 p-2.5"
            onChange={(e) => setStudyCentreId(e.target.value)}
          >
            <option hidden>select study centre </option>
            {branches.map((item, key) => (
              <option key={key} value={item._id}>
                {item.studyCentreName}
              </option>
            ))}
          </select>
        )}
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  lg:w-1/2 w-full mx-auto my-2 p-2.5"
          onChange={(e) => setExamId(e.target.value)}
        >
          <option hidden>select exam </option>
          {exams.map((item, key) => (
            <option key={key} value={item._id}>
              {item.examName}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto m-10">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Regiter No</th>
                <th>Student</th>
                {Array.from(subjectNames).map((subjectName) => (
                  <th key={subjectName}>{subjectName}</th>
                ))}
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Rank</th>
                <th>Passed</th>
              </tr>
            </thead>
            <tbody>
              {authData.role === "superAdmin"
                ? results
                    .filter((result) => result.student.branch === studyCentreId)
                    .map((result, index) => {
                      return (
                        <ResultTableRow
                          result={result}
                          index={index}
                          subjectNames={subjectNames}
                        />
                      );
                    })
                : results
                    .filter(
                      (result) => result.student.branch === authData.branch._id
                    )
                    .map((result, key) => (
                      <ResultTableRow
                        result={result}
                        key={key}
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

function ResultTableRow({ result, index, subjectNames }) {
  return (
    <tr key={index} className="border-b border-neutral-200">
      <td className="text-sm">{index + 1}</td>
      <td className="text-sm">{result.student?.registerNo}</td>
      <td className="text-sm">{result.student?.studentName}</td>
      {Array.from(subjectNames).map((subjectName) => {
        // Find exam and CCE results for the subject
        const examResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName && sr.type === "exam"
        );
        const cceResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName && sr.type === "cce"
        );

        return (
          <td
            className="whitespace-nowrap text-sm text-center px-6 py-4"
            key={subjectName}
          >
            {examResult && (
              <span
                className={`inline-block px-2 py-1 ${
                  examResult.marksObtained >= 40 ? "bg-gray-200" : "bg-red-400"
                }`}
              >
                {examResult.marksObtained ? examResult.marksObtained : "N/A"}
              </span>
            )}
            {cceResult && (
              <span
                className={`inline-block px-2 py-1 ml-1 bg-gray-600 text-white`}
              >
                {cceResult.marksObtained ? cceResult.marksObtained : "N/A"}
              </span>
            )}
          </td>
        );
      })}
      <td className="whitespace-nowrap text-sm text-center px-6 py-4">
        {result.marksObtained}
      </td>
      <td className="whitespace-nowrap text-sm text-center px-6 py-4">
        {result.percentage.toFixed(2)}%
      </td>
      <td className="whitespace-nowrap text-sm text-center px-6 py-4">
        {result.rank}
      </td>
      <td
        className={`whitespace-nowrap text-sm text-center px-6 py-4 ${
          result.passed ? "bg-green-500 text-white" : "bg-red-700 text-white"
        }`}
      >
        {result.passed ? "Yes" : "No"}
      </td>
    </tr>
  );
}

export default ResultView;
