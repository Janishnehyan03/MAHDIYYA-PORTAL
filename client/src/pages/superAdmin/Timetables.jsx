import React, { useContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Axios from "../../Axios";
import moment from "moment";
import { ClassContext } from "../../context/classContext";
import { ExamContext } from "../../context/examContext";
import {
  faPenToSquare,
  faTrashAlt,
  faPlus,
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// --- Form Component ---
function TimetableForm({ onSubmitSuccess, editingHallTicket, onCancelEdit }) {
  const { classes, getClasses } = useContext(ClassContext);
  const { exams, getExams } = useContext(ExamContext);

  const initialInputs = [{ subjectId: "", time: "", date: "" }];
  const [inputs, setInputs] = useState(initialInputs);
  const [exam, setExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);

  // --- Effects for Data Handling ---
  useEffect(() => {
    // Initial fetch for dropdowns
    getExams(true);
    getClasses();
  }, []);

  useEffect(() => {
    // Fetch subjects when a class is selected
    const getSubjects = async () => {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }
      try {
        const { data } = await Axios.get(`/subject?class=${selectedClass}`);
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to fetch subjects.");
      }
    };
    getSubjects();
  }, [selectedClass]);

  useEffect(() => {
    // Populate form when editingHallTicket prop changes
    if (editingHallTicket) {
      setExam(editingHallTicket.exam._id);
      setSelectedClass(editingHallTicket.class._id);
      setInputs(
        editingHallTicket.subjects.map((subject) => ({
          subjectId: subject.subjectId._id,
          time: subject.time,
          date: moment(subject.date).format("YYYY-MM-DD"),
        }))
      );
    } else {
      resetForm();
    }
  }, [editingHallTicket]);

  // --- Form Handlers ---
  const resetForm = () => {
    setExam("");
    setSelectedClass("");
    setInputs(initialInputs);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newInputs = [...inputs];
    newInputs[index][name] = value;
    setInputs(newInputs);
  };

  const handleAddRow = () => {
    setInputs([...inputs, { subjectId: "", time: "", date: "" }]);
  };

  const handleRemoveRow = (index) => {
    if (inputs.length <= 1) return; // Prevent removing the last row
    setInputs(inputs.filter((_, i) => i !== index));
  };

  // --- API Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { subjects: inputs, exam, class: selectedClass };
    const apiCall = editingHallTicket
      ? Axios.patch(`/hall-ticket/${editingHallTicket._id}`, payload)
      : Axios.post("/hall-ticket", payload);

    try {
      await toast.promise(apiCall, {
        pending: editingHallTicket
          ? "Updating time table..."
          : "Creating time table...",
        success: `Time Table ${
          editingHallTicket ? "Updated" : "Created"
        } Successfully!`,
        error: "An error occurred.",
      });
      resetForm();
      onSubmitSuccess();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingHallTicket ? "Edit Time Table" : "Create Time Table"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Selects */}
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="input-field"
          required
        >
          <option value="" disabled>
            -- Select Exam --
          </option>
          {exams.map((examItem) => (
            <option key={examItem._id} value={examItem._id}>
              {examItem.examName}
            </option>
          ))}
        </select>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="input-field"
          required
        >
          <option value="" disabled>
            -- Select Class --
          </option>
          {classes.map((classItem) => (
            <option key={classItem._id} value={classItem._id}>
              {classItem.className}
            </option>
          ))}
        </select>

        <hr />

        {/* Dynamic Subject Rows */}
        <h3 className="text-lg font-semibold text-gray-700">
          Subjects Schedule
        </h3>
        <div className="space-y-4">
          {subjects.length > 0 ? (
            inputs.map((input, index) => (
              <div
                key={index}
                className="p-4 border rounded-md bg-gray-50 space-y-3 relative"
              >
                <span className="font-semibold text-gray-600">
                  Subject #{index + 1}
                </span>
                {inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
                <select
                  name="subjectId"
                  value={input.subjectId}
                  onChange={(e) => handleInputChange(index, e)}
                  className="input-field"
                  required
                >
                  <option value="" disabled>
                    -- Select Subject --
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectCode} - {subject.subjectName}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    name="time"
                    value={input.time}
                    onChange={(e) => handleInputChange(index, e)}
                    className="input-field"
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={input.date}
                    onChange={(e) => handleInputChange(index, e)}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 border-2 border-dashed rounded-md text-gray-500">
              {selectedClass
                ? "No subjects found for this class."
                : "Please select a class to see subjects."}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <button
          type="button"
          onClick={handleAddRow}
          className="btn-secondary w-full text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Another Subject
        </button>
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" className="btn-primary w-full">
            {editingHallTicket ? "Update Time Table" : "Create Time Table"}
          </button>
          {editingHallTicket && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// --- List/Grid Component ---
function HallTicketGrid({ hallTickets, onEdit, onDeleteClick }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 p-6 border-b border-gray-200">
        Existing Time Tables
      </h2>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {hallTickets.length > 0 ? (
          hallTickets.map((ht) => (
            <div
              key={ht._id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {ht.exam.examName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {ht.class.className}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(ht)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(ht)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
                <hr className="mb-4" />
                <div className="space-y-2">
                  {ht.subjects.map((subject, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-semibold text-gray-700">
                        {subject.subjectId.subjectName}
                      </p>
                      <p className="text-gray-500">
                        {moment(subject.date).format("dddd, MMMM D, YYYY")} at{" "}
                        {subject.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="md:col-span-2 xl:col-span-3 text-center py-12 text-gray-500">
            No time tables found. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Main Parent Component ---
function TimeTables() {
  const [hallTickets, setHallTickets] = useState([]);
  const [editingHallTicket, setEditingHallTicket] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const formRef = useRef(null);

  const getHallTickets = async () => {
    try {
      const { data } = await Axios.get("/hall-ticket");
      setHallTickets(data);
    } catch (error) {
      console.error("Error fetching hall tickets:", error);
      toast.error("Failed to fetch time tables.");
    }
  };

  useEffect(() => {
    getHallTickets();
  }, []);

  const handleEdit = (hallTicket) => {
    setEditingHallTicket(hallTicket);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingHallTicket(null);
  };

  const handleSubmitSuccess = () => {
    getHallTickets();
    setEditingHallTicket(null);
  };

  const handleDeleteClick = (hallTicket) => {
    setItemToDelete(hallTicket);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await Axios.delete(`/hall-ticket/${itemToDelete._id}`);
      toast.success("Time Table deleted successfully.");
      getHallTickets();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete time table.");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div ref={formRef} className="lg:col-span-1">
          <TimetableForm
            onSubmitSuccess={handleSubmitSuccess}
            editingHallTicket={editingHallTicket}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        <div className="lg:col-span-2">
          <HallTicketGrid
            hallTickets={hallTickets}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={`Time Table for ${itemToDelete?.exam?.examName} - ${itemToDelete?.class?.className}`}
      />
    </div>
  );
}

// --- Reusable Delete Confirmation Modal ---
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="h-6 w-6 text-red-600"
            />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-bold text-gray-900">
              Delete Time Table
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the time table for{" "}
                <strong className="font-semibold">"{itemName}"</strong>? This
                action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            type="button"
            className="btn-danger w-full sm:w-auto"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            type="button"
            className="btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeTables;
