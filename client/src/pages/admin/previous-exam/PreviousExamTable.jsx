// src/components/PreviousExamList.jsx
import React, { useContext, useEffect, useState } from 'react';
import Axios from '../../../Axios';
import { UserAuthContext } from '../../../context/userContext';

const PreviousExamTable = () => {
  const [previousExams, setPreviousExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamData, setSelectedExamData] = useState(null);
  const { authData } = useContext(UserAuthContext);


  useEffect(() => {
    const fetchPreviousExams = async () => {
      try {
        const response = await Axios.get('/previous-exam');
        setPreviousExams(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPreviousExams();
  }, []);

  const fetchExamDetails = async (examId) => {
    try {
      const response = await Axios.get(`/previous-exam/${examId}`);
      setSelectedExamData(response.data.data); // Assuming the data is in the 'data' field
      console.log(response.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl mb-6 font-bold">Previous Exams</h1>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {previousExams.map((exam) => (
            <div
              key={exam._id}
              className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
            >
              <h2 className="text-2xl font-semibold mb-2">{exam.className}</h2>
              <p className="text-gray-400">{exam.admission.admissionName}</p>
              <a
                href="#"
                className="text-blue-400 underline"
                onClick={(e) => {
                  e.preventDefault();
                  fetchExamDetails(exam._id);
                }}
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      </div>
      {selectedExamData && selectedExamData.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-2">Exam Details</h2>
          <table className="table-auto w-full text-white">
            <tbody>
              {selectedExamData
                .filter((row) => {
                  // Modify studyCentreCode to add a space after "CA"
                  const modifiedStudyCentreCode = authData.branch.studyCentreCode.replace(
                    /^CA/,
                    "CA "
                  );
                  return row.includes(modifiedStudyCentreCode);
                })
                .slice(2) // Skip header rows if needed
                .map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PreviousExamTable;