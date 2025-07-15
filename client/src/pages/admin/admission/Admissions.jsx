import React, { useEffect, useState } from "react";
import Axios from "../../../Axios"; // Assuming this path is correct
import moment from "moment";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faUserPlus } from "@fortawesome/free-solid-svg-icons";

// --- Reusable Helper Components ---

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-lg">
      <FontAwesomeIcon icon={faCheckCircle} className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="mt-2 text-xl font-semibold text-gray-800">All caught up!</h3>
      <p className="mt-1 text-sm text-gray-500">There are no pending admission requests.</p>
    </div>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, studentName, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <FontAwesomeIcon icon={faUserPlus} className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Approve Admission
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to approve the admission for{" "}
                  <strong className="text-gray-700">{studentName}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Approving..." : "Confirm & Approve"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Main Admissions Component ---

function Admissions() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  const getAdmissions = async () => {
    setIsLoading(true);
    try {
      const { data } = await Axios.get("/student/my-admissions/data");
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch admissions:", error);
      toast.error("Could not fetch admission requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleConfirmApproval = async () => {
    if (!selectedStudent) return;

    setIsApproving(true);
    try {
      await Axios.patch(`/student/${selectedStudent._id}`, { verified: true });
      
      // Optimistic UI update: remove student from the list immediately
      setStudents((prevStudents) => 
        prevStudents.filter((s) => s._id !== selectedStudent._id)
      );

      toast.success(`Admission for ${selectedStudent.studentName} approved!`);
      setIsModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to approve admission:", error);
      toast.error("Failed to approve admission. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  useEffect(() => {
    getAdmissions();
  }, []);

  return (
    <>
      <main className="bg-gray-100 min-h-screen">
        <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Admission Requests</h1>
                <p className="mt-1 text-sm text-gray-500">Review and approve new student admission requests.</p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {isLoading ? (
              <LoadingSpinner />
            ) : students.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{student.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class.className}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{moment(student.createdAt).format("DD MMM YYYY")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleApproveClick(student)}
                          className="text-white bg-blue-600 hover:bg-blue-700 font-semibold px-4 py-2 rounded-md shadow-sm transition-colors duration-200"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmApproval}
        studentName={selectedStudent?.studentName}
        isLoading={isApproving}
      />
    </>
  );
}

export default Admissions;