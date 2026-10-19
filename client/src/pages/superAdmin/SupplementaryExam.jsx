import React, { useState, useEffect } from "react";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faRefresh,
  faSearch,
  faCalendarAlt,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function SupplementaryExam() {
  const [activeTab, setActiveTab] = useState("templates"); // 'templates' | 'applications' | 'results'
  const [templates, setTemplates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("all");
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Result tab filters
  const [resultCollegeFilter, setResultCollegeFilter] = useState("all");
  const [resultSemesterFilter, setResultSemesterFilter] = useState("all");
  const [resultStatusFilter, setResultStatusFilter] = useState("all"); // 'all' | 'Pass' | 'Fail' | 'Pending'
  const [resultSearchQuery, setResultSearchQuery] = useState("");

  // Modal / Form state for Template Creation & Editing
  const [showModal, setShowModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [semesters, setSemesters] = useState([
    { semesterName: "", subjectsText: "", schedules: [] },
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
          schedules: Array.isArray(s.schedules) ? s.schedules : [],
        }))
      );
    } else {
      setEditingTemplateId(null);
      setExamTitle("");
      setSemesters([{ semesterName: "", subjectsText: "", schedules: [] }]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplateId(null);
    setExamTitle("");
    setSemesters([{ semesterName: "", subjectsText: "", schedules: [] }]);
  };

  const handleAddSemesterRow = () => {
    setSemesters([...semesters, { semesterName: "", subjectsText: "", schedules: [] }]);
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

  const handleScheduleChange = (semIdx, subjectName, field, value) => {
    const updated = [...semesters];
    const curSem = updated[semIdx];
    const curSchedules = curSem.schedules ? [...curSem.schedules] : [];
    const existingIdx = curSchedules.findIndex(
      (s) => s.subjectName?.trim().toUpperCase() === subjectName.trim().toUpperCase()
    );
    if (existingIdx !== -1) {
      curSchedules[existingIdx] = {
        ...curSchedules[existingIdx],
        [field]: value,
      };
    } else {
      curSchedules.push({
        subjectName,
        date: field === "date" ? value : "",
        time: field === "time" ? value : "",
      });
    }
    curSem.schedules = curSchedules;
    setSemesters(updated);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();

    if (!examTitle.trim()) {
      toast.warn("Please enter exam title (e.g. MAHDIYYA ODD SEMESTER 2026)");
      return;
    }

    const formattedSemesters = semesters
      .map((s) => {
        const subjects = s.subjectsText
          .split(",")
          .map((sub) => sub.trim())
          .filter(Boolean);
        const schedules = subjects.map((sub) => {
          const found = (s.schedules || []).find(
            (sch) => sch.subjectName?.trim().toUpperCase() === sub.toUpperCase()
          );
          return {
            subjectName: sub,
            date: found?.date || "",
            time: found?.time || "",
          };
        });
        return {
          semesterName: s.semesterName.trim(),
          subjects,
          schedules,
        };
      })
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
      const collegeQuery = selectedCollegeFilter !== "all" ? `?branchId=${selectedCollegeFilter}` : "";
      const url = `/supplementary-exam/export-excel/${selectedTemplateFilter || "all"}${collegeQuery}`;
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

  const handleExportResults = async () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams({ includeMarks: "true" });
      if (selectedTemplateFilter !== "all") params.set("templateId", selectedTemplateFilter);
      if (selectedCollegeFilter !== "all") params.set("branchId", selectedCollegeFilter);
      const response = await Axios.get(`/supplementary-exam/export-excel/all?${params.toString()}`, { responseType: "blob" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.download = "Supplementary_Results.xlsx";
      document.body.appendChild(link); link.click(); link.remove();
      toast.success("Results exported successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export results.");
    } finally { setExportLoading(false); }
  };

  const colleges = [...new Map(applications.filter((app) => app.branch?._id).map((app) => [
    app.branch._id,
    { id: app.branch._id, name: app.branch.studyCentreName || app.studyCentreName, code: app.branch.studyCentreCode || app.studyCentreCode },
  ])).values()];
  const visibleApplications = applications.filter((app) => selectedCollegeFilter === "all" || app.branch?._id === selectedCollegeFilter);

  const semestersList = [
    ...new Set(applications.map((app) => app.semester).filter(Boolean)),
  ];

  const visibleResults = applications.filter((app) => {
    if (resultCollegeFilter !== "all" && app.branch?._id !== resultCollegeFilter) {
      return false;
    }
    if (resultSemesterFilter !== "all" && app.semester !== resultSemesterFilter) {
      return false;
    }
    if (resultSearchQuery.trim()) {
      const q = resultSearchQuery.toLowerCase().trim();
      const matchReg = (app.registerNo || "").toLowerCase().includes(q);
      const matchName = (app.studentName || "").toLowerCase().includes(q);
      if (!matchReg && !matchName) return false;
    }
    if (resultStatusFilter !== "all") {
      const res = getResultDetails(app);
      if (res.status !== resultStatusFilter) return false;
    }
    return true;
  });

  const getResultDetails = (application) => {
    const marks = Array.isArray(application.subjectMarks)
      ? application.subjectMarks
      : [];
    const markMap = new Map(
      marks.map((item) => [item.subjectName?.trim().toUpperCase(), item.mark])
    );
    const hasAllMarks = (application.subjects || []).every((subject) => {
      const mark = markMap.get(subject.trim().toUpperCase());
      return mark !== "" && mark !== null && mark !== undefined;
    });
    const passed = hasAllMarks && (application.subjects || []).every((subject) => {
      const mark = Number(markMap.get(subject.trim().toUpperCase()));
      return Number.isFinite(mark) && mark >= 40;
    });

    return {
      markMap,
      status: !hasAllMarks ? "Pending" : passed ? "Pass" : "Fail",
    };
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
            <button
              onClick={() => setActiveTab("results")}
              className={`${
                activeTab === "results"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <FontAwesomeIcon icon={faGraduationCap} />
              Supplementary Results ({applications.length})
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
              <div className="w-full sm:w-1/2 md:w-1/4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">FILTER BY COLLEGE</label>
                <select value={selectedCollegeFilter} onChange={(e) => setSelectedCollegeFilter(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm p-2 text-sm border">
                  <option value="all">All Colleges</option>
                  {colleges.map((college) => <option key={college.id} value={college.id}>{college.name || college.code || college.id}</option>)}
                </select>
              </div>

              <button
                onClick={fetchApplications}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium disabled:opacity-50 transition"
              >
                <FontAwesomeIcon icon={faRefresh} spin={loading} />
                Refresh Results
              </button>
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
              <button onClick={handleExportResults} disabled={exportLoading || visibleApplications.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm disabled:opacity-50 transition">
                <FontAwesomeIcon icon={faFileExcel} /> Export Results
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
                  {visibleApplications.length > 0 ? (
                    visibleApplications.map((app, idx) => (
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

        {/* TAB 3: SUPPLEMENTARY RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {/* Filter Toolbar Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} className="text-blue-600 text-sm" />
                    Supplementary Exam Results
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Filter, search, and view marks entered for submitted supplementary applications.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={fetchApplications}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-semibold disabled:opacity-50 transition"
                  >
                    <FontAwesomeIcon icon={faRefresh} spin={loading} />
                    Refresh Results
                  </button>
                  <button
                    onClick={handleExportResults}
                    disabled={exportLoading || applications.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 transition"
                  >
                    {exportLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faFileExcel} />}
                    Export Results Excel
                  </button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    EXAM SESSION
                  </label>
                  <select
                    value={selectedTemplateFilter}
                    onChange={(e) => setSelectedTemplateFilter(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-xs p-2 text-sm border font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Exam Sessions</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} ({t.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    STUDY CENTRE
                  </label>
                  <select
                    value={resultCollegeFilter}
                    onChange={(e) => setResultCollegeFilter(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-xs p-2 text-sm border font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Study Centres</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.name || college.code || college.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    SEMESTER
                  </label>
                  <select
                    value={resultSemesterFilter}
                    onChange={(e) => setResultSemesterFilter(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-xs p-2 text-sm border font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Semesters</option>
                    {semestersList.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    RESULT STATUS
                  </label>
                  <select
                    value={resultStatusFilter}
                    onChange={(e) => setResultStatusFilter(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-xs p-2 text-sm border font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pass">Pass Only</option>
                    <option value="Fail">Fail Only</option>
                    <option value="Pending">Pending / Incomplete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    SEARCH STUDENT
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Reg No or Name..."
                      value={resultSearchQuery}
                      onChange={(e) => setResultSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-2.5 top-3 text-gray-400 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics Chips */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                  Total Results: <strong className="text-gray-900">{visibleResults.length}</strong>
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  Passed: <strong>{visibleResults.filter((app) => getResultDetails(app).status === "Pass").length}</strong>
                </span>
                <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                  Failed: <strong>{visibleResults.filter((app) => getResultDetails(app).status === "Fail").length}</strong>
                </span>
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                  Pending Marks: <strong>{visibleResults.filter((app) => getResultDetails(app).status === "Pending").length}</strong>
                </span>
              </div>
            </div>

            {/* Results Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold border-b">
                    <tr>
                      <th className="px-6 py-3">Sl No</th>
                      <th className="px-6 py-3">Reg No</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Study Centre</th>
                      <th className="px-6 py-3">Exam / Semester</th>
                      <th className="px-6 py-3">Marks</th>
                      <th className="px-6 py-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visibleResults.length > 0 ? (
                      visibleResults.map((app, idx) => {
                        const result = getResultDetails(app);
                        return (
                          <tr key={app._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{app.registerNo}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">{app.studentName}</td>
                            <td className="px-6 py-4 text-gray-600 text-xs">
                              <div className="font-semibold">{app.studyCentreName || app.branch?.studyCentreName || "-"}</div>
                              <div className="text-gray-400">{app.studyCentreCode || app.branch?.studyCentreCode || ""}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-blue-700">{app.examTemplate?.title || "-"}</div>
                              <div className="text-xs text-gray-500 font-medium">{app.semester}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5 min-w-48">
                                {(app.subjects || []).map((subject) => {
                                  const mark = result.markMap.get(subject.trim().toUpperCase());
                                  return (
                                    <span
                                      key={subject}
                                      className="bg-gray-50 text-gray-700 border border-gray-200 text-xs px-2 py-1 rounded font-semibold"
                                    >
                                      {subject}: {mark === "" || mark === undefined ? "—" : mark}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                  result.status === "Pass"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : result.status === "Fail"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {result.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No supplementary results found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

                        {sem.subjectsText.split(",").map((s) => s.trim()).filter(Boolean).length > 0 && (
                          <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
                              Exam Timetable Schedule (Date & Time for Hall Tickets)
                            </div>
                            <div className="space-y-2">
                              {sem.subjectsText.split(",").map((s) => s.trim()).filter(Boolean).map((subName) => {
                                const curSchedule = (sem.schedules || []).find(
                                  (sch) => sch.subjectName?.trim().toUpperCase() === subName.toUpperCase()
                                );
                                return (
                                  <div key={subName} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="w-full sm:w-1/3 text-xs font-bold text-gray-800 truncate" title={subName}>
                                      {subName}
                                    </span>
                                    <div className="flex-1 flex gap-2">
                                      <input
                                        type="date"
                                        value={curSchedule?.date || ""}
                                        onChange={(e) => handleScheduleChange(idx, subName, "date", e.target.value)}
                                        className="w-1/2 text-xs border border-gray-300 rounded p-1.5 focus:ring-blue-500 focus:border-blue-500"
                                        title="Exam Date"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Time (e.g. 10:00 AM - 12:30 PM)"
                                        value={curSchedule?.time || ""}
                                        onChange={(e) => handleScheduleChange(idx, subName, "time", e.target.value)}
                                        className="w-1/2 text-xs border border-gray-300 rounded p-1.5 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
