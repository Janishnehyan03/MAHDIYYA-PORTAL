// src/components/FileUpload.jsx
import { faExclamationTriangle, faPaperclip, faSpinner, faTimes, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../Axios";

function FileUpload() {
  // --- State and Hooks ---
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const { referenceId } = useParams();
  const navigate = useNavigate();

  // --- Data Fetching ---
  const getTaskData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await Axios.get(`/downloads/${referenceId}`);
      setTaskData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load upload task details.");
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }, [referenceId]);

  useEffect(() => {
    getTaskData();
  }, [getTaskData]);

  // --- Event Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = useCallback(async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    // Correctly create FormData inside the handler
    const formData = new FormData();
    formData.append("file", file);
    formData.append("referenceId", referenceId);
    formData.append("remarks", remarks);

    setLoading(true);
    try {
      const res = await Axios.post(`/uploads`, formData);
      if (res.status === 200) {
        toast.success("File uploaded successfully!");
        navigate("/my-uploads"); // Use navigate for smooth SPA transition
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred during upload.");
      setLoading(false);
    }
    // No need to set loading to false in the success case as we are navigating away.
  }, [file, remarks, referenceId, navigate]);

  // --- Render Logic ---
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <span className="ml-3 text-lg">Loading Task...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 text-red-700 bg-red-100 rounded-lg shadow-sm text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-4" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          {taskData?.title}
        </h1>
        <p className="text-gray-500 text-center mt-2 mb-8">
          Upload the required file to complete this task.
        </p>

        <form onSubmit={handleFileUpload} className="space-y-6">
          {/* File Input Dropzone */}
          <div>
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FontAwesomeIcon icon={faUpload} className="text-4xl text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Any file type (PDF, DOCX, JPG, etc.)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* File Preview */}
          {file && (
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPaperclip} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-800">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          {/* Remarks Input */}
          <div>
            <label htmlFor="remarks" className="block mb-2 text-sm font-medium text-gray-700">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="block w-full p-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional comments here..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-3" />
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FileUpload;