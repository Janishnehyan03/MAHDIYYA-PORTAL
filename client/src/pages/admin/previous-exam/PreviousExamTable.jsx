// src/components/PreviousExamTable.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import Axios from '../../../Axios';
import { UserAuthContext } from '../../../context/userContext';

const PreviousExamTable = () => {
  // --- State Management ---
  const [previousExams, setPreviousExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedExamData, setSelectedExamData] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { authData } = useContext(UserAuthContext);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchPreviousExams = async () => {
      try {
        setLoading(true);
        const response = await Axios.get('/previous-exam');
        setPreviousExams(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch exam list.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousExams();
  }, []);

  const fetchExamDetails = async (examId) => {
    if (selectedExamId === examId) {
      // If the same exam is clicked again, toggle the details view off
      setSelectedExamId(null);
      setSelectedExamData(null);
      return;
    }

    setIsDetailsLoading(true);
    setSelectedExamId(examId);
    setSelectedExamData(null); // Clear previous data
    try {
      const response = await Axios.get(`/previous-exam/${examId}`);
      setSelectedExamData(response.data.data); // Assuming the detailed data is in response.data.data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exam details.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // --- Memoized Data Processing ---
  // Memoize the filtered data to avoid re-calculating on every render.
  const filteredExamResults = useMemo(() => {
    if (!selectedExamData || !authData?.branch?.studyCentreCode) return null;

    // This logic assumes the API returns an array of arrays (like a CSV/Excel sheet).
    // It filters rows based on a study centre code that needs a space added.
    // NOTE: This is brittle. Ideally, the API would provide structured JSON.
    const modifiedStudyCentreCode = authData.branch.studyCentreCode.replace(/^CA/, "CA ");
    
    return selectedExamData.filter(row => Array.isArray(row) && row.some(cell => typeof cell === 'string' && cell.includes(modifiedStudyCentreCode)));
  }, [selectedExamData, authData]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500">
        <i className="fas fa-spinner fa-spin fa-2x mb-4"></i>
        <p className="text-lg">Loading Exam List...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-red-700 bg-red-100 rounded-lg shadow-sm">
        <i className="fas fa-exclamation-triangle fa-2x mb-4"></i>
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }
  
  if (previousExams.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <i className="fas fa-inbox fa-3x mb-4"></i>
        <h3 className="text-xl font-semibold">No Previous Exams Found</h3>
        <p className="mt-1 text-sm">Published exam results will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <i className="fas fa-history text-blue-500 text-2xl mr-3"></i>
        <h1 className="text-3xl font-bold text-gray-800">Previous Exam Results</h1>
      </div>

      {/* Exam Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {previousExams.map((exam) => (
          <div
            key={exam._id}
            onClick={() => fetchExamDetails(exam._id)}
            className={`p-5 bg-white rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
              selectedExamId === exam._id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
            }`}
          >
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {exam.className}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{exam.admission.admissionName}</p>
            <button className="text-sm font-medium text-blue-600 mt-4">
              {selectedExamId === exam._id ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        ))}
      </div>

      {/* Details Section */}
      {(isDetailsLoading || selectedExamData) && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Exam Details</h2>
            <button
              onClick={() => { setSelectedExamId(null); setSelectedExamData(null); }}
              className="text-gray-500 hover:text-red-600 transition"
              title="Close"
            >
              <i className="fas fa-times fa-lg"></i>
            </button>
          </div>
          
          {isDetailsLoading ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <i className="fas fa-spinner fa-spin mr-3"></i> Loading Details...
            </div>
          ) : (
            filteredExamResults && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {/* Assuming the first row of filtered data is the header */}
                    <tr>
                      {filteredExamResults[0]?.map((header, index) => (
                        <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* The rest of the rows are the body */}
                    {filteredExamResults.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {filteredExamResults.length <= 1 && (
                      <tr>
                        <td colSpan={filteredExamResults[0]?.length || 1} className="text-center py-8 text-gray-500">
                           No results found for your study centre.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PreviousExamTable;