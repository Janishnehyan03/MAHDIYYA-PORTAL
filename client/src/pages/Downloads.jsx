import React, { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Axios from "../Axios";
import { UserAuthContext } from "../context/userContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload, faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";

// A simple component to show the file name in the form
const FileInputDisplay = ({ file }) => {
  if (!file) {
    return <p className="text-sm text-gray-500">No file selected.</p>;
  }
  return <p className="text-sm text-gray-700 font-medium truncate">{file.name}</p>;
};

function Downloads() {
  const { authData } = useContext(UserAuthContext);

  // Form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");

  // Component state
  const [downloads, setDownloads] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getDownloads = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const { data } = await Axios.get("/downloads");
      setDownloads(data);
    } catch (error) {
      console.error("Failed to fetch downloads:", error);
      toast.error("Could not fetch downloads list.");
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    getDownloads();
  }, [getDownloads]);

  const resetForm = () => {
    setTitle("");
    setType("");
    setFile(null);
    // Also reset the file input visually
    if (document.getElementById("formFile")) {
      document.getElementById("formFile").value = "";
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!title || !type || !file) {
      toast.warn("Please fill all fields and select a file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);

    try {
      await Axios.post("/downloads", formData);
      toast.success("File uploaded successfully!");
      resetForm();
      await getDownloads(); // Refresh the list without a page reload
    } catch (error) {
      console.error("File upload error:", error.response);
      toast.error(error.response?.data?.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteFile = async (id) => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      setDeletingId(id);
      try {
        // Optimistic UI: Remove from list immediately
        setDownloads((prevDownloads) => prevDownloads.filter((d) => d._id !== id));
        await Axios.delete(`/downloads/${id}`);
        toast.success("File deleted successfully.");
        // Optional: uncomment the line below to re-sync with server after deletion, though optimistic UI is often enough.
        // await getDownloads(); 
      } catch (error) {
        toast.error("Failed to delete file. Please refresh and try again.");
        console.error("Delete error:", error.response);
        // If deletion fails, refresh the list to restore the item
        await getDownloads();
      } finally {
        setDeletingId(null);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Manage Downloads
        </h1>

        {authData?.role === "superAdmin" && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">Upload a New File</h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">File Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Choose a category</option>
                  <option value="student">For Students</option>
                  <option value="admin">For Admins</option>
                </select>
              </div>

              <div>
                <label htmlFor="file-title" className="block text-sm font-medium text-gray-700">File Title</label>
                <input
                  type="text"
                  id="file-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Annual Report 2023"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="formFile" className="block text-sm font-medium text-gray-700">Select File</label>
                <input
                  type="file"
                  id="formFile"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                 <div className="mt-2">
                  <FileInputDisplay file={file} />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={isUploading ? faSpinner : faUpload} spin={isUploading} />
                  {isUploading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Downloads List Section */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Files</h2>
            {isLoadingList ? (
                <div className="text-center p-10">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
                    <p className="mt-2 text-gray-600">Loading Files...</p>
                </div>
            ) : downloads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {downloads.map((download) => (
                    <div
                        key={download._id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
                    >
                        <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full capitalize">
                            {download.type}
                            </span>
                            {authData?.role === "superAdmin" && (
                            <button
                                onClick={() => handleDeleteFile(download._id)}
                                disabled={deletingId === download._id}
                                className="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed p-1"
                                aria-label="Delete file"
                            >
                                <FontAwesomeIcon icon={deletingId === download._id ? faSpinner : faTrash} spin={deletingId === download._id} />
                            </button>
                            )}
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-4">{download.title}</p>
                        </div>
                        <a
                        href={download.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                        <FontAwesomeIcon icon={faDownload} />
                        Download
                        </a>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-10 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800">No Files Found</h3>
                    <p className="text-gray-500 mt-1">There are currently no files available for download.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Downloads;