// src/components/PreviousExamList.jsx
import React from "react";

const PreviousExamList = ({ exams, loading, error, onSelectExam }) => {
  if (loading) {
    return (
      <div className="text-center text-gray-500 p-10">Loading exams...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center text-gray-500 p-10">
        No previous exams found.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Exams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="p-5 bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300 cursor-pointer group"
            onClick={() => onSelectExam(exam)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                  {exam.className}
                </h3>
                <p className="text-sm text-gray-500">
                  {exam.admission?.admissionName || "N/A"}
                </p>
              </div>
              <button className="text-sm text-gray-600 bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-700 py-1 px-3 rounded-full">
                Edit
              </button>
            </div>
            <a
              href={exam.fileUrl}
              className="text-blue-600 hover:underline mt-4 inline-block text-sm"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Prevents the card's onClick from firing when link is clicked
            >
              View Results
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousExamList;
