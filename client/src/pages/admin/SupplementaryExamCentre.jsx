import React, { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function SupplementaryExamCentre() {
  const [openTemplates, setOpenTemplates] = useState([]);
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
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOpenTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = openTemplates.find((t) => t._id === selectedTemplateId);
      setSelectedTemplate(template || null);
      setSelectedSemester("");
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      fetchMyApplications(selectedTemplateId);
    } else {
      setSelectedTemplate(null);
      setMyApplications([]);
    }
  }, [selectedTemplateId, openTemplates]);

  const fetchOpenTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get("/supplementary-exam/open-templates");
      const list = data.data.templates || [];
      setOpenTemplates(list);
      if (list.length > 0) {
        setSelectedTemplateId(list[0]._id);
      }
    } catch (error) {
      console.error("Error fetching open templates:", error);
      toast.error("Failed to load open supplementary exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async (templateId) => {
    try {
      const url = templateId
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

    if (!selectedTemplateId) {
      toast.warn("Please select a Supplementary Exam");
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
      toast.error("Failed to delete application");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
            Supplementary Exam Registration
          </h1>
          <p className="text-gray-600 mt-1">
            Submit student applications for open supplementary examination sessions.
          </p>
        </div>

        {/* If NO OPEN TEMPLATES */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
          </div>
        ) : openTemplates.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 text-xl mr-4 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 text-lg">Supplementary Exam Window Closed</h3>
                <p className="text-yellow-700 mt-1 text-sm">
                  There are currently no open supplementary exams available for application submission. Please check back when the administration opens an exam session.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Exam Selection Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                SELECT SUPPLEMENTARY EXAM SESSION *
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 text-base border font-semibold text-gray-800"
              >
                {openTemplates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Application Form */}
            {selectedTemplate && (
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
                      ENTER YOUR REGISTER NUMBER HERE:{" "}
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
                      <div className="mt-2 text-xs font-semibold text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 text-base" />
                          <span>Student details not found in database.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddStudentForm(true)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-xs flex items-center gap-1.5"
                        >
                          <FontAwesomeIcon icon={faUserPlus} />
                          Add Student for Supplementary
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STEP 2: STUDENT NAME */}
                  {(studentSearchStatus === "found" || showAddStudentForm || studentName) && (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">
                        ENTER YOUR NAME: *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. JANISH"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm uppercase font-semibold focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      {isManualStudent && (
                        <span className="text-xs text-amber-600 block mt-1 font-medium">
                          Note: Student details entered manually for supplementary exam submission.
                        </span>
                      )}
                    </div>
                  )}

                  {/* STEP 3: CHOOSE SEMESTER */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      CHOOSE YOUR SEMESTER: *
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => handleSemesterChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm font-semibold focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>
                        -- Select Semester --
                      </option>
                      {selectedTemplate.semesters?.map((sem, sIdx) => (
                        <option key={sIdx} value={sem.semesterName}>
                          {sem.semesterName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STEP 4: SELECT SUBJECTS FOR SUPPLEMENTARY */}
                  {selectedSemester && (
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2 border-gray-200">
                        <label className="block text-sm font-bold text-gray-900">
                          SUBJECTS OF {selectedSemester.toUpperCase()}
                          <span className="block text-xs font-normal text-gray-600 mt-0.5">
                            SELECT YOUR SUBJECTS FOR SUPPLEMENTARY *
                          </span>
                        </label>
                        {availableSubjects.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSelectAllSubjects}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            {selectedSubjects.length === availableSubjects.length
                              ? "Deselect All"
                              : "Select All"}
                          </button>
                        )}
                      </div>

                      {availableSubjects.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          No subjects allotted for this semester in the exam template.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {availableSubjects.map((subj, subIdx) => {
                            const isChecked = selectedSubjects.includes(subj);
                            return (
                              <label
                                key={subIdx}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                  isChecked
                                    ? "bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm"
                                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 font-medium"
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
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-800 text-base">
                  Submitted Applications for Selected Exam
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold border-b">
                    <tr>
                      <th className="px-6 py-3">Sl No</th>
                      <th className="px-6 py-3">Reg No</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Semester</th>
                      <th className="px-6 py-3">Selected Subjects</th>
                      <th className="px-6 py-3">Submitted At</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myApplications.length > 0 ? (
                      myApplications.map((app, idx) => (
                        <tr key={app._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{app.registerNo}</td>
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {app.studentName}
                            {app.isManualStudent && (
                              <span className="ml-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-normal">
                                Manual Entry
                              </span>
                            )}
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
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteApplication(app._id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                              title="Delete Application"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No supplementary applications submitted by your centre for this exam session yet.
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
