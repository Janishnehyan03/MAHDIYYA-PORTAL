// src/components/MyUploads.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload, faCheckCircle, faClock, faTrash, faDownload, faSpinner, faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

function MyUploads() {
  const [downloads, setDownloads] = useState([]); // Tasks to upload
  const [uploads, setUploads] = useState([]); // Already uploaded files
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [downloadsRes, uploadsRes] = await Promise.all([
        Axios.get("/downloads"),
        Axios.get("/uploads"),
      ]);
      setDownloads(downloadsRes.data);
      setUploads(uploadsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteFile = async (id) => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      try {
        const res = await Axios.post(`/uploads/${id}`); // Assuming this is a soft-delete or archive endpoint
        if (res.status === 200) {
          // Remove from state instead of reloading page
          setUploads((currentUploads) => currentUploads.filter((u) => u._id !== id));
          toast.success("File deleted successfully!");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong.");
        console.error(err);
      }
    }
  };

  // Memoize the pending downloads calculation for performance
  const pendingDownloads = useMemo(() => {
    const uploadedRefIds = new Set(uploads.map((u) => u.referenceId?._id));
    return downloads.filter((d) => !uploadedRefIds.has(d._id));
  }, [downloads, uploads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 text-gray-500">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-700 bg-red-100 rounded-lg">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section 1: Pending Uploads */}
        <section>
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-2xl mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Pending Uploads ({pendingDownloads.length})
            </h2>
          </div>
          {pendingDownloads.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {pendingDownloads.map((task) => (
                  <li key={task._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <span className="font-medium text-gray-700">{task.title}</span>
                    <Link
                      to={`/file-upload/${task._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FontAwesomeIcon icon={faUpload} className="mr-2 -ml-1" />
                      Upload Now
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-lg shadow-md text-gray-500">
              <p>No pending files to upload. Great job!</p>
            </div>
          )}
        </section>

        {/* Section 2: Completed Uploads */}
        <section>
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Completed Uploads ({uploads.length})
            </h2>
          </div>
          {uploads.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {uploads.map((upload) => (
                  <li key={upload._id} className="p-4 flex flex-wrap justify-between items-center gap-4 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{upload.referenceId?.title}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {moment(upload.createdAt).format("DD MMM YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <a
                        href={`/${upload.fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="Download File"
                      >
                        <FontAwesomeIcon icon={faDownload} size="lg" />
                      </a>
                      <button
                        onClick={() => deleteFile(upload._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete File"
                      >
                        <FontAwesomeIcon icon={faTrash} size="lg" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-lg shadow-md text-gray-500">
              <p>You haven't uploaded any files yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyUploads;