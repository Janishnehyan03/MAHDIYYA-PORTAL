import {
  faArrowRight,
  faBook,
  faBookOpenReader,
  faCalendar,
  faChalkboardTeacher,
  faChalkboardUser,
  faCheckDouble,
  faCheckToSlot,
  faCog,
  faDownload,
  faFileArchive,
  faGraduationCap,
  faMarker,
  faPenAlt,
  faSchool,
  faToolbox,
  faUpload,
  faUser,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../Axios";
import { UserAuthContext } from "../context/userContext";

// --- Data Definitions (No changes here) ---
const superAdminDashboardConfig = {
  "Core Management": [
    { text: "STUDY CENTERS", icon: faSchool, link: "/study-centres", description: "Manage all branches" },
    { text: "STUDENTS", icon: faUsers, link: "/all-centre-students", description: "View all students" },
    { text: "ALL TEACHERS", icon: faChalkboardTeacher, link: "/all-MAHDIYYAH-teachers", description: "Oversee all educators" },
  ],
  "Academic Operations": [
    { text: "SUBJECTS", icon: faBookOpenReader, link: "/all-subjects", description: "Define course subjects" },
    { text: "CLASSROOMS", icon: faToolbox, link: "/class-management", description: "Organize classes" },
    { text: "EXAMS", icon: faCheckToSlot, link: "/create-exam", description: "Create & manage exams" },
    { text: "EXAM TIMETABLES", icon: faCalendar, link: "/timetables", description: "Schedule exam dates" },
    { text: "RESULTS", icon: faMarker, link: "/result-section", description: "Publish final results" },
    { text: "Previous Results", icon: faCheckDouble, link: "/previous-results", description: "Access archived results" },
  ],
  "System & Utilities": [
    { text: "DOWNLOADS", icon: faDownload, link: "/downloads", description: "Manage downloadable files" },
    { text: "Configurations", icon: faCog, link: "/configurations", description: "System-wide settings" },
  ],
};

const adminDashboardConfig = {
  "Student & Staff Management": [
    { text: "STUDENTS", icon: faGraduationCap, link: "/all-classes", description: "Manage your students" },
    { text: "TEACHERS", icon: faChalkboardUser, link: "/all-teachers", description: "Manage your teachers" },
    { text: "New Admissions", icon: faBook, link: "/new-admissions", isNotification: true, description: "Onboard new students" },
  ],
  "Exam & Results": [
    { text: "Mark Entry", icon: faPenAlt, link: "/mark-entry", description: "Input student marks" },
    { text: "Hall Tickets", icon: faFileArchive, link: "/hall-tickets", description: "Generate exam passes" },
    { text: "Exam Results", icon: faCheckDouble, link: "/result-view", description: "View current results" },
    { text: "Previous Results", icon: faCheckDouble, link: "/previous-results/admin", description: "Access past results" },
  ],
  "Branch Utilities": [
    { text: "Uploads", icon: faUpload, link: "/my-uploads", description: "Your centre's uploads" },
    { text: "Profile", icon: faUser, link: "/study-centre-profile/", description: "Update centre details" },
  ],
};


// --- Reusable Component: DashboardCard with "Glassmorphism" effect ---
const DashboardCard = ({ item, notificationCount }) => (
  <Link
    to={item.link}
    // CHANGED: Added bg-white/60, backdrop-blur-sm and border-transparent for a modern look
    className="group relative flex flex-col justify-between bg-white/60 backdrop-blur-sm p-5 rounded-xl shadow-md border border-transparent hover:shadow-xl hover:border-blue-500 hover:-translate-y-1.5 transition-all duration-300"
  >
    {/* Notification Badge */}
    {notificationCount > 0 && (
      <div className="absolute top-3 right-3 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ring-2 ring-white animate-pulse">
        {notificationCount}
      </div>
    )}

    {/* Top section: Icon and Title */}
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 p-3 rounded-full bg-blue-100 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
        <FontAwesomeIcon icon={item.icon} className="h-6 w-6" />
      </div>
      <h3 className="text-md font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
        {item.text}
      </h3>
    </div>

    {/* Bottom section: Description and Action Arrow */}
    <div className="mt-4 flex items-end justify-between">
      <p className="text-xs text-slate-500 pr-4">
        {item.description || "Click to manage"}
      </p>
      <FontAwesomeIcon
        icon={faArrowRight}
        className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
      />
    </div>
  </Link>
);


// --- Skeleton Loader Component ---
const SkeletonCard = () => (
    // CHANGED: Added bg-white/60 and backdrop-blur-sm to match the card style
  <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl shadow-md border border-slate-200 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full bg-slate-200"></div>
      <div className="h-4 w-2/3 rounded bg-slate-200"></div>
    </div>
    <div className="mt-6">
      <div className="h-3 w-full rounded bg-slate-200"></div>
      <div className="h-3 w-1/2 mt-2 rounded bg-slate-200"></div>
    </div>
  </div>
);


// --- Section Component for Grouping ---
const DashboardSection = ({ title, children }) => (
    // CHANGED: Increased bottom margin from mb-12 to mb-16 for more vertical space
  <section className="mb-16"> 
    <h2 className="text-xl font-semibold text-slate-700 mb-5 pb-3 border-b border-slate-300/70">
      {title}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
      {children}
    </div>
  </section>
);


// --- Main Dashboard Component ---
function Dashboard() {
  const { authData } = useContext(UserAuthContext);
  const [branchName, setBranchName] = useState("");
  const [admissionCount, setAdmissionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (authData?.role !== "admin" || !authData.branch?._id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [branchRes, admissionsRes] = await Promise.all([
          Axios.get(`/study-centre/${authData.branch._id}`),
          Axios.post(`student?branch=${authData.branch._id}&verified=false`),
        ]);
        setBranchName(branchRes.data?.data?.studyCentreName || "");
        setAdmissionCount(admissionsRes.data.length);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        setBranchName("Your Branch");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [authData]);

  if (!authData) {
    return null;
  }

  const isSuperAdmin = authData.role === "superAdmin";
  const dashboardConfig = isSuperAdmin ? superAdminDashboardConfig : adminDashboardConfig;
  const dashboardTitle = isSuperAdmin ? "Super Admin Dashboard" : branchName;
  const dashboardSubtitle = isSuperAdmin
    ? "Oversee and manage all system-wide operations."
    : `Welcome back! Manage your branch activities from here.`;

  // --- Render Logic (This is where the main layout changes are) ---
  return (
    // CHANGED: This outer div now sets the background color for the whole page.
    <div className="w-full min-h-screen bg-slate-100">

      {/* CHANGED: This new inner div centers the content, sets a max-width, and adds responsive padding */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        
        {/* --- Header --- */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            {dashboardTitle}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{dashboardSubtitle}</p>
        </header>

        {/* --- Main Dashboard Sections --- */}
        <main>
          {isLoading ? (
            <DashboardSection title="Loading Dashboard...">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </DashboardSection>
          ) : (
            Object.entries(dashboardConfig).map(([sectionTitle, items]) => (
              <DashboardSection key={sectionTitle} title={sectionTitle}>
                {items.map((item, index) => (
                  <DashboardCard
                    key={index}
                    item={item}
                    notificationCount={item.isNotification ? admissionCount : 0}
                  />
                ))}
              </DashboardSection>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;