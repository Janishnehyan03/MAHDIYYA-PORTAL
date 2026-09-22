import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheckCircle,
  faExclamationTriangle,
  faUserPlus,
  faSpinner,
  faTrash,
  faPaperPlane,
  faFileAlt,
  faGraduationCap,
  faLock,
  faFileExcel,
  faInfoCircle,
  faFileArchive,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function SupplementaryExamCentre() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form Fields
  const [registerNo, setRegisterNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [studentSearchStatus, setStudentSearchStatus] = useState(null); // 'found' | 'not_found' | null
  const [isManualStudent, setIsManualStudent] = useState(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Submissions list
  const [myApplications, setMyApplications] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "all") {
      const template = templates.find((t) => t._id === selectedTemplateId);
      setSelectedTemplate(template || null);
      setSelectedSemester("");
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      fetchMyApplications(selectedTemplateId);
    } else if (selectedTemplateId === "all") {
      setSelectedTemplate(null);
      setSelectedSemester("");
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      fetchMyApplications("all");
    } else {
      setSelectedTemplate(null);
      setMyApplications([]);
    }
  }, [selectedTemplateId, templates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Fetch all templates (accessible to study centre admin and superAdmin)
      let list = [];
      try {
        const { data } = await Axios.get("/supplementary-exam/templates");
        list = data.data.templates || [];
      } catch (err) {
        // Fallback to open-templates if /templates encounters an issue
        const { data } = await Axios.get("/supplementary-exam/open-templates");
        list = data.data.templates || [];
      }

      setTemplates(list);

      if (list.length > 0) {
        // Prioritize first open template, otherwise choose the latest template
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
      const url =
        templateId && templateId !== "all"
          ? `/supplementary-exam/my-applications?examTemplateId=${templateId}`
          : "/supplementary-exam/my-applications";
      const { data } = await Axios.get(url);
      setMyApplications(data.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // 1. Search Student in DB by Register Number
  const handleSearchStudent = async () => {
    if (!registerNo.trim()) {
      toast.warn("Please enter Register Number first");
      return;
    }

    try {
      setIsSearchingStudent(true);
      setStudentSearchStatus(null);

      const { data } = await Axios.get(
        `/supplementary-exam/search-student/${encodeURIComponent(registerNo.trim())}`
      );

      if (data.found) {
        setStudentName(data.data.studentName);
        setStudentSearchStatus("found");
        setIsManualStudent(false);
        setShowAddStudentForm(false);
        toast.success(`Student found: ${data.data.studentName}`);
      } else {
        setStudentSearchStatus("not_found");
        setStudentName("");
        setIsManualStudent(true);
        setShowAddStudentForm(true);
        toast.info("Student not found in database. Click 'Add Student' to enter details.");
      }
    } catch (error) {
      console.error("Search student error:", error);
      toast.error("Error searching student details");
    } finally {
      setIsSearchingStudent(false);
    }
  };

  // 2. Handle Semester Selection change
  const handleSemesterChange = (semesterName) => {
    setSelectedSemester(semesterName);
    setSelectedSubjects([]);

    if (selectedTemplate && selectedTemplate.semesters) {
      const semObj = selectedTemplate.semesters.find(
        (s) => s.semesterName === semesterName
      );
      setAvailableSubjects(semObj ? semObj.subjects || [] : []);
    } else {
      setAvailableSubjects([]);
    }
  };

  // 3. Handle Subject Checkbox toggle
  const handleSubjectToggle = (subj) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleSelectAllSubjects = () => {
    if (selectedSubjects.length === availableSubjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects([...availableSubjects]);
    }
  };

  // 4. Submit Application
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTemplateId || selectedTemplateId === "all") {
      toast.warn("Please select an active Supplementary Exam");
      return;
    }

    if (selectedTemplate?.status !== "open") {
      toast.error("This supplementary exam session is closed for submissions.");
      return;
    }

    if (!registerNo.trim()) {
      toast.warn("Please enter Register Number");
      return;
    }

    if (!studentName.trim()) {
      toast.warn("Please enter Student Name");
      return;
    }

    if (!selectedSemester) {
      toast.warn("Please choose a Semester");
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.warn("Please select at least one subject for supplementary");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        examTemplateId: selectedTemplateId,
        registerNo: registerNo.trim().toUpperCase(),
        studentName: studentName.trim().toUpperCase(),
        semester: selectedSemester,
        subjects: selectedSubjects,
        isManualStudent,
      };

      const { data } = await Axios.post(
        "/supplementary-exam/submit-application",
        payload
      );

      toast.success(data.message || "Application submitted successfully!");

      // Reset form
      setRegisterNo("");
      setStudentName("");
      setStudentSearchStatus(null);
      setIsManualStudent(false);
      setShowAddStudentForm(false);
      setSelectedSemester("");
      setSelectedSubjects([]);
      setAvailableSubjects([]);

      // Refresh submissions
      fetchMyApplications(selectedTemplateId);
    } catch (error) {
      console.error("Submit application error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit supplementary application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }
    try {
      await Axios.delete(`/supplementary-exam/application/${appId}`);
      toast.success("Application deleted successfully");
      fetchMyApplications(selectedTemplateId);
    } catch (error) {
      console.error("Delete application error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete application"
      );
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const url = `/supplementary-exam/export-excel/${selectedTemplateId || "all"}`;
      const response = await Axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const fileName =
        selectedTemplate && selectedTemplateId !== "all"
          ? `Supplementary_${selectedTemplate.title.replace(/\s+/g, "_")}.xlsx`
          : "Supplementary_Applications_All.xlsx";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Applications exported to Excel successfully");
    } catch (error) {
      console.error("Export Excel error:", error);
      toast.error(error.response?.data?.message || "Failed to export applications to Excel");
    } finally {
      setExporting(false);
    }
  };

  // Filter applications by search term
  const filteredApplications = myApplications.filter((app) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      app.registerNo?.toLowerCase().includes(term) ||
      app.studentName?.toLowerCase().includes(term) ||
      app.semester?.toLowerCase().includes(term)
    );
  });

  const isCurrentTemplateOpen = selectedTemplate?.status === "open";
  const allTemplatesClosed =
    templates.length > 0 && templates.every((t) => t.status === "closed");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
              Supplementary Exam Applications
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Submit student applications for open sessions and view all submitted supplementary applications from your study centre.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/supplementary-hall-tickets"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <FontAwesomeIcon icon={faFileArchive} />
              Hall Tickets
            </Link>

            {myApplications.length > 0 && (
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
              >
                {exporting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faFileExcel} />
                )}
                Export to Excel
              </button>
            )}
          </div>
        </div>

        {/* Global Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 text-xl mr-4 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 text-lg">No Supplementary Exam Sessions Available</h3>
                <p className="text-yellow-700 mt-1 text-sm">
                  There are currently no supplementary exam sessions found in the portal. Please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Exam Session Selection Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  SELECT SUPPLEMENTARY EXAM SESSION
                </label>

                {/* Status Indicator */}
                {selectedTemplate && (
                  <div>
                    {isCurrentTemplateOpen ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        SESSION OPEN (Accepting Submissions)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <FontAwesomeIcon icon={faLock} className="text-xs text-amber-600" />
                        SESSION CLOSED (View Only)
                      </span>
                    )}
                  </div>
                )}
                {selectedTemplateId === "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <FontAwesomeIcon icon={faFileAlt} className="text-xs text-blue-600" />
                    ALL SESSIONS (Viewing All Applications)
                  </span>
                )}
              </div>

              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 text-base border font-semibold text-gray-800"
              >
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} — [{t.status === "open" ? "OPEN" : "CLOSED"}]
                  </option>
                ))}
                <option value="all">-- All Exam Sessions (View All Submitted Applications) --</option>
              </select>
            </div>

            {/* Information Banner when Closed or All Sessions */}
            {!isCurrentTemplateOpen && selectedTemplate && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0">
                    <FontAwesomeIcon icon={faLock} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-base">
                      Supplementary Exam Window Closed
                    </h3>
                    <p className="text-amber-800 text-sm mt-1">
                      The application window for <strong>"{selectedTemplate.title}"</strong> is closed. New applications cannot be submitted or deleted, but you can view all applications submitted by your study centre below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTemplateId === "all" && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700 flex-shrink-0">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-base">
                      Viewing Applications Across All Sessions
                    </h3>
                    <p className="text-blue-800 text-sm mt-1">
                      Displaying all supplementary applications submitted by your study centre across all exam sessions. To submit new applications, select an active <strong>OPEN</strong> session from the dropdown above.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATION FORM - Only rendered when selected session is OPEN */}
            {isCurrentTemplateOpen && selectedTemplate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={faFileAlt} />
                    Supplementary Exam Application Form
                  </h2>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Session: {selectedTemplate.title}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* STEP 1: REGISTER NUMBER */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      ENTER REGISTER NUMBER:{" "}
                      <span className="text-xs font-normal text-blue-600">
                        (Add CMS/DMS.. before number) *
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. CMS85555"
                        value={registerNo}
                        onChange={(e) => {
                          setRegisterNo(e.target.value);
                          setStudentSearchStatus(null);
                        }}
                        onBlur={() => {
                          if (registerNo.trim() && !studentSearchStatus) {
                            handleSearchStudent();
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm uppercase font-semibold focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSearchStudent}
                        disabled={isSearchingStudent || !registerNo.trim()}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSearchingStudent ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faSearch} />
                        )}
                        Fetch Student
                      </button>
                    </div>

                    {/* Status Feedback */}
                    {studentSearchStatus === "found" && (
                      <div className="mt-2 text-xs font-semibold text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-base" />
                        Student details found in database: <strong>{studentName}</strong>
                      </div>
                    )}

                    {studentSearchStatus === "not_found" && (
                      <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 text-base" />
                          <span>Student not found with this register number.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddStudentForm(true);
                            setIsManualStudent(true);
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <FontAwesomeIcon icon={faUserPlus} />
                          Add Student
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 2: STUDENT DETAILS */}
                  {studentName && !showAddStudentForm && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        STUDENT NAME
                      </label>
                      <p className="text-base font-bold text-gray-900">{studentName}</p>
                    </div>
                  )}

                  {/* MANUAL STUDENT ENTRY FORM */}
                  {showAddStudentForm && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faUserPlus} />
                          Add Student for Supplementary
                        </h4>
                        <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                          Manual Entry
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          STUDENT NAME *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter full student name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm uppercase font-semibold focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Note: Student details entered manually for supplementary exam submission.
                      </p>
                    </div>
                  )}

                  {/* STEP 3: SELECT SEMESTER */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      SELECT SEMESTER *
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => handleSemesterChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm font-semibold focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Choose Semester --</option>
                      {selectedTemplate.semesters?.map((sem, idx) => (
                        <option key={idx} value={sem.semesterName}>
                          {sem.semesterName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STEP 4: SELECT SUBJECTS FOR SUPPLEMENTARY */}
                  {selectedSemester && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          SELECT YOUR SUBJECTS FOR SUPPLEMENTARY *
                        </label>
                        {availableSubjects.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSelectAllSubjects}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            {selectedSubjects.length === availableSubjects.length
                              ? "Deselect All"
                              : "Select All"}
                          </button>
                        )}
                      </div>

                      {availableSubjects.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          No subjects configured for this semester.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {availableSubjects.map((subj, idx) => {
                            const isChecked = selectedSubjects.includes(subj);
                            return (
                              <label
                                key={idx}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                  isChecked
                                    ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold"
                                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleSubjectToggle(subj)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm">{subj}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-base transition"
                    >
                      {submitting ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} />
                      )}
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* MY SUBMITTED APPLICATIONS LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <span>Submitted Applications from Your Study Centre</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {filteredApplications.length}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedTemplateId === "all"
                      ? "Showing applications across all supplementary sessions"
                      : `Showing applications for: ${selectedTemplate ? selectedTemplate.title : "Selected Exam"}`}
                  </p>
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
                      <th className="px-6 py-3">Reg No</th>
                      <th className="px-6 py-3">Student Name</th>
                      {selectedTemplateId === "all" && (
                        <th className="px-6 py-3">Exam Session</th>
                      )}
                      <th className="px-6 py-3">Semester</th>
                      <th className="px-6 py-3">Selected Subjects</th>
                      <th className="px-6 py-3">Submitted At</th>
                      <th className="px-6 py-3 text-center">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app, idx) => {
                        const isAppFromOpenSession =
                          app.examTemplate?.status === "open";

                        return (
                          <tr key={app._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{app.registerNo}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {app.studentName}
                              {app.isManualStudent && (
                                <span className="ml-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-normal">
                                  Manual
                                </span>
                              )}
                            </td>
                            {selectedTemplateId === "all" && (
                              <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                                {app.examTemplate?.title || "N/A"}
                              </td>
                            )}
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
                            <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isAppFromOpenSession ? (
                                <button
                                  onClick={() => handleDeleteApplication(app._id)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                                  title="Delete Application"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium cursor-not-allowed"
                                  title="Exam window closed. Applications cannot be modified or deleted."
                                >
                                  <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                                  Closed
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={selectedTemplateId === "all" ? 8 : 7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          {searchFilter
                            ? "No applications matched your search."
                            : "No supplementary applications submitted by your centre for this exam session yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplementaryExamCentre;
