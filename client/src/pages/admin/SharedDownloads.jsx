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
  faFilePowerpoint,
  faFileZipper,
  faFileLines,
  faInbox,
  faSearch,
  faFolderOpen,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Axios from "../../Axios";

// Rich metadata per file type: gradient tile + tinted badge.
const getFileMeta = (fileType) => {
  switch ((fileType || "").toLowerCase()) {
    case "pdf":
      return {
        icon: faFilePdf,
        gradient: "from-red-500 to-rose-600",
        tint: "bg-red-50 text-red-600",
        label: "PDF",
      };
    case "xls":
    case "xlsx":
    case "csv":
      return {
        icon: faFileExcel,
        gradient: "from-emerald-500 to-green-600",
        tint: "bg-emerald-50 text-emerald-600",
        label: "Sheet",
      };
    case "doc":
    case "docx":
      return {
        icon: faFileWord,
        gradient: "from-blue-500 to-indigo-600",
        tint: "bg-blue-50 text-blue-600",
        label: "Doc",
      };
    case "ppt":
    case "pptx":
      return {
        icon: faFilePowerpoint,
        gradient: "from-orange-500 to-amber-600",
        tint: "bg-orange-50 text-orange-600",
        label: "Slides",
      };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return {
        icon: faFileImage,
        gradient: "from-violet-500 to-purple-600",
        tint: "bg-violet-50 text-violet-600",
        label: "Image",
      };
    case "zip":
    case "rar":
    case "7z":
      return {
        icon: faFileZipper,
        gradient: "from-amber-500 to-yellow-600",
        tint: "bg-amber-50 text-amber-600",
        label: "Archive",
      };
    default:
      return {
        icon: faFileLines,
        gradient: "from-slate-500 to-slate-700",
        tint: "bg-slate-100 text-slate-600",
        label: "File",
      };
  }
};

function SharedDownloads() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleDownload = async (resource) => {
    setDownloadingId(resource._id);
    try {
      const response = await fetch(resource.fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = resource.fileName || resource.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = resources.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* --- Hero Header --- */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-200 ring-1 ring-inset ring-white/20">
                <FontAwesomeIcon icon={faFolderOpen} className="h-3 w-3" />
                Resources
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Shared Files
              </h1>
              <p className="mt-2 max-w-xl text-slate-300">
                Files shared with you by the administration. Download and save
                them anytime.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files by title..."
                className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 backdrop-blur transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </header>

        {/* --- Count --- */}
        {!loading && filtered.length > 0 && (
          <p className="mb-5 text-sm font-medium text-slate-500">
            {filtered.length} {filtered.length === 1 ? "file" : "files"} available
          </p>
        )}

        {/* --- Content --- */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="mt-6 h-10 w-full rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
              <FontAwesomeIcon icon={faInbox} className="text-2xl text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              No Files Available
            </h3>
            <p className="mt-1 text-slate-500">
              {search
                ? "No files match your search."
                : "There are currently no files shared with you."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const meta = getFileMeta(r.fileType);
              const isDownloading = downloadingId === r._id;
              return (
                <div
                  key={r._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${meta.gradient}`}
                    >
                      <FontAwesomeIcon icon={meta.icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.tint}`}
                      >
                        {meta.label}
                      </span>
                      <p className="mt-1.5 break-words text-base font-semibold leading-tight text-slate-800">
                        {r.title}
                      </p>
                    </div>
                  </div>

                  {r.createdAt && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <FontAwesomeIcon icon={faCalendarDays} className="h-3 w-3" />
                      <span>{moment(r.createdAt).format("DD MMM YYYY")}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleDownload(r)}
                    disabled={isDownloading}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FontAwesomeIcon
                      icon={isDownloading ? faSpinner : faDownload}
                      spin={isDownloading}
                    />
                    {isDownloading ? "Downloading..." : "Download"}
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
