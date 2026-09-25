import {
  faBell,
  faBook,
  faBookOpenReader,
  faCalendar,
  faChalkboardTeacher,
  faChalkboardUser,
  faCheckDouble,
  faCheckToSlot,
  faCog,
  faDownload,
  faEnvelope,
  faFileArchive,
  faMoneyBillWave,
  faGaugeHigh,
  faGraduationCap,
  faMarker,
  faPenAlt,
  faSchool,
  faTableList,
  faToolbox,
  faTrash,
  faUpload,
  faUser,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserAuthContext } from "./../context/userContext";
import Navbar from "./Navbar";

// --- Brand Logo ---
const Logo = () => (
  <Link to="/" className="flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 shadow-md shadow-indigo-600/25">
      <FontAwesomeIcon icon={faGraduationCap} className="h-4.5 w-4.5 text-white" />
    </span>
    <div className="leading-tight">
      <h1 className="text-sm font-bold tracking-tight text-slate-900">
        MAHDIYYAH
      </h1>
      <p className="text-[10px] font-semibold text-indigo-600 tracking-wide uppercase">
        Portal Management
      </p>
    </div>
  </Link>
);

// --- Single Nav Link Item ---
const NavItem = ({ nav, onClick }) => (
  <NavLink
    to={nav.route}
    onClick={onClick}
    end={nav.route === "/"}
    className={({ isActive }) =>
      `group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-150 ${
        isActive
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}
        >
          <FontAwesomeIcon icon={nav.icon} className="h-3.5 w-3.5" />
        </span>
        <span className="truncate flex-1 tracking-tight">{nav.name}</span>
        {nav.badge && (
          <span
            className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
              isActive
                ? "bg-white/25 text-white"
                : "bg-indigo-50 text-indigo-600 border border-indigo-200"
            }`}
          >
            {nav.badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

function Sidebar() {
  const { authData } = useContext(UserAuthContext);
  const [openSidebar, setOpenSidebar] = useState(false);

  // Super Admin Navigation Items (Flat list without categorization)
  const superAdminNavItems = [
    { name: "Dashboard", route: "/", icon: faGaugeHigh },
    { name: "Study Centers", route: "/study-centres", icon: faSchool },
    { name: "Students", route: "/all-centre-students", icon: faUsers },
    { name: "Teachers", route: "/all-MAHDIYYAH-teachers", icon: faChalkboardTeacher },
    { name: "Subjects", route: "/all-subjects", icon: faBookOpenReader },
    { name: "Classrooms", route: "/class-management", icon: faToolbox },
    { name: "Exams", route: "/create-exam", icon: faCheckToSlot },
    { name: "Exam Timetables", route: "/timetables", icon: faCalendar },
    { name: "Results", route: "/result-section", icon: faMarker },
    { name: "Previous Results", route: "/previous-results", icon: faCheckDouble },
    { name: "Supplementary Exam", route: "/supplementary-exam", icon: faFileArchive },
    { name: "Downloads", route: "/downloads", icon: faDownload },
    { name: "Shared Files", route: "/manage-downloads", icon: faDownload },
    { name: "Fee Collection", route: "/fee-collection", icon: faMoneyBillWave },
    { name: "Notifications", route: "/create-notification", icon: faBell },
    { name: "Messages", route: "/create-messages", icon: faEnvelope },
    { name: "Configurations", route: "/configurations", icon: faCog },
    { name: "Recycle Bin", route: "/trash", icon: faTrash },
  ];

  // Study Centre Admin Navigation Items (Flat list without categorization)
  const adminNavItems = [
    { name: "Dashboard", route: "/", icon: faGaugeHigh },
    { name: "Students", route: "/all-classes", icon: faGraduationCap },
    { name: "Teachers", route: "/all-teachers", icon: faChalkboardUser },
    { name: "New Admissions", route: "/new-admissions", icon: faBook },
    { name: "Mark Entry", route: "/mark-entry", icon: faPenAlt },
    { name: "Hall Tickets", route: "/hall-tickets", icon: faFileArchive },
    { name: "Supplementary Hall Tickets", route: "/supplementary-hall-tickets", icon: faFileArchive },
    { name: "Exam Results", route: "/result-view", icon: faCheckDouble },
    { name: "Bulk Exam Results", route: "/bulk-result-view", icon: faTableList },
    { name: "Previous Results", route: "/previous-results/admin", icon: faCheckDouble },
    { name: "Supplementary Exam", route: "/centre-supplementary-exam", icon: faFileArchive },
    { name: "My Uploads", route: "/my-uploads", icon: faUpload },
    { name: "Shared Downloads", route: "/shared-downloads", icon: faDownload },
    { name: "My Messages", route: "/my-messages", icon: faEnvelope },
    { name: "Centre Profile", route: "/study-centre-profile/", icon: faUser },
  ];

  const navItems =
    authData?.role === "superAdmin"
      ? superAdminNavItems
      : authData?.role === "admin"
      ? adminNavItems
      : [];

  const handleLinkClick = () => {
    if (openSidebar) setOpenSidebar(false);
  };

  return (
    <>
      {/* --- Top Navbar (with User Details & Logout) --- */}
      <Navbar onOpenSidebar={() => setOpenSidebar(true)} />

      {/* --- Mobile Overlay Backdrop --- */}
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* --- Main Sidebar Drawer --- */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 transform flex-col bg-white border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          openSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-3.5">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between pb-3 border-b border-slate-100">
            <Logo />
            <button
              onClick={() => setOpenSidebar(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>

          {/* Flat Navigation List */}
          <nav className="flex-grow overflow-y-auto pr-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            {navItems.map((nav, nIdx) => (
              <NavItem key={nIdx} nav={nav} onClick={handleLinkClick} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
