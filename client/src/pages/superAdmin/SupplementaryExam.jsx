import React, { useState, useEffect } from "react";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faPlus,
  faSpinner,
  faTrash,
  faEdit,
  faToggleOn,
  faToggleOff,
  faList,
  faFileExcel,
  faBookOpen,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function SupplementaryExam() {
  const [activeTab, setActiveTab] = useState("templates"); // 'templates' | 'applications'
  const [templates, setTemplates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Modal / Form state for Template Creation & Editing
  const [showModal, setShowModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [semesters, setSemesters] = useState([
    { semesterName: "", subjectsText: "" },
  ]);

  useEffect(() => {
    fetchTemplates();
    fetchApplications();
  }, [selectedTemplateFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get("/supplementary-exam/templates");
      setTemplates(data.data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load exam templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const url =
        selectedTemplateFilter && selectedTemplateFilter !== "all"
          ? `/supplementary-exam/super-admin-applications?examTemplateId=${selectedTemplateFilter}`
          : "/supplementary-exam/super-admin-applications";
      const { data } = await Axios.get(url);
      setApplications(data.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplateId(template._id);
      setExamTitle(template.title);
      setSemesters(
        template.semesters.map((s) => ({
          semesterName: s.semesterName,
          subjectsText: Array.isArray(s.subjects) ? s.subjects.join(", ") : "",
        }))
      );
    } else {
      setEditingTemplateId(null);
      setExamTitle("");
      setSemesters([{ semesterName: "", subjectsText: "" }]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplateId(null);
    setExamTitle("");
    setSemesters([{ semesterName: "", subjectsText: "" }]);
  };

  const handleAddSemesterRow = () => {
    setSemesters([...semesters, { semesterName: "", subjectsText: "" }]);
  };

  const handleRemoveSemesterRow = (index) => {
    if (semesters.length === 1) {
      toast.warn("At least one semester is required");
      return;
    }
    const updated = [...semesters];
    updated.splice(index, 1);
    setSemesters(updated);
  };

  const handleSemesterChange = (index, field, value) => {
    const updated = [...semesters];
    updated[index][field] = value;
    setSemesters(updated);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();

    if (!examTitle.trim()) {
      toast.warn("Please enter exam title (e.g. MAHDIYYA ODD SEMESTER 2026)");
      return;
    }

    const formattedSemesters = semesters
      .map((s) => ({
        semesterName: s.semesterName.trim(),
        subjects: s.subjectsText
          .split(",")
          .map((sub) => sub.trim())
          .filter(Boolean),
      }))
      .filter((s) => s.semesterName !== "");

    if (formattedSemesters.length === 0) {
      toast.warn("Please provide at least one valid semester name and subjects");
      return;
    }

    try {
      setLoading(true);
      if (editingTemplateId) {
        await Axios.put(`/supplementary-exam/templates/${editingTemplateId}`, {
          title: examTitle,
          semesters: formattedSemesters,
        });
        toast.success("Exam template updated successfully");
      } else {
        await Axios.post("/supplementary-exam/templates", {
          title: examTitle,
          semesters: formattedSemesters,
        });
        toast.success("Exam template created successfully");
      }
      handleCloseModal();
      fetchTemplates();
    } catch (error) {
      console.error("Save template error:", error);
      toast.error(error.response?.data?.message || "Failed to save exam template");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (templateId) => {
    try {
      const { data } = await Axios.patch(
        `/supplementary-exam/templates/${templateId}/toggle-status`
      );
      toast.success(data.message);
      fetchTemplates();
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this exam template? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await Axios.delete(`/supplementary-exam/templates/${templateId}`);
      toast.success("Exam template deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Delete template error:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const url = `/supplementary-exam/export-excel/${selectedTemplateFilter || "all"}`;
      const response = await Axios.get(url, { responseType: "blob" });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const templateObj = templates.find((t) => t._id === selectedTemplateFilter);
      const fileName = templateObj
        ? `Supplementary_${templateObj.title.replace(/\s+/g, "_")}.xlsx`
        : "Supplementary_Applications_All.xlsx";

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error(
        error.response?.data?.message || "Failed to export Excel. No records found."
      );
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
              Supplementary Exam Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create exam templates, allot custom semesters and subjects, control open/close entry status, and export application reports.
            </p>
          </div>
          {activeTab === "templates" && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition duration-150"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Exam Template
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("templates")}
              className={`${
                activeTab === "templates"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <FontAwesomeIcon icon={faBookOpen} />
              Exam Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`${
                activeTab === "applications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <FontAwesomeIcon icon={faList} />
              Submitted Applications ({applications.length})
            </button>
          </nav>
        </div>

        {/* TAB 1: EXAM TEMPLATES */}
        {activeTab === "templates" && (
          <div>
            {loading && templates.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FontAwesomeIcon icon={faBookOpen} className="text-5xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Exam Templates Found</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">
                  Create exam templates like "MAHDIYYA ODD SEMESTER 2026" with custom semesters and subjects to enable study centres to submit supplementary applications.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Create First Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{template.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            template.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {template.status === "open" ? "OPEN FOR ENTRY" : "CLOSED"}
                        </span>
                      </div>

                      <div className="space-y-3 mt-4 border-t pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Semesters & Allotted Subjects ({template.semesters?.length || 0})
                        </h4>
                        {template.semesters?.map((sem, sIdx) => (
                          <div key={sIdx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="font-semibold text-sm text-gray-800 block mb-1">
                              {sem.semesterName}
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {sem.subjects?.map((sub, subIdx) => (
                                <span
                                  key={subIdx}
                                  className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium border border-blue-200"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-3 border-t flex justify-between items-center">
                      <button
                        onClick={() => handleToggleStatus(template._id)}
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded transition ${
                          template.status === "open"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        <FontAwesomeIcon icon={template.status === "open" ? faToggleOn : faToggleOff} />
                        {template.status === "open" ? "Close Submissions" : "Open Submissions"}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(template)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit Template"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Template"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBMITTED APPLICATIONS & EXCEL EXPORT */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  FILTER BY EXAM TEMPLATE
                </label>
                <select
                  value={selectedTemplateFilter}
                  onChange={(e) => setSelectedTemplateFilter(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm border"
                >
                  <option value="all">All Exam Templates</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportExcel}
                disabled={exportLoading || applications.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-50 transition"
              >
                {exportLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faFileExcel} />
                )}
                Export to Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold border-b">
                  <tr>
                    <th className="px-6 py-3">Sl No</th>
                    <th className="px-6 py-3">Reg No</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Study Centre</th>
                    <th className="px-6 py-3">Semester</th>
                    <th className="px-6 py-3">Selected Subjects</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.length > 0 ? (
                    applications.map((app, idx) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{app.registerNo}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{app.studentName}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {app.studyCentreName} ({app.studyCentreCode})
                        </td>
                        <td className="px-6 py-4 font-medium text-blue-700">{app.semester}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {app.subjects?.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2 py-0.5 rounded font-semibold"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No supplementary applications submitted for this selection yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL FOR CREATE / EDIT EXAM TEMPLATE */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                {editingTemplateId ? "Edit Exam Template" : "Create Exam Template"}
              </h2>

              <form onSubmit={handleSaveTemplate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    EXAM TEMPLATE TITLE *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MAHDIYYA ODD SEMESTER 2026 or EVEN SEMESTER 2026"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      SEMESTERS & SUBJECTS ALLOTMENT
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSemesterRow}
                      className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded hover:bg-blue-100"
                    >
                      + Add Semester
                    </button>
                  </div>

                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {semesters.map((sem, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative space-y-3"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <input
                            type="text"
                            placeholder="Semester Name (e.g. CMS FIRST SEM)"
                            value={sem.semesterName}
                            onChange={(e) =>
                              handleSemesterChange(idx, "semesterName", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {semesters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSemesterRow(idx)}
                              className="text-red-500 hover:text-red-700 p-2 text-sm"
                              title="Remove Semester"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">
                            SUBJECTS (Comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. HADITH, AQIDAH, FIQH, NAHV, TARIQ"
                            value={sem.subjectsText}
                            onChange={(e) =>
                              handleSemesterChange(idx, "subjectsText", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            Enter all subject names separated by commas.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2"
                  >
                    {loading && <FontAwesomeIcon icon={faSpinner} spin />}
                    Save Exam Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplementaryExam;
