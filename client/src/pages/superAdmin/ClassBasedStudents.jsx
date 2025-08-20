import { useEffect, useState } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { Link, useParams } from "react-router-dom";
import Axios from "../../Axios"; // Assuming this path is correct
import { toast } from "react-toastify";

// --- Helper Components (can be in the same file or separate files) ---

// A simple loading spinner
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

// A component to show when there's no data
function EmptyState({ onAddClick }) {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800">No Students Found</h3>
      <p className="mt-2 text-gray-500">
        Get started by adding students to this class.
      </p>
      <div className="mt-6">
        <button
          onClick={onAddClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Students
        </button>
      </div>
    </div>
  );
}

// The main table displaying the list of students
function StudentsTable({ students, selectedStudents, onSelect, onSelectAll }) {
  const allSelected =
    students.length > 0 && selectedStudents.length === students.length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Register No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Place
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              District
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Phone
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <tr key={student._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student._id)}
                  onChange={(e) => onSelect(student._id, e.target.checked)}
                />
              </td>
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 font-semibold text-blue-600">
                <Link to={`/profile/${student._id}`}>
                  {student.studentName}
                </Link>
              </td>
              <td className="px-6 py-4">{student.registerNo}</td>
              <td className="px-6 py-4">{student.place}</td>
              <td className="px-6 py-4">{student.district}</td>
              <td className="px-6 py-4">{student.phone}</td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/edit-student/${student._id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The modal for uploading an Excel file
function UploadModal({ isOpen, onClose, classId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (isUploading) return; // Prevent file change during upload
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
    if (!file || isUploading) return; // Prevent double upload
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
      console.log(err.response);
    } finally {
      setIsUploading(false);
    }
  };

  const isEmptyCell = (cell) => typeof cell === "string" && cell.trim() === "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
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

        {/* Modal Body */}
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
              disabled={isUploading} // disable input while uploading
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
                className="animate-spin h-6 w-6 text-blue-600 mr-2"
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
              <span className="text-blue-600 font-medium">
                Uploading data, please wait...
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Upload & Save
            </button>
          )}
          {isUploading && (
            <span className="px-4 py-2 bg-blue-300 text-white rounded-md text-sm font-medium flex items-center">
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
  const [classes, setClasses] = useState([]); // for dropdown
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchData = async () => {
    try {
      const [classRes, studentsRes, classesRes] = await Promise.all([
        Axios.get(`/class/${classId}`),
        Axios.get(`/student/my-students/data/${classId}`),
        Axios.get(`/class`), // get all classes for promotion dropdown
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
      console.error(err);
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
      console.error(err);
      toast.error("Failed to drop out students.");
    }
  };
  return (
    <>
      <main className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {className?.className || "Loading Class..."}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage students for this class.
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">-- Select Class to Promote --</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
              </select>
              <button
                onClick={handlePromote}
                disabled={selectedStudents.length === 0 || !selectedClass}
                className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-300"
              >
                Promote
              </button>
              {!selectedClass && (
                <button
                  onClick={handleDropOut}
                  disabled={selectedStudents.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-300"
                >
                  Drop Out
                </button>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Add Students
              </button>
            </div>
          </div>

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
              <EmptyState onAddClick={() => setShowUploadModal(true)} />
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
