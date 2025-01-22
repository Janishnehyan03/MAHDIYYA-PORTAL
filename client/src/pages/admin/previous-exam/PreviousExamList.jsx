// src/components/PreviousExamList.jsx
import React, { useEffect, useState } from 'react';
import Axios from '../../../Axios';

const PreviousExamList = ({ onSelectExam }) => {
  const [previousExams, setPreviousExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl mb-6 font-bold">Previous Exams</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {previousExams.map(exam => (
          <div
            key={exam._id}
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 cursor-pointer"
            onClick={() => onSelectExam(exam)}
          >
            <h2 className="text-2xl font-semibold mb-2">{exam.className}</h2>
            <p className="text-gray-400">{exam.admission.admissionName}</p>
            <a href={exam.fileUrl} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">View File</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousExamList;