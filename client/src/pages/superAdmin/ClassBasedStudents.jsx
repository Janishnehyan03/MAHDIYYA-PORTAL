import { useEffect, useState } from "react";
import { ExcelRenderer } from "react-excel-renderer";
import { Link, useParams } from "react-router-dom";
import Axios from "../../Axios"; // Assuming this path is correct

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
            <p className="mt-2 text-gray-500">Get started by adding students to this class.</p>
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
function StudentsTable({ students }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                <Link to={`/profile/${student._id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                  {student.studentName}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registerNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.place}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.district}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/edit-student/${student._id}`} className="text-indigo-600 hover:text-indigo-900">
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
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("class", classId);
    
    setIsUploading(true);
    setError(null);
    try {
      const res = await Axios.post("/student/excel", formData);
      if (res.status === 200) {
        onUploadSuccess(); // Call success callback
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
            <h3 className="text-xl font-semibold text-gray-800">Upload Students from Excel</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="file_input">
                    Upload Excel File
                </label>
                <input
                    className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
                    id="file_input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                />
                <p className="mt-1 text-xs text-gray-500">Supported formats: .xlsx, .xls</p>
            </div>

            {rows.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">File Preview</h4>
                    <div className="overflow-x-auto border rounded-lg max-h-64">
                        <table className="w-full text-sm text-left text-gray-500">
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={`${rowIndex === 0 ? 'bg-gray-100 font-bold text-gray-700' : 'bg-white'} border-b ${row.some(isEmptyCell) ? 'bg-red-50' : ''}`}>
                                        <td className="px-4 py-2 font-mono text-gray-400">{rowIndex + 1}</td>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 border-l">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end items-center space-x-4 rounded-b-lg">
            {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
            </button>
            <button
                onClick={handleUpload}
                disabled={isUploading || !file}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                {isUploading ? "Uploading..." : "Upload & Save"}
            </button>
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchData = async () => {
    try {
      const [classRes, studentsRes] = await Promise.all([
        Axios.get(`/class/${classId}`),
        Axios.get(`/student/my-students/data/${classId}`)
      ]);
      setClassName(classRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Here you could set an error state to show a message on the page
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [classId]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Refresh data without full page reload
    fetchData(); 
  };
  
  return (
    <>
      <main className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {className?.className || "Loading Class..."}
              </h2>
              <p className="mt-1 text-sm text-gray-500">Manage students for this class.</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Students
              </button>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div>
            {initialLoading ? (
              <LoadingSpinner />
            ) : students.length > 0 ? (
              <StudentsTable students={students} />
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
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}

export default AllStudents;