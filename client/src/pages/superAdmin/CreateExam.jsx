import { faEdit, faTrashAlt, faPlus, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Axios from "../../Axios";

// Main Component
function CreateEditExam() {
  const initialFormState = {
    examName: "",
    academicYear: "",
    maxCceMark: "",
    maxPaperMark: "",
    isActive: false,
  };

  const [examData, setExamData] = useState(initialFormState);
  const [exams, setExams] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Ref for scrolling to the form on edit
  const formRef = useRef(null);

  // --- Data Fetching ---
  const getExams = async () => {
    try {
      const { data } = await Axios.get("/exam/data/admin");
      setExams(data);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      toast.error("Could not fetch exams.");
    }
  };

  useEffect(() => {
    getExams();
  }, []);

  // --- Form & State Handling ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setExamData(initialFormState);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditClick = (exam) => {
    setIsEditing(true);
    setEditingId(exam._id);
    setExamData({
      examName: exam.examName,
      academicYear: exam.academicYear,
      maxCceMark: exam.maxCceMark,
      maxPaperMark: exam.maxPaperMark,
      isActive: exam.isActive,
    });
    // Scroll to the form for better UX
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // --- API Actions ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiCall = isEditing 
        ? Axios.patch(`/exam/${editingId}`, examData)
        : Axios.post("/exam", examData);
      
      await toast.promise(apiCall, {
        pending: isEditing ? 'Updating exam...' : 'Creating exam...',
        success: isEditing ? 'Exam updated successfully!' : 'Exam created successfully!',
        error: 'An error occurred!',
      });
      
      resetForm();
      getExams();

    } catch (error) {
      console.error("Form submission error:", error.response?.data || error);
    }
  };
  
  const handleDeleteClick = (exam) => {
    setItemToDelete(exam);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await Axios.delete(`/exam/${itemToDelete._id}`);
      toast.success(`"${itemToDelete.examName}" deleted successfully.`);
      getExams();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete exam.");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div ref={formRef} className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isEditing ? "Edit Exam" : "Create New Exam"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Fields */}
              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input type="text" name="academicYear" id="academicYear" value={examData.academicYear} onChange={handleInputChange} className="input-field" placeholder="e.g., 2023-2024" required />
              </div>
              <div>
                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input type="text" name="examName" id="examName" value={examData.examName} onChange={handleInputChange} className="input-field" placeholder="e.g., Mid-Term Exam" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxCceMark" className="block text-sm font-medium text-gray-700 mb-1">Max CCE Mark</label>
                  <input type="number" name="maxCceMark" id="maxCceMark" value={examData.maxCceMark} onChange={handleInputChange} className="input-field" placeholder="e.g., 20" required />
                </div>
                <div>
                  <label htmlFor="maxPaperMark" className="block text-sm font-medium text-gray-700 mb-1">Max Paper Mark</label>
                  <input type="number" name="maxPaperMark" id="maxPaperMark" value={examData.maxPaperMark} onChange={handleInputChange} className="input-field" placeholder="e.g., 80" required />
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isActive" id="isActive" checked={examData.isActive} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Set as active exam</label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button type="submit" className="btn-primary w-full">
                  <FontAwesomeIcon icon={isEditing ? faEdit : faPlus} className="mr-2" />
                  {isEditing ? "Update Exam" : "Create Exam"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="btn-secondary w-full">Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
             <h2 className="text-2xl font-bold text-gray-800 p-6 border-b border-gray-200">
              Existing Exams
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                  <tr>
                    <th className="px-6 py-3">Exam Name</th>
                    <th className="px-6 py-3">Academic Year</th>
                    <th className="px-6 py-3 text-center">CCE Mark</th>
                    <th className="px-6 py-3 text-center">Paper Mark</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-200">
                  {exams.length > 0 ? (
                    exams.map(exam => (
                      <tr key={exam._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{exam.examName}</td>
                        <td className="px-6 py-4">{exam.academicYear}</td>
                        <td className="px-6 py-4 text-center">{exam.maxCceMark}</td>
                        <td className="px-6 py-4 text-center">{exam.maxPaperMark}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button onClick={() => handleEditClick(exam)} className="text-blue-500 hover:text-blue-700" title="Edit"><FontAwesomeIcon icon={faEdit} /></button>
                            <button onClick={() => handleDeleteClick(exam)} className="text-red-500 hover:text-red-700" title="Delete"><FontAwesomeIcon icon={faTrashAlt} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 px-6 text-gray-500">
                        No exams found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.examName}
      />
    </div>
  );
}

// Separate component for the modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-bold text-gray-900">Delete Exam</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the exam <strong className="font-semibold">"{itemName}"</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button onClick={onConfirm} type="button" className="btn-danger w-full sm:w-auto">
            Delete
          </button>
          <button onClick={onClose} type="button" className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


export default CreateEditExam;