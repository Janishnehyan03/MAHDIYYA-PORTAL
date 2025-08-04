import { faBook, faEdit, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import Axios from "../../Axios";

// Main Component
function ClassManagment() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null); // Will hold the class object for editing

  // --- API Calls ---
  const getAllClasses = async () => {
    try {
      const { data } = await Axios.get("/class");
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error.response || error);
    }
  };

  const createClass = async (classData) => {
    try {
      await Axios.post("/class", classData);
      closeModalAndRefresh();
    } catch (error) {
      console.error("Failed to create class:", error.response || error);
    }
  };

  const editClass = async (classData) => {
    if (!editingClass?._id) return;
    try {
      await Axios.patch(`/class/${editingClass._id}`, classData);
      closeModalAndRefresh();
    } catch (error) {
      console.error("Failed to edit class:", error.response || error);
    }
  };

  useEffect(() => {
    getAllClasses();
  }, []);

  // --- Modal Handling ---
  const handleOpenAddModal = () => {
    setEditingClass(null); // Ensure we're in "add" mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (classItem) => {
    setEditingClass(classItem); // Set the class to edit
    setIsModalOpen(true);
  };

  const closeModalAndRefresh = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    getAllClasses(); // Refresh data after action
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header and Action Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Classroom Management
          </h1>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Class
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
              <thead className="bg-gray-100 border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">#</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Class Name</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Order</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.length > 0 ? (
                  classes.map((classItem, index) => (
                    <tr key={classItem._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{classItem.className}</td>
                      <td className="px-6 py-4 text-gray-800">
                        {typeof classItem.classOrder !== "undefined" ? classItem.classOrder : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenEditModal(classItem)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit Class"
                        >
                          <FontAwesomeIcon icon={faEdit} size="lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 px-6 text-gray-500">
                      No classes found. Click "Add New Class" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal Render */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingClass ? editClass : createClass}
        isEditing={!!editingClass}
        initialData={editingClass}
      />
    </div>
  );
}

// Modal Component
function ClassModal({ isOpen, onClose, onSubmit, isEditing, initialData }) {
  const [className, setClassName] = useState("");
  const [classOrder, setClassOrder] = useState("");

  useEffect(() => {
    // Pre-fill form when editing, otherwise clear it
    if (isEditing && initialData) {
      setClassName(initialData.className || "");
      setClassOrder(
        typeof initialData.classOrder !== "undefined" && initialData.classOrder !== null
          ? initialData.classOrder
          : ""
      );
    } else {
      setClassName("");
      setClassOrder("");
    }
  }, [isEditing, initialData, isOpen]); // Rerun when modal opens

  const handleSubmit = (e) => {
    e.preventDefault();
    if (className.trim()) {
      // Parse classOrder to number, fallback to 0 if empty or invalid
      const parsedOrder =
        classOrder === "" || isNaN(Number(classOrder)) ? 0 : Number(classOrder);
      onSubmit({ className, classOrder: parsedOrder });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FontAwesomeIcon icon={faBook} className="text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                      {isEditing ? "Edit Class" : "Create New Class"}
                    </h3>
                    <div className="mt-4">
                      <label htmlFor="className" className="block text-sm font-medium text-gray-700">
                        Class Name
                      </label>
                      <input
                        type="text"
                        id="className"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                        placeholder="e.g., Grade 10 - Science"
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="classOrder" className="block text-sm font-medium text-gray-700">
                        Class Order
                      </label>
                      <input
                        type="number"
                        id="classOrder"
                        value={classOrder}
                        onChange={(e) => setClassOrder(e.target.value.replace(/[^0-9]/g, ""))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                        placeholder="e.g., 1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto"
                >
                  {isEditing ? "Save Changes" : "Create Class"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassManagment;