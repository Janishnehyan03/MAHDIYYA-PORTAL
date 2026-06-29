import {
  faArrowUpRightDots,
  faPenToSquare,
  faPlus,
  faUserGraduate,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { Link, useParams } from "react-router-dom";
import Axios from "../../Axios";
import { toast } from "react-toastify";

// --- Helper Components ---

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
    </div>
  );
}

function EmptyState({ onAddClick, showAdd }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-2xl text-slate-400">
        <FontAwesomeIcon icon={faUserGraduate} />
      </div>
      <h3 className="text-xl font-semibold text-slate-800">No Students Found</h3>
      <p className="mt-2 text-slate-500">
        Get started by adding students to this class.
      </p>
      {showAdd && (
        <div className="mt-6">
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Students
          </button>
        </div>
      )}
    </div>
  );
}

function StudentsTable({ students, selectedStudents, onSelect, onSelectAll }) {
  const allSelected =
    students.length > 0 && selectedStudents.length === students.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="px-6 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {["#", "Name", "Register No", "Place", "District", "Phone"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                )
              )}
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student, index) => (
              <tr
                key={student._id}
                className="group transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => onSelect(student._id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-3.5 text-sm text-slate-400">
                  {index + 1}
                </td>
                <td className="px-6 py-3.5">
                  <Link
                    to={`/profile/${student._id}`}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                      {student.studentName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                      {student.studentName}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-3.5">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                    {student.registerNo}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-sm text-slate-600">
                  {student.place}
                </td>
                <td className="px-6 py-3.5 text-sm text-slate-600">
                  {student.district}
                </td>
                <td className="px-6 py-3.5 text-sm text-slate-600">
                  {student.phone}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link
                    to={`/edit-student/${student._id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UploadModal({ isOpen, onClose, classId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (isUploading) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      ExcelRenderer(selectedFile, (err, resp) => {
        if (err) {
          console.log(err);
          setError("Failed to parse the Excel file.");
        } else {
          setRows(resp.rows);
        }
      });
    }
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("class", classId);

    setIsUploading(true);
    setError(null);
    try {
      const res = await Axios.post("/student/excel", formData);
      if (res.status === 200) {
        onUploadSuccess();
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const isEmptyCell = (cell) => typeof cell === "string" && cell.trim() === "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Upload Students from Excel
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label
              className="block mb-2 text-sm font-medium text-gray-700"
              htmlFor="file_input"
            >
              Upload Excel File
            </label>
            <input
              className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
              id="file_input"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: .xlsx, .xls
            </p>
          </div>

          {rows.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">File Preview</h4>
              <div className="overflow-x-auto border rounded-lg max-h-64">
                <table className="w-full text-sm text-left text-gray-500">
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`${
                          rowIndex === 0
                            ? "bg-gray-100 font-bold text-gray-700"
                            : "bg-white"
                        } border-b ${row.some(isEmptyCell) ? "bg-red-50" : ""}`}
                      >
                        <td className="px-4 py-2 font-mono text-gray-400">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 border-l">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center justify-center mt-4">
              <svg
                className="animate-spin h-6 w-6 text-indigo-600 mr-2"
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
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span className="text-indigo-600 font-medium">
                Uploading data, please wait...
              </span>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end items-center space-x-4 rounded-b-lg">
          {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          {!isUploading && (
            <button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload &amp; Save
            </button>
          )}
          {isUploading && (
            <span className="flex items-center rounded-xl bg-indigo-300 px-4 py-2 text-sm font-medium text-white">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
              Uploading...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

function AllStudents() {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Configuration state
  const [configuration, setConfiguration] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  // If you use authentication, fetch it here (optional)
  // const { authData } = useContext(AuthContext);

  // Fetch configuration
  useEffect(() => {
    const getConfigurations = async () => {
      setConfigLoading(true);
      setConfigError(null);
      try {
        const response = await Axios.get("/configurations");
        setConfiguration(response.data);
      } catch (err) {
        setConfigError("Failed to load configuration. Please try again later.");
      } finally {
        setConfigLoading(false);
      }
    };
    getConfigurations();
  }, []);

  // Fetch class and student data
  const fetchData = async () => {
    try {
      const [classRes, studentsRes, classesRes] = await Promise.all([
        Axios.get(`/class/${classId}`),
        Axios.get(`/student/my-students/data/${classId}`),
        Axios.get(`/class`),
      ]);
      setClassName(classRes.data);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
    // eslint-disable-next-line
  }, [classId]);

  // Checkbox handling
  const handleSelect = (id, checked) => {
    setSelectedStudents((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedStudents(checked ? students.map((s) => s._id) : []);
  };

  // Promotion API call
  const handlePromote = async () => {
    if (!selectedClass || selectedStudents.length === 0) {
      alert("Please select at least one student and a class to promote to.");
      return;
    }
    try {
      await Axios.post("/student/promote", {
        studentIds: selectedStudents,
        classId: selectedClass,
      });
      toast.success("Students promoted successfully!");
      fetchData();
      setSelectedStudents([]);
    } catch (err) {
      toast.error("Failed to promote students.");
    }
  };

  const handleDropOut = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student to drop out.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to drop out the selected students? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await Axios.post("/student/drop-out", {
        studentIds: selectedStudents,
      });
      toast.success("Selected students dropped out successfully!");
      fetchData();
      setSelectedStudents([]);
    } catch (err) {
      toast.error("Failed to drop out students.");
    }
  };

  const showAddStudents =
    !configLoading &&
    configuration &&
    configuration.studentDataUpload === true;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {/* Hero Header */}
          <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
                  <FontAwesomeIcon
                    icon={faUserGraduate}
                    className="text-2xl text-white"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    {className?.className || "Loading Class..."}
                  </h2>
                  <p className="mt-1 text-slate-300">
                    Manage students for this class.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-indigo-400 [&>option]:text-slate-800"
                >
                  <option value="">Select Class to Promote</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handlePromote}
                  disabled={selectedStudents.length === 0 || !selectedClass}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-600 disabled:opacity-40 disabled:shadow-none"
                >
                  <FontAwesomeIcon icon={faArrowUpRightDots} />
                  Promote
                </button>
                {!selectedClass && (
                  <button
                    onClick={handleDropOut}
                    disabled={selectedStudents.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:bg-rose-600 disabled:opacity-40 disabled:shadow-none"
                  >
                    <FontAwesomeIcon icon={faUserSlash} />
                    Drop Out
                  </button>
                )}
                {showAddStudents && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-600 hover:to-purple-700"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Students
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div>
            {initialLoading ? (
              <LoadingSpinner />
            ) : students.length > 0 ? (
              <StudentsTable
                students={students}
                selectedStudents={selectedStudents}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
              />
            ) : (
              <EmptyState
                onAddClick={() => setShowUploadModal(true)}
                showAdd={showAddStudents}
              />
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        classId={classId}
        onUploadSuccess={fetchData}
      />
    </>
  );
}

export default AllStudents;