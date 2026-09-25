import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faExclamationTriangle,
  faSpinner,
  faArrowLeft,
  faGraduationCap,
  faFileExcel,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function SupplementaryMarkEntry() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [applications, setApplications] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({}); // track saving state per application
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t._id === selectedTemplateId);
      setSelectedTemplate(template || null);
      fetchMyApplications(selectedTemplateId);
    } else {
      setSelectedTemplate(null);
      setApplications([]);
    }
  }, [selectedTemplateId, templates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get("/supplementary-exam/templates");
      const list = data.data.templates || [];
      setTemplates(list);

      if (list.length > 0) {
        const openTemplate = list.find((t) => t.status === "open");
        if (openTemplate) {
          setSelectedTemplateId(openTemplate._id);
        } else {
          setSelectedTemplateId(list[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching supplementary exam templates:", error);
      toast.error("Failed to load supplementary exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async (templateId) => {
    try {
      setLoading(true);
      const url = `/supplementary-exam/my-applications?examTemplateId=${templateId}`;
      const { data } = await Axios.get(url);
      setApplications(data.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications for mark entry");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (appId, subjectName, markValue) => {
    setApplications((prevApps) =>
      prevApps.map((app) => {
        if (app._id === appId) {
          // ensure subjectMarks array exists
          let sm = Array.isArray(app.subjectMarks) ? [...app.subjectMarks] : [];
          const idx = sm.findIndex((s) => s.subjectName === subjectName);
          if (idx !== -1) {
            sm[idx].mark = markValue;
          } else {
            sm.push({ subjectName, mark: markValue });
          }
          return { ...app, subjectMarks: sm };
        }
        return app;
      })
    );
  };

  const handleAutoSaveMarks = async (appId) => {
    const app = applications.find((a) => a._id === appId);
    if (!app) return;

    try {
      setSaving((prev) => ({ ...prev, [appId]: true }));
      await Axios.patch(`/supplementary-exam/application/${appId}/marks`, {
        subjectMarks: app.subjectMarks || [],
      });
      toast.success(`Marks saved successfully for ${app.registerNo}`);
    } catch (error) {
      console.error("Save marks error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save marks"
      );
    } finally {
      setSaving((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedTemplateId) return toast.warn("Select an exam session first");
    try {
      const response = await Axios.get(`/supplementary-exam/marks-template/${selectedTemplateId}`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "supplementary_marks_template.xlsx"; anchor.click(); URL.revokeObjectURL(url);
    } catch (error) { toast.error(error.response?.data?.message || "Could not download the template"); }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file || !selectedTemplateId) return;
    const formData = new FormData(); formData.append("file", file);
    try {
      setImporting(true);
      const { data } = await Axios.post(`/supplementary-exam/marks-import/${selectedTemplateId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(data.message);
      if (data.data?.errors?.length) toast.warn(`${data.data.errors.length} row(s) skipped. Check the template values.`);
      fetchMyApplications(selectedTemplateId);
    } catch (error) { toast.error(error.response?.data?.message || "Excel import failed"); }
    finally { setImporting(false); }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      app.registerNo?.toLowerCase().includes(term) ||
      app.studentName?.toLowerCase().includes(term) ||
      app.semester?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              to="/centre-supplementary-exam"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2 mb-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Supplementary Center
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
              Supplementary Mark Entry
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Enter marks for students who applied for supplementary exams.
            </p>
          </div>
        </div>

        {/* Exam Session Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
              SELECT SUPPLEMENTARY EXAM SESSION
            </label>
          </div>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 text-base border font-semibold text-gray-800"
          >
            <option value="">-- Select Exam Session --</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title} — [{t.status === "open" ? "OPEN" : "CLOSED"}]
              </option>
            ))}
          </select>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button onClick={handleDownloadTemplate} disabled={!selectedTemplateId} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
              <FontAwesomeIcon icon={faDownload} /> Download demo Excel
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              <FontAwesomeIcon icon={faFileExcel} /> {importing ? "Importing marks..." : "Import filled Excel"}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} disabled={importing || !selectedTemplateId} />
            </label>
          </div>
          <p className="mt-3 text-xs text-gray-500">Download the Excel file, enter marks under each subject header, and upload it back. Marks must be between 0 and 100.</p>
        </div>

        {/* Mark Entry Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span>Students Applied</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {filteredApplications.length}
                </span>
              </h3>
            </div>
            {/* Filter / Search input */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Reg No or Name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg pl-8 pr-3 py-2 w-48 sm:w-64 focus:ring-blue-500 focus:border-blue-500"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-2.5 top-2.5 text-gray-400 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-6 py-3">Sl No</th>
                  <th className="px-6 py-3">Student Details</th>
                  <th className="px-6 py-3">Semester</th>
                  {Array.from(new Set(filteredApplications.flatMap((app) => app.subjects || []))).map((subject) => (
                    <th key={subject} className="px-6 py-3 text-center">{subject}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-blue-600" />
                    </td>
                  </tr>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((app, idx) => {
                    const smMap = {};
                    if (Array.isArray(app.subjectMarks)) {
                      app.subjectMarks.forEach(sm => {
                        smMap[sm.subjectName] = sm.mark || "";
                      });
                    }

                    return (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{app.registerNo}</div>
                          <div className="text-gray-600 text-xs mt-1">{app.studentName}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-blue-700">{app.semester}</td>
                        {Array.from(new Set(filteredApplications.flatMap((item) => item.subjects || []))).map((sub) => (
                          <td key={sub} className="px-6 py-4 text-center">
                            {app.subjects?.includes(sub) ? <input type="text" inputMode="numeric" maxLength={3} value={smMap[sub] ?? ""} onChange={(e) => handleMarkChange(app._id, sub, e.target.value.replace(/\D/g, "").slice(0, 3))} onBlur={() => handleAutoSaveMarks(app._id)} placeholder="0" className="w-20 border border-gray-300 rounded p-1 text-sm text-center focus:ring-blue-500 focus:border-blue-500" /> : <span className="text-gray-300">—</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchFilter
                        ? "No applications matched your search."
                        : "No supplementary applications found for this session."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupplementaryMarkEntry;
