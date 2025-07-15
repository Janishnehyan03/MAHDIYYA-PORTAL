// src/components/UploadedFiles.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "../../Axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf, faFileWord, faFileExcel, faFileImage, faFileAlt, faDownload, faSpinner, faExclamationTriangle, faInbox
} from "@fortawesome/free-solid-svg-icons";

// Helper function to get the correct icon and color based on file extension
const getFileIcon = (fileName) => {
  const extension = fileName?.split(".").pop().toLowerCase() || "";
  switch (extension) {
    case "pdf":
      return { icon: faFilePdf, color: "text-red-600" };
    case "doc":
    case "docx":
      return { icon: faFileWord, color: "text-blue-600" };
    case "xls":
    case "xlsx":
    case "csv":
      return { icon: faFileExcel, color: "text-green-600" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return { icon: faFileImage, color: "text-purple-600" };
    default:
      return { icon: faFileAlt, color: "text-gray-600" };
  }
};

function UploadedFiles() {
  const { id } = useParams();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadTaskTitle, setUploadTaskTitle] = useState("");


  const getAllUploads = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get(`/uploads/${id}`);
      setUploads(data);
      if (data.length > 0) {
        setUploadTaskTitle(data[0]?.referenceId?.title || "Uploaded Files");
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch uploaded files.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getAllUploads();
  }, [getAllUploads]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4" />
        <p className="text-lg">Loading Uploads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-red-700 bg-red-100 rounded-lg shadow-sm">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-4" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {uploadTaskTitle}
        </h1>
        <p className="text-gray-500 mb-6">
          {uploads.length} submission(s) received
        </p>

        {uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg mt-8">
            <FontAwesomeIcon icon={faInbox} size="3x" className="mb-4" />
            <h3 className="text-xl font-semibold">No Submissions Yet</h3>
            <p className="mt-1 text-sm">When users upload files for this task, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploads.map((upload, index) => {
                  const fileInfo = getFileIcon(upload.fileName);
                  return (
                    <tr key={upload._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{upload?.uploadedBy?.studyCentreName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{upload?.uploadedBy?.studyCentreCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`/${upload.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <FontAwesomeIcon icon={fileInfo.icon} className={`${fileInfo.color} text-2xl`} />
                          <span>
                            Download
                            <span className="text-xs text-gray-400 ml-1">.{upload.fileName?.split(".").pop()}</span>
                          </span>
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{moment(upload?.createdAt).format("DD MMM YYYY, hh:mm A")}</div>
                        <div className="text-xs">({moment(upload?.createdAt).fromNow()})</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadedFiles;