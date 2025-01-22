// src/components/PreviousExamManagement.jsx
import React, { useState } from 'react';
import CreateOrUpdatePreviousExam from './CreateOrUpdatePreviousExam';
import PreviousExamList from './PreviousExamList';

const PreviousExamManagement = () => {
  const [selectedExam, setSelectedExam] = useState(null);

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
  };

  const clearSelectedExam = () => {
    setSelectedExam(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-6">Previous Exam Management</h1>
        <CreateOrUpdatePreviousExam
          selectedExam={selectedExam}
          clearSelectedExam={clearSelectedExam}
        />
        <PreviousExamList onSelectExam={handleSelectExam} />
      </div>
    </div>
  );
};

export default PreviousExamManagement;