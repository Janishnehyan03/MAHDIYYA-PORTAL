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
  faTableList,
  faToolbox,
  faUpload,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../Axios";
import { UserAuthContext } from "../context/userContext";

// --- Data Definitions (No changes here) ---
const superAdminDashboardConfig = {
  "Core Management": [
    {
      text: "STUDY CENTERS",
      icon: faSchool,
      link: "/study-centres",
      description: "Manage all branches",
    },
    {
      text: "STUDENTS",
      icon: faUsers,
      link: "/all-centre-students",
      description: "View all students",
    },
    {
      text: "ALL TEACHERS",
      icon: faChalkboardTeacher,
      link: "/all-MAHDIYYAH-teachers",
      description: "Oversee all educators",
    },
  ],
  "Academic Operations": [
    {
      text: "SUBJECTS",
      icon: faBookOpenReader,
      link: "/all-subjects",
      description: "Define course subjects",
    },
    {
      text: "CLASSROOMS",
      icon: faToolbox,
      link: "/class-management",
      description: "Organize classes",
    },
    {
      text: "EXAMS",
      icon: faCheckToSlot,
      link: "/create-exam",
      description: "Create & manage exams",
    },
    {
      text: "EXAM TIMETABLES",
      icon: faCalendar,
      link: "/timetables",
      description: "Schedule exam dates",
    },
    {
      text: "RESULTS",
      icon: faMarker,
      link: "/result-section",
      description: "Publish final results",
    },
    {
      text: "Previous Results",
      icon: faCheckDouble,
      link: "/previous-results",
      description: "Access archived results",
    },
    {
      text: "Supplementary Exam",
      icon: faFileArchive,
      link: "/supplementary-exam",
      description: "Manage supplementary exams",
    },
  ],
  "System & Utilities": [
    {
      text: "DOWNLOADS",
      icon: faDownload,
      link: "/downloads",
      description: "Manage downloadable files",
    },
    {
      text: "SHARED FILES",
      icon: faDownload,
      link: "/manage-downloads",
      description: "Share files with admins",
    },
    {
      text: "Configurations",
      icon: faCog,
      link: "/configurations",
      description: "System-wide settings",
    },
  ],
};

const adminDashboardConfig = {
  "Student & Staff Management": [
    {
      text: "STUDENTS",
      icon: faGraduationCap,
      link: "/all-classes",
      description: "Manage your students",
    },
    {
      text: "TEACHERS",
      icon: faChalkboardUser,
      link: "/all-teachers",
      description: "Manage your teachers",
    },
    {
      text: "New Admissions",
      icon: faBook,
      link: "/new-admissions",
      isNotification: true,
      description: "Onboard new students",
    },
  ],
  "Exam & Results": [
    {
      text: "Mark Entry",
      icon: faPenAlt,
      link: "/mark-entry",
      description: "Input student marks",
    },
    {
      text: "Hall Tickets",
      icon: faFileArchive,
      link: "/hall-tickets",
      description: "Generate exam passes",
    },
    {
      text: "Exam Results",
      icon: faCheckDouble,
      link: "/result-view",
      description: "View current results",
    },
    {
      text: "Bulk Exam Results",
      icon: faTableList,
      link: "/bulk-result-view",
      description: "View aggregated results",
    },
    {
      text: "Previous Results",
      icon: faCheckDouble,
      link: "/previous-results/admin",
      description: "Access past results",
    },
    {
      text: "Supplementary Exam",
      icon: faFileArchive,
      link: "/centre-supplementary-exam",
      description: "Enter supplementary marks",
    },
  ],
  "Branch Utilities": [
    {
      text: "Uploads",
      icon: faUpload,
      link: "/my-uploads",
      description: "Your centre's uploads",
    },
    {
      text: "Downloads",
      icon: faDownload,
      link: "/shared-downloads",
      description: "Files shared with you",
    },
    {
      text: "Profile",
      icon: faUser,
      link: "/study-centre-profile/",
      description: "Update centre details",
    },
  ],
};

// --- Color themes (full class strings so Tailwind can detect them) ---
const cardThemes = [
  {
    iconGradient: "from-blue-500 to-indigo-600",
    hoverBorder: "hover:border-blue-300",
    glow: "bg-blue-400/30",
    arrowBg: "bg-blue-50 group-hover:bg-blue-600",
    arrowText: "text-blue-600 group-hover:text-white",
    bar: "from-blue-500 to-indigo-600",
  },
  {
    iconGradient: "from-emerald-500 to-teal-600",
    hoverBorder: "hover:border-emerald-300",
    glow: "bg-emerald-400/30",
    arrowBg: "bg-emerald-50 group-hover:bg-emerald-600",
    arrowText: "text-emerald-600 group-hover:text-white",
    bar: "from-emerald-500 to-teal-600",
  },
  {
    iconGradient: "from-violet-500 to-purple-600",
    hoverBorder: "hover:border-violet-300",
    glow: "bg-violet-400/30",
    arrowBg: "bg-violet-50 group-hover:bg-violet-600",
    arrowText: "text-violet-600 group-hover:text-white",
    bar: "from-violet-500 to-purple-600",
  },
  {
    iconGradient: "from-amber-500 to-orange-600",
    hoverBorder: "hover:border-amber-300",
    glow: "bg-amber-400/30",
    arrowBg: "bg-amber-50 group-hover:bg-amber-600",
    arrowText: "text-amber-600 group-hover:text-white",
    bar: "from-amber-500 to-orange-600",
  },
];

// --- Reusable Component: Modern DashboardCard ---
const DashboardCard = ({ item, notificationCount, theme }) => (
  <Link
    to={item.link}
    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${theme.hoverBorder}`}
  >
    {/* Soft glow that appears on hover */}
    <div
      className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${theme.glow}`}
    />

    {/* Notification Badge */}
    {notificationCount > 0 && (
      <div className="absolute right-3 top-3 z-10 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white ring-2 ring-white animate-pulse">
        {notificationCount}
      </div>
    )}

    {/* Top section: Icon and Title */}
    <div className="relative flex items-center gap-4">
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 ${theme.iconGradient}`}
      >
        <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold leading-tight text-slate-800">
        {item.text}
      </h3>
    </div>

    {/* Bottom section: Description and Action Arrow */}
    <div className="relative mt-5 flex items-end justify-between">
      <p className="pr-4 text-xs leading-relaxed text-slate-500">
        {item.description || "Click to manage"}
      </p>
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 ${theme.arrowBg} ${theme.arrowText}`}
      >
        <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
      </span>
    </div>
  </Link>
);

// --- Skeleton Loader Component ---
const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
      <div className="h-4 w-2/3 rounded bg-slate-200"></div>
    </div>
    <div className="mt-6">
      <div className="h-3 w-full rounded bg-slate-200"></div>
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200"></div>
    </div>
  </div>
);

// --- Section Component for Grouping ---
const DashboardSection = ({ title, theme, children }) => (
  <section className="mb-12">
    <div className="mb-6 flex items-center gap-3">
      <span
        className={`h-7 w-1.5 rounded-full bg-gradient-to-b ${theme.bar}`}
      />
      <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700">
        {title}
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  const dashboardConfig = isSuperAdmin
    ? superAdminDashboardConfig
    : adminDashboardConfig;
  const dashboardTitle = isSuperAdmin ? "Super Admin Dashboard" : branchName;
  const dashboardSubtitle = isSuperAdmin
    ? "Oversee and manage all system-wide operations."
    : `Welcome back! Manage your branch activities from here.`;

  // --- Render Logic ---
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8 md:py-12">
        {/* --- Hero Header --- */}
        <header className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl md:p-10">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-200 ring-1 ring-inset ring-white/20">
              {isSuperAdmin ? "Super Admin" : "Branch Admin"}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {dashboardTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
              {dashboardSubtitle}
            </p>
          </div>
        </header>

        {/* --- Main Dashboard Sections --- */}
        <main>
          {isLoading ? (
            <DashboardSection title="Loading Dashboard..." theme={cardThemes[0]}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </DashboardSection>
          ) : (
            Object.entries(dashboardConfig).map(([sectionTitle, items], idx) => {
              const theme = cardThemes[idx % cardThemes.length];
              return (
                <DashboardSection
                  key={sectionTitle}
                  title={sectionTitle}
                  theme={theme}
                >
                  {items.map((item, index) => (
                    <DashboardCard
                      key={index}
                      item={item}
                      theme={theme}
                      notificationCount={
                        item.isNotification ? admissionCount : 0
                      }
                    />
                  ))}
                </DashboardSection>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
