import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../Axios";

const TransferStudent = () => {
  const [student, setStudent] = useState(null);
  const [studyCentres, setStudyCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [loading, setLoading] = useState(false);

  const { studentId } = useParams(); // Replace with dynamic ID from route or context

  // Fetch student details
  useEffect(() => {
    Axios.get(`/student/${studentId}`).then((res) => {
      setStudent(res.data);
    });

    // Fetch all study centres
    Axios.get("/study-centre").then((res) => {
      setStudyCentres(res.data.docs);
    });
  }, [studentId]);

  const handleTransfer = async () => {
    if (!selectedCentre || !transferReason) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      await Axios.patch(`/student/${studentId}`, {
        studyCentre: selectedCentre,
        transferReason,
        transferredFrom: student.branch._id, // Add transferredFrom field
      });
      alert("Student transferred successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to transfer student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-4">
        Transfer Student
      </h1>

      {student ? (
        <div className="space-y-8">
          {/* Student Details */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Student Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p className="text-gray-600">
                <strong className="text-gray-800">Name:</strong>{" "}
                {student.studentName}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-800">Register No:</strong>{" "}
                {student.registerNo}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-800">Father's Name:</strong>{" "}
                {student.fatherName}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-800">Class:</strong>{" "}
                {student.class.className}
              </p>
              <p className="text-gray-600">
                <strong className="text-gray-800">Current Study Centre:</strong>{" "}
                {student.branch?.studyCentreName}
              </p>
              {student.transferredFrom && (
                <p className="text-gray-600">
                  <strong className="text-gray-800">Transferred From:</strong>{" "}
                  {student.transferredFrom.studyCentreName}
                </p>
              )}
            </div>
          </div>

          {/* Study Centre Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select New Study Centre
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
            >
              <option value="">Select a study centre</option>
              {studyCentres
                .sort((a, b) =>
                  a.studyCentreName.localeCompare(b.studyCentreName)
                )
                .map((centre) => (
                  <option key={centre._id} value={centre._id}>
                    {centre.studyCentreName}
                  </option>
                ))}
            </select>
          </div>

          {/* Transfer Reason */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Transfer Reason
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={4}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Enter the reason for transfer..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleTransfer}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-5 rounded-lg font-medium text-lg shadow-lg hover:from-teal-600 hover:to-teal-700 transition-transform transform hover:scale-105 duration-150"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Transfer Student"
            )}
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading student details...</p>
      )}
    </div>
  );
};

export default TransferStudent;
