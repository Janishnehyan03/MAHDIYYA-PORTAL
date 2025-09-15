import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSpinner,
  faPlus,
  faEdit,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

// Toggle Switch component
const ToggleSwitch = ({ enabled, onChange, loading }) => (
  <button
    type="button"
    disabled={loading}
    onClick={onChange}
    className={`${
      enabled ? "bg-blue-600" : "bg-gray-200"
    } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    <span
      className={`${
        enabled ? "translate-x-6" : "translate-x-1"
      } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
    />
  </button>
);

const AdminConfigPage = () => {
  const [settings, setSettings] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const [regNoInput, setRegNoInput] = useState("");

  // For editing academic year
  const [editingYearId, setEditingYearId] = useState(null);
  const [editingYearValue, setEditingYearValue] = useState("");

  const [loading, setLoading] = useState({
    page: true,
    toggle: null,
    regNo: false,
    creatingYear: false,
    updatingYear: null,
    togglingCurrent: null,
    editingYear: null,
  });

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, page: true }));
    try {
      const [configRes, yearsRes] = await Promise.all([
        Axios.get("/configurations"),
        Axios.get("/academic-year"),
      ]);
      setSettings(configRes.data);
      setRegNoInput(configRes.data.lastRegisterNo || "");
      setAcademicYears(yearsRes.data);
    } catch (err) {
      toast.error("Failed to load configuration data.");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, page: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle toggling of boolean settings
  const handleToggle = async (key) => {
    setLoading((prev) => ({ ...prev, toggle: key }));
    const originalSettings = { ...settings };
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    try {
      await Axios.patch(`/configurations/${settings._id}`, {
        [key]: !settings[key],
      });
    } catch (err) {
      toast.error(`Failed to update setting. Please try again.`);
      setSettings(originalSettings);
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, toggle: null }));
    }
  };

  // Handle saving the last register number on blur
  const handleRegNoBlur = async () => {
    if (regNoInput === settings.lastRegisterNo) return;
    setLoading((prev) => ({ ...prev, regNo: true }));
    try {
      await Axios.patch(`/configurations/${settings._id}`, {
        lastRegisterNo: regNoInput,
      });
      setSettings((prev) => ({ ...prev, lastRegisterNo: regNoInput }));
      toast.success("Last register number updated.");
    } catch (err) {
      toast.error("Failed to update register number.");
      setRegNoInput(settings.lastRegisterNo);
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, regNo: false }));
    }
  };

  // Create a new academic year
  const createAcademicYear = async (e) => {
    e.preventDefault();
    if (!newAcademicYear.trim()) {
      toast.warn("Academic year cannot be empty.");
      return;
    }
    setLoading((prev) => ({ ...prev, creatingYear: true }));
    try {
      const { data } = await Axios.post(`/academic-year`, {
        year: newAcademicYear,
      });
      setAcademicYears((prev) => [...prev, data]);
      setNewAcademicYear("");
      toast.success("Academic year created.");
    } catch (err) {
      toast.error("Failed to create academic year.");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, creatingYear: false }));
    }
  };

  // Delete an academic year
  const deleteAcademicYear = async (id) => {
    if (!window.confirm("Are you sure you want to delete this academic year?"))
      return;

    setLoading((prev) => ({ ...prev, updatingYear: id }));
    try {
      await Axios.delete(`/academic-year/${id}`);
      setAcademicYears((prev) => prev.filter((y) => y._id !== id));
      toast.success("Academic year deleted.");
    } catch (err) {
      toast.error("Failed to delete academic year.");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, updatingYear: null }));
    }
  };

  // Start editing an academic year
  const startEditAcademicYear = (year) => {
    setEditingYearId(year._id);
    setEditingYearValue(year.year);
  };

  // Cancel editing
  const cancelEditAcademicYear = () => {
    setEditingYearId(null);
    setEditingYearValue("");
  };

  // Update an academic year (PUT/PATCH)
  const updateAcademicYear = async (id) => {
    if (!editingYearValue.trim()) {
      toast.warn("Academic year cannot be empty.");
      return;
    }
    setLoading((prev) => ({ ...prev, editingYear: id }));
    try {
      const { data } = await Axios.patch(`/academic-year/${id}`, {
        year: editingYearValue,
      });
      setAcademicYears((prev) =>
        prev.map((y) => (y._id === id ? { ...y, year: data.year } : y))
      );
      toast.success("Academic year updated.");
      cancelEditAcademicYear();
    } catch (err) {
      toast.error("Failed to update academic year.");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, editingYear: null }));
    }
  };

  // Toggle current year
  const toggleCurrentYear = async (id) => {
    setLoading((prev) => ({ ...prev, togglingCurrent: id }));
    try {
      // Find the year to toggle
      const yearToToggle = academicYears.find((y) => y._id === id);
      const newCurrent = !yearToToggle.currentYear;

      // Update on server
      const { data } = await Axios.patch(`/academic-year/${id}`, {
        currentYear: newCurrent,
      });

      // Update local state
      setAcademicYears((prev) =>
        prev.map((y) =>
          y._id === id
            ? { ...y, currentYear: newCurrent }
            : y
        )
      );
      toast.success(
        newCurrent
          ? "Set as current academic year."
          : "Unset as current academic year."
      );
    } catch (err) {
      toast.error("Failed to update current academic year.");
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, togglingCurrent: null }));
    }
  };

  if (loading.page) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="3x"
          className="text-blue-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Application Settings */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4">
              Application Settings
            </h2>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-700">
                  Half Year Exam Result Submission
                </h3>
                <p className="text-sm text-gray-500">
                  Allow or disallow SA result entries.
                </p>
              </div>
              <ToggleSwitch
                enabled={settings?.saSubmission}
                onChange={() => handleToggle("saSubmission")}
                loading={loading.toggle === "saSubmission"}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-700">
                  FA Mark Submission
                </h3>
                <p className="text-sm text-gray-500">
                  Allow or disallow FA mark entries.
                </p>
              </div>
              <ToggleSwitch
                enabled={settings?.faSubmission}
                onChange={() => handleToggle("faSubmission")}
                loading={loading.toggle === "faSubmission"}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-700">
                  Hall Ticket Download
                </h3>
                <p className="text-sm text-gray-500">
                  Enable or disable hall ticket downloads for students.
                </p>
              </div>
              <ToggleSwitch
                enabled={settings?.hallTicketDownload}
                onChange={() => handleToggle("hallTicketDownload")}
                loading={loading.toggle === "hallTicketDownload"}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-700">
                  Student Data Upload
                </h3>
                <p className="text-sm text-gray-500">
                  Enable or disable uploading of student data.
                </p>
              </div>
              <ToggleSwitch
                enabled={settings?.studentDataUpload}
                onChange={() => handleToggle("studentDataUpload")}
                loading={loading.toggle === "studentDataUpload"}
              />
            </div>

            {/* Last Register Number */}
            <div>
              <label
                htmlFor="lastRegisterNo"
                className="block font-medium text-gray-700"
              >
                Last Used Register Number
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Set the last successfully assigned register number.
              </p>
              <div className="relative">
                <input
                  id="lastRegisterNo"
                  type="text"
                  value={regNoInput}
                  onChange={(e) => setRegNoInput(e.target.value)}
                  onBlur={handleRegNoBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2023001"
                />
                {loading.regNo && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Academic Year Management */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4">
              Academic Years
            </h2>

            <form onSubmit={createAcademicYear} className="flex gap-2">
              <input
                type="text"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2024-2025"
              />
              <button
                type="submit"
                disabled={loading.creatingYear}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                <FontAwesomeIcon
                  icon={loading.creatingYear ? faSpinner : faPlus}
                  spin={loading.creatingYear}
                />
                <span className="ml-2">Add</span>
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {academicYears.map((year) => (
                <div
                  key={year._id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md gap-2"
                >
                  {editingYearId === year._id ? (
                    <>
                      <input
                        type="text"
                        value={editingYearValue}
                        onChange={(e) => setEditingYearValue(e.target.value)}
                        className="flex-grow px-2 py-1 border border-gray-300 rounded"
                        disabled={loading.editingYear === year._id}
                      />
                      <button
                        onClick={() => updateAcademicYear(year._id)}
                        disabled={loading.editingYear === year._id}
                        className="text-green-600 hover:text-green-800"
                        aria-label="Save"
                      >
                        <FontAwesomeIcon
                          icon={
                            loading.editingYear === year._id
                              ? faSpinner
                              : faCheck
                          }
                          spin={loading.editingYear === year._id}
                        />
                      </button>
                      <button
                        onClick={cancelEditAcademicYear}
                        disabled={loading.editingYear === year._id}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="Cancel"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-grow">
                        <span className="font-medium text-gray-700">
                          {year.year}
                        </span>
                        {year.currentYear && (
                          <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                      <ToggleSwitch
                        enabled={year.currentYear}
                        loading={loading.togglingCurrent === year._id}
                        onChange={() => toggleCurrentYear(year._id)}
                      />
                      <button
                        onClick={() => startEditAcademicYear(year)}
                        className="text-blue-500 hover:text-blue-700"
                        aria-label="Edit year"
                        disabled={
                          loading.updatingYear === year._id ||
                          loading.editingYear
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => deleteAcademicYear(year._id)}
                        disabled={loading.updatingYear === year._id}
                        className="text-gray-400 hover:text-red-600 disabled:text-gray-300"
                        aria-label="Delete year"
                      >
                        <FontAwesomeIcon
                          icon={
                            loading.updatingYear === year._id
                              ? faSpinner
                              : faTrash
                          }
                          spin={loading.updatingYear === year._id}
                        />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigPage;
