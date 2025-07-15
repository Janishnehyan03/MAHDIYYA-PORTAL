import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner, faPlus } from "@fortawesome/free-solid-svg-icons";

// A modern, reusable Toggle Switch component
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

// Main Component
const AdminConfigPage = () => {
  const [settings, setSettings] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const [regNoInput, setRegNoInput] = useState("");

  // Granular loading states for better UX
  const [loading, setLoading] = useState({
    page: true,
    toggle: null, // Holds the key of the setting being toggled
    regNo: false,
    creatingYear: false,
    updatingYear: null, // Holds the ID of the year being updated/deleted
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

  // Handle toggling of boolean settings with optimistic UI
  const handleToggle = async (key) => {
    setLoading((prev) => ({ ...prev, toggle: key }));
    const originalSettings = { ...settings };

    // Optimistically update the UI
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    try {
      await Axios.patch(`/configurations/${settings._id}`, {
        [key]: !settings[key],
      });
    } catch (err) {
      toast.error(`Failed to update setting. Please try again.`);
      setSettings(originalSettings); // Revert on error
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, toggle: null }));
    }
  };

  // Handle saving the last register number on blur
  const handleRegNoBlur = async () => {
    if (regNoInput === settings.lastRegisterNo) return; // No change

    setLoading((prev) => ({ ...prev, regNo: true }));
    try {
      await Axios.patch(`/configurations/${settings._id}`, {
        lastRegisterNo: regNoInput,
      });
      setSettings((prev) => ({ ...prev, lastRegisterNo: regNoInput }));
      toast.success("Last register number updated.");
    } catch (err) {
      toast.error("Failed to update register number.");
      setRegNoInput(settings.lastRegisterNo); // Revert on error
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

            {/* Setting Item */}
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
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                >
                  <p className="font-medium text-gray-700">{year.year}</p>
                  <button
                    onClick={() => deleteAcademicYear(year._id)}
                    disabled={loading.updatingYear === year._id}
                    className="text-gray-400 hover:text-red-600 disabled:text-gray-300"
                    aria-label="Delete year"
                  >
                    <FontAwesomeIcon
                      icon={
                        loading.updatingYear === year._id ? faSpinner : faTrash
                      }
                      spin={loading.updatingYear === year._id}
                    />
                  </button>
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
