import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faDownload,
  faFilePdf,
  faFileExcel,
  faFileWord,
  faFileImage,
  faFileAlt,
  faInbox,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Axios from "../../Axios";

const getFileIcon = (fileType) => {
  switch ((fileType || "").toLowerCase()) {
    case "pdf":
      return { icon: faFilePdf, color: "text-red-600" };
    case "xls":
    case "xlsx":
    case "csv":
      return { icon: faFileExcel, color: "text-green-600" };
    case "doc":
    case "docx":
      return { icon: faFileWord, color: "text-blue-600" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return { icon: faFileImage, color: "text-purple-600" };
    default:
      return { icon: faFileAlt, color: "text-gray-600" };
  }
};

function SharedDownloads() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Axios.get("/resources/my");
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Could not load downloads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error("Download failed. Please try again.");
    }
  };

  const filtered = resources.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Downloads
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Files shared with you. Click download to save them.
        </p>

        <div className="relative max-w-md mx-auto mb-8">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by title..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center p-10">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faInbox} size="2x" className="text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-800">No Files Available</h3>
            <p className="text-gray-500 mt-1">
              There are currently no files shared with you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const info = getFileIcon(r.fileType);
              return (
                <div
                  key={r._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <FontAwesomeIcon
                      icon={info.icon}
                      className={`${info.color} text-3xl mt-0.5`}
                    />
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-800 break-words">
                        {r.title}
                      </p>
                      {r.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {moment(r.createdAt).format("DD MMM YYYY")}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(r.fileUrl, r.fileName || r.title)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedDownloads;
