import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSpinner,
  faTrash,
  faDownload,
  faFilePdf,
  faFileExcel,
  faFileWord,
  faFileImage,
  faFileAlt,
  faUsers,
  faUserCheck,
  faSearch,
  faInbox,
  faTimes,
  faCloudArrowUp,
  faCircleInfo,
  faFolderOpen,
  faGlobe,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "../../Axios";

// Keep this in sync with the multer limit in routes/resourceRoute.js
const MAX_FILE_MB = 50;

const getFileIcon = (fileType) => {
  switch ((fileType || "").toLowerCase()) {
    case "pdf":
      return { icon: faFilePdf, color: "text-red-600", bg: "bg-red-50" };
    case "xls":
    case "xlsx":
    case "csv":
      return { icon: faFileExcel, color: "text-green-600", bg: "bg-green-50" };
    case "doc":
    case "docx":
      return { icon: faFileWord, color: "text-blue-600", bg: "bg-blue-50" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return { icon: faFileImage, color: "text-purple-600", bg: "bg-purple-50" };
    default:
      return { icon: faFileAlt, color: "text-gray-600", bg: "bg-gray-100" };
  }
};

function ManageDownloads() {
  // Form state
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [audience, setAudience] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  // Data
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [detailResource, setDetailResource] = useState(null); // card clicked -> modal

  const getResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await Axios.get("/resources");
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Could not load the downloads list.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const { data } = await Axios.get("/auth/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  }, []);

  useEffect(() => {
    getResources();
    getUsers();
  }, [getResources, getUsers]);

  const stats = useMemo(() => {
    const all = resources.filter((r) => r.audience === "all").length;
    return {
      total: resources.length,
      all,
      restricted: resources.length - all,
    };
  }, [resources]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setAudience("all");
    setSelectedUsers([]);
    setUserSearch("");
    if (document.getElementById("resource-file")) {
      document.getElementById("resource-file").value = "";
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum allowed size is ${MAX_FILE_MB}MB.`);
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast.warn("Please provide a title and select a file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum allowed size is ${MAX_FILE_MB}MB.`);
      return;
    }
    if (audience === "selected" && selectedUsers.length === 0) {
      toast.warn("Please select at least one user.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("audience", audience);
    if (audience === "selected") {
      formData.append("allowedUsers", JSON.stringify(selectedUsers));
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await Axios.post("/resources", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
      toast.success("File uploaded successfully!");
      resetForm();
      await getResources();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await Axios.delete(`/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
      setDetailResource((prev) => (prev?._id === id ? null : prev));
      toast.success("File deleted.");
    } catch (error) {
      toast.error("Could not delete the file.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.branch?.studyCentreName?.toLowerCase().includes(q) ||
      u.branch?.studyCentreCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <FontAwesomeIcon icon={faFolderOpen} className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Manage Downloads</h1>
              <p className="text-blue-100 mt-1">
                Share files (PDF, Excel, Word, images and more) with your admins.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 max-w-xl">
            {[
              { label: "Total Files", value: stats.total, icon: faFolderOpen },
              { label: "For All", value: stats.all, icon: faGlobe },
              { label: "Restricted", value: stats.restricted, icon: faUserCheck },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15"
              >
                <div className="flex items-center gap-2 text-blue-100 text-xs uppercase tracking-wide">
                  <FontAwesomeIcon icon={s.icon} />
                  {s.label}
                </div>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* File limit banner */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-8 shadow-sm">
          <FontAwesomeIcon icon={faCircleInfo} className="text-amber-500" />
          <p className="text-sm">
            Maximum file size: <span className="font-semibold">{MAX_FILE_MB} MB</span>{" "}
            per upload. Supported types: PDF, Excel, Word, images, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Upload form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-blue-600" />
                Upload a New File
              </h2>
              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    File Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Exam Timetable 2026"
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select File{" "}
                    <span className="text-slate-400 font-normal">
                      (max {MAX_FILE_MB}MB)
                    </span>
                  </label>
                  <label
                    htmlFor="resource-file"
                    className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition"
                  >
                    <FontAwesomeIcon
                      icon={faCloudArrowUp}
                      className="text-2xl text-slate-400 mb-2"
                    />
                    {file ? (
                      <span className="text-sm font-medium text-slate-700 truncate max-w-full">
                        {file.name}{" "}
                        <span className="text-slate-400">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">
                        Click to choose a file
                      </span>
                    )}
                    <input
                      type="file"
                      id="resource-file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Who can download this file?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAudience("all")}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                        audience === "all"
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <FontAwesomeIcon icon={faGlobe} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">All Users</p>
                        <p className="text-xs text-slate-500">Every admin</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudience("selected")}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                        audience === "selected"
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <FontAwesomeIcon icon={faUserCheck} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Selected</p>
                        <p className="text-xs text-slate-500">Specific admins</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* User picker */}
                {audience === "selected" && (
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {selectedUsers.length} selected
                      </span>
                      {selectedUsers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedUsers([])}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="relative mb-2">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                      />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or centre code"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 bg-white rounded-md border border-slate-100">
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-slate-400 py-3 text-center">
                          No users found.
                        </p>
                      ) : (
                        filteredUsers.map((u) => (
                          <label
                            key={u._id}
                            className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u._id)}
                              onChange={() => toggleUser(u._id)}
                              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {u.branch?.studyCentreName || u.username}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {u.username}
                                {u.branch?.studyCentreCode
                                  ? ` • ${u.branch.studyCentreCode}`
                                  : ""}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-center">
                      {uploadProgress < 100
                        ? `Uploading... ${uploadProgress}%`
                        : "Processing file on server..."}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
                >
                  <FontAwesomeIcon icon={isUploading ? faSpinner : faUpload} spin={isUploading} />
                  {isUploading ? "Uploading..." : "Upload File"}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Uploaded Files{" "}
              <span className="text-slate-400 font-normal">({resources.length})</span>
            </h2>
            {isLoading ? (
              <div className="text-center p-10">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
                <p className="mt-2 text-slate-600">Loading files...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
                <FontAwesomeIcon icon={faInbox} size="2x" className="text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-800">No Files Uploaded</h3>
                <p className="text-slate-500 mt-1">Uploaded files will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {resources.map((r) => {
                  const info = getFileIcon(r.fileType);
                  return (
                    <div
                      key={r._id}
                      onClick={() => setDetailResource(r)}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                              r.audience === "all"
                                ? "text-green-700 bg-green-100"
                                : "text-amber-700 bg-amber-100"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={r.audience === "all" ? faGlobe : faUserCheck}
                            />
                            {r.audience === "all"
                              ? "All Users"
                              : `${r.allowedUsers?.length || 0} Selected`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(r._id);
                            }}
                            disabled={deletingId === r._id}
                            className="text-slate-300 hover:text-red-600 disabled:cursor-not-allowed p-1"
                            aria-label="Delete file"
                          >
                            <FontAwesomeIcon
                              icon={deletingId === r._id ? faSpinner : faTrash}
                              spin={deletingId === r._id}
                            />
                          </button>
                        </div>
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className={`h-12 w-12 rounded-xl ${info.bg} flex items-center justify-center shrink-0`}
                          >
                            <FontAwesomeIcon icon={info.icon} className={`${info.color} text-xl`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-slate-800 break-words leading-tight">
                              {r.title}
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-1">{r.fileName}</p>
                            {r.createdAt && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {moment(r.createdAt).format("DD MMM YYYY")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal: shows the selected users for a file */}
      {detailResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetailResource(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100">
              <div className="flex items-start gap-3 min-w-0">
                {(() => {
                  const info = getFileIcon(detailResource.fileType);
                  return (
                    <div
                      className={`h-11 w-11 rounded-xl ${info.bg} flex items-center justify-center shrink-0`}
                    >
                      <FontAwesomeIcon icon={info.icon} className={`${info.color} text-lg`} />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 break-words leading-tight">
                    {detailResource.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{detailResource.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailResource(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                    detailResource.audience === "all"
                      ? "text-green-700 bg-green-100"
                      : "text-amber-700 bg-amber-100"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={detailResource.audience === "all" ? faGlobe : faUserCheck}
                  />
                  {detailResource.audience === "all" ? "Available to all users" : "Restricted access"}
                </span>
              </div>

              {detailResource.audience === "all" ? (
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 rounded-lg p-4">
                  <FontAwesomeIcon icon={faUsers} className="text-slate-400 text-xl" />
                  <p className="text-sm">
                    This file is visible to <span className="font-medium">every admin</span> in the
                    portal.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Shared with {detailResource.allowedUsers?.length || 0} user(s)
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                    {detailResource.allowedUsers?.length ? (
                      detailResource.allowedUsers.map((u) => (
                        <div key={u._id} className="flex items-center gap-3 p-3">
                          <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-sm" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {u.branch?.studyCentreName || u.username}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {u.username}
                              {u.branch?.studyCentreCode ? ` • ${u.branch.studyCentreCode}` : ""}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 p-3 text-center">
                        No users assigned.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <a
                href={detailResource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download
              </a>
              <button
                onClick={() => handleDelete(detailResource._id)}
                disabled={deletingId === detailResource._id}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 transition"
              >
                <FontAwesomeIcon
                  icon={deletingId === detailResource._id ? faSpinner : faTrash}
                  spin={deletingId === detailResource._id}
                />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDownloads;
