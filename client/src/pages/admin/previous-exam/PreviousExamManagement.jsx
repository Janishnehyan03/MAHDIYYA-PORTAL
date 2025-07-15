// src/components/PreviousExamManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Axios from '../../../Axios';
import CreateOrUpdatePreviousExam from './CreateOrUpdatePreviousExam';
import PreviousExamList from './PreviousExamList';

const PreviousExamManagement = () => {
  const [previousExams, setPreviousExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Centralized function to fetch exams. Can be called to refresh data.
  const fetchPreviousExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Axios.get('/previous-exam');
      setPreviousExams(response.data);
    } catch (err) {
      setError('Failed to fetch previous exams.');
      toast.error('Failed to fetch previous exams.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exams on initial component mount
  useEffect(() => {
    fetchPreviousExams();
  }, [fetchPreviousExams]);

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
  };

  const clearSelectedExam = () => {
    setSelectedExam(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Previous Exam Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <CreateOrUpdatePreviousExam
              selectedExam={selectedExam}
              clearSelectedExam={clearSelectedExam}
              onSuccess={fetchPreviousExams} // Pass the fetch function as a success callback
            />
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <PreviousExamList
              exams={previousExams}
              loading={loading}
              error={error}
              onSelectExam={handleSelectExam}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviousExamManagement;