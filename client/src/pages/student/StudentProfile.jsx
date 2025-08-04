import {
  faArrowRight,
  faCheckCircle,
  faEdit,
  faExclamationTriangle,
  faTrash,
  faPercent,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../Axios";
import { UserAuthContext } from "../../context/userContext";

// --- Reusable UI Components (can be moved to their own files) ---

// 1. Profile Skeleton Loader
const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 animate-pulse">
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="w-24 h-24 bg-slate-200 rounded-full flex-shrink-0"></div>
      <div className="flex-grow w-full">
        <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-5 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

// 2. Info Item for key-value pairs
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-100">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm text-slate-800 sm:mt-0 font-semibold">
      {value || "N/A"}
    </dd>
  </div>
);

// 3. Initials Avatar
const ProfileAvatar = ({ name = "" }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
      <span className="text-3xl font-bold text-indigo-600">{initials}</span>
    </div>
  );
};

// 4. Confirmation Modal
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  type = "info",
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: "bg-red-600 hover:bg-red-700",
    success: "bg-green-600 hover:bg-green-700",
    info: "bg-indigo-600 hover:bg-indigo-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md font-semibold ${colors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Student Profile Component ---

// ...all your imports and component code above remain unchanged...

// --- Main Student Profile Component ---
function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authData } = useContext(UserAuthContext);

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    studentId: null,
  });

  // --- Exam Results State ---
  const [examList, setExamList] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examResults, setExamResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  // --- Data Fetching ---
  useEffect(() => {
    const getStudent = async () => {
      try {
        setLoading(true);
        const { data } = await Axios.get(`/student/${id}`);
        setStudent(data);
      } catch (error) {
        console.error("Failed to fetch student data:", error.response);
        toast.error("Could not load student profile.");
        navigate(-1); // Go back if student not found
      } finally {
        setLoading(false);
      }
    };
    getStudent();
  }, [id, navigate]);

  // Fetch exam list
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await Axios.get("/exam");
        setExamList(data);
      } catch {
        setExamList([]);
      }
    };
    fetchExams();
  }, []);

  // Fetch selected exam results
  useEffect(() => {
    if (!selectedExamId || !student?.registerNo) {
      setExamResults(null);
      setResultsError("");
      return;
    }
    setResultsLoading(true);
    setExamResults(null);
    setResultsError("");

    Axios.get(`/result/${selectedExamId}/${student.registerNo}`)
      .then(({ data }) => {
        if (data && (data.results || data.cceResults)) {
          setExamResults(data);
        } else if (data && data.message === "Result Not Found") {
          setResultsError("No results found for this exam.");
        } else {
          setResultsError("Result not available.");
        }
      })
      .catch(() => setResultsError("Failed to fetch results."))
      .finally(() => setResultsLoading(false));
  }, [selectedExamId, student?.registerNo]);

  // --- Derived Data using useMemo for performance ---
  const studentAge = useMemo(() => {
    if (!student?.dob) return "N/A";
    const birthDate = new Date(student.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [student]);

  // --- Group results by subject (for Exam) ---
  const groupedResults = useMemo(() => {
    if (!examResults?.results) return [];
    const map = {};
    examResults.results.forEach((res) => {
      if (!map[res.subject.subjectName]) map[res.subject.subjectName] = [];
      map[res.subject.subjectName].push(res);
    });
    return Object.entries(map);
  }, [examResults]);

  // --- Group CCE results by subject ---
  const groupedCCEResults = useMemo(() => {
    if (!examResults?.cceResults) return [];
    const map = {};
    examResults.cceResults.forEach((res) => {
      if (!map[res.subject.subjectName]) map[res.subject.subjectName] = [];
      map[res.subject.subjectName].push(res);
    });
    return Object.entries(map);
  }, [examResults]);

  // --- Handlers for Actions ---
  const handleVerify = async () => {
    try {
      setLoading(true);
      await Axios.post(`/student/admission/verify/${modalState.studentId}`);
      toast.success("Student Verified Successfully!");
      setStudent((prev) => ({ ...prev, verified: true })); // Optimistic UI update
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error(error.response);
    } finally {
      setLoading(false);
      setModalState({ isOpen: false });
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await Axios.delete(`/student/${modalState.studentId}`);
      toast.success("Student Deleted Successfully");
      navigate("/all-classes"); // Navigate to a safe page
    } catch (error) {
      toast.error("Deletion failed. Please try again.");
      console.error(error.response);
      setLoading(false);
    } finally {
      setModalState({ isOpen: false });
    }
  };

  const handleConfirmAction = () => {
    if (modalState.type === "verify") handleVerify();
    if (modalState.type === "delete") handleDelete();
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-slate-700">Student Not Found</h2>
        <Link
          to="/all-centre-students"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          Go back to student list
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        onConfirm={handleConfirmAction}
        title={
          modalState.type === "verify"
            ? "Confirm Verification"
            : "Confirm Deletion"
        }
        message={
          modalState.type === "verify"
            ? `Are you sure you want to verify ${student.studentName}?`
            : `This action is irreversible. Are you sure you want to delete ${student.studentName}?`
        }
        confirmText={
          modalState.type === "verify" ? "Yes, Verify" : "Yes, Delete"
        }
        type={modalState.type === "verify" ? "success" : "danger"}
      />

      <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8">
        {/* --- Profile Card --- */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProfileAvatar name={student.studentName} />
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-slate-800">
                  {student.studentName}
                </h1>
                <p className="text-md text-slate-500 mt-1">
                  Reg. No: {student.registerNo}
                </p>
                {student.verified ? (
                  <span className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <FontAwesomeIcon icon={faCheckCircle} /> Verified
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Needs
                    Verification
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 md:p-8">
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-bold text-slate-700 mb-4">
                Personal Information
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoItem label="Father's Name" value={student.fatherName} />
                <InfoItem
                  label="Date of Birth"
                  value={new Date(student.dob).toLocaleDateString("en-GB")}
                />
                <InfoItem
                  label="Phone"
                  value={student.phone ? `+91 ${student.phone}` : "N/A"}
                />
                <InfoItem label="Age" value={`${studentAge} years old`} />
              </dl>
            </section>

            {/* Address Info */}
            <section className="mt-8">
              <h3 className="text-lg font-bold text-slate-700 mb-4">
                Contact & Address
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoItem label="House Name" value={student.houseName} />
                <InfoItem label="Place" value={student.place} />
                <InfoItem label="Post Office" value={student.postOffice} />
                <InfoItem label="Pincode" value={student.pinCode} />
                <InfoItem label="District" value={student.district} />
                <InfoItem label="State" value={student.state} />
              </dl>
            </section>

            {/* Academic Info */}
            <section className="mt-8">
              <h3 className="text-lg font-bold text-slate-700 mb-4">
                Academic Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoItem
                  label="Academic Year"
                  value={student.academicYear?.year}
                />
                <InfoItem label="Class" value={student.class?.className} />
                <InfoItem
                  label="Study Center"
                  value={student.branch?.studyCentreName}
                />
              </dl>
            </section>

            {/* Exam Results Selection and Table */}
            <section className="mt-8">
              <h3 className="text-lg font-bold text-slate-700 mb-4">
                Exam Results
              </h3>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-slate-600">
                  Select Exam
                </label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-400"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                >
                  <option value="" disabled>
                    Select an exam
                  </option>
                  {examList.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.examName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Results Loading/Error/Empty State */}
              {resultsLoading ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-indigo-400"></div>
                  <div className="text-slate-600">Loading results...</div>
                </div>
              ) : resultsError ? (
                <div className="text-center py-6 bg-slate-100 rounded-lg text-slate-500">
                  {resultsError}
                </div>
              ) : examResults &&
                (groupedResults.length > 0 || groupedCCEResults.length > 0) ? (
                <>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Exam & CCE Marks
                  </h4>
                  <table className="min-w-full text-sm border rounded-xl mb-8">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-2 px-3 text-left font-semibold text-slate-600">
                          Subject
                        </th>
                        <th className="py-2 px-3 text-center font-semibold text-slate-600">
                          Exam Marks
                        </th>
                        <th className="py-2 px-3 text-center font-semibold text-slate-600">
                          CCE Marks
                        </th>
                        <th className="py-2 px-3 text-center font-semibold text-slate-600">
                          Total
                        </th>
                        <th className="py-2 px-3 text-center font-semibold text-slate-600">
                          Max Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Get all unique subjects from both exam and CCE */}
                      {Array.from(
                        new Set([
                          ...groupedResults.map(([subject]) => subject),
                          ...groupedCCEResults.map(([subject]) => subject),
                        ])
                      ).map((subject) => {
                        // Exam marks for this subject
                        const examResArr =
                          groupedResults.find(([s]) => s === subject)?.[1] ||
                          [];
                        const examRes = examResArr[0];
                        const examMark =
                          examRes?.marksObtained !== undefined
                            ? examRes.marksObtained
                            : "-";
                        // CCE marks for this subject
                        const cceResArr =
                          groupedCCEResults.find(([s]) => s === subject)?.[1] ||
                          [];
                        const cceRes = cceResArr[0];
                        const cceMark =
                          cceRes?.cceMark !== undefined ? cceRes.cceMark : "-";
                        // Max marks: prefer exam, then cce, then 100
                        const maxMarks =
                          examRes?.maxMarks || cceRes?.maxMarks || 100;
                        // Total
                        let total = "-";
                        if (
                          examMark !== "-" &&
                          cceMark !== "-" &&
                          examMark !== "A" &&
                          cceMark !== "A"
                        ) {
                          total = Number(examMark) + Number(cceMark);
                        } else if (examMark === "A" || cceMark === "A") {
                          total = "A";
                        } else if (examMark !== "-" && cceMark === "-") {
                          total = examMark;
                        } else if (examMark === "-" && cceMark !== "-") {
                          total = cceMark;
                        }
                        return (
                          <tr key={subject} className="even:bg-slate-50/70">
                            <td className="py-2 px-3 font-medium text-slate-700">
                              {subject}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-800">
                              {examMark}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-indigo-700">
                              {cceMark}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-green-700">
                              {total}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-600">
                              {maxMarks}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {examResults.grandTotal !== undefined && (
                      <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                        <FontAwesomeIcon icon={faTrophy} />
                        Grand Total: {examResults.grandTotal} /{" "}
                        {examResults.totalPossibleMarks}
                      </span>
                    )}
                    {examResults.percentage !== undefined && (
                      <span className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
                        <FontAwesomeIcon icon={faPercent} />
                        Percentage: {examResults.percentage}%
                      </span>
                    )}
                  </div>
                </>
              ) : null}
            </section>
          </div>

          {/* Card Footer - Actions */}
          <div className="bg-slate-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-3">
              {!student.verified && (
                <button
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      type: "verify",
                      studentId: student._id,
                    })
                  }
                  className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                  disabled={loading}
                >
                  Verify Admission
                </button>
              )}
              {authData?.role === "superAdmin" && (
                <Link
                  to={`/transfer-student/${student._id}`}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition shadow-sm"
                >
                  <FontAwesomeIcon icon={faArrowRight} className="mr-2" />{" "}
                  Transfer
                </Link>
              )}
              {authData?.role === "superAdmin" && (
                <Link
                  to={`/edit-student/${student._id}`}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition shadow-sm"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
                </Link>
              )}
            </div>
            <button
              onClick={() =>
                setModalState({
                  isOpen: true,
                  type: "delete",
                  studentId: student._id,
                })
              }
              className="px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition disabled:opacity-50"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete Student
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentProfile;
