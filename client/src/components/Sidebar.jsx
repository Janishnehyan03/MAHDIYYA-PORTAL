import {
  faBars,
  faBell,
  faBook,
  faBookOpenReader,
  faCalendar,
  faChalkboardTeacher,
  faChalkboardUser,
  faCheckDouble,
  faCheckToSlot,
  faChevronDown,
  faChevronRight,
  faCog,
  faDownload,
  faEnvelope,
  faFileArchive,
  faGaugeHigh,
  faGraduationCap,
  faMarker,
  faPenAlt,
  faRightFromBracket,
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
import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { UserAuthContext } from "./../context/userContext";

// --- Brand Logo ---
const Logo = () => (
  <Link to="/" className="flex items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 shadow-md shadow-indigo-600/25">
      <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-white" />
    </span>
    <div className="leading-tight">
      <h1 className="text-base font-bold tracking-tight text-slate-900">
        MAHDIYYAH
      </h1>
      <p className="text-[11px] font-semibold text-indigo-600 tracking-wide uppercase">
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
      `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
          : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}
        >
          <FontAwesomeIcon icon={nav.icon} className="h-4 w-4" />
        </span>
        <span className="truncate flex-1 tracking-tight">{nav.name}</span>
        {nav.badge && (
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
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

// --- Bottom User Profile Card ---
const UserProfile = ({ authData, onLogout }) => (
  <div className="mt-auto border-t border-slate-200 pt-3">
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 shadow-xs">
      <Link
        to={authData.role === "admin" ? "/study-centre-profile/" : "/"}
        className="flex min-w-0 flex-1 items-center gap-3 group"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
          {authData.username?.charAt(0)?.toUpperCase() || (
            <FontAwesomeIcon icon={faUser} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
            {authData.username}
          </p>
          <p className="truncate text-[11px] font-medium capitalize text-slate-500 leading-tight mt-0.5">
            {authData.role === "superAdmin" ? "Super Admin" : "Branch Admin"}
          </p>
        </div>
      </Link>
      <button
        onClick={onLogout}
        title="Logout"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

function Sidebar() {
  const { authData, logout } = useContext(UserAuthContext);
  const [openSidebar, setOpenSidebar] = useState(false);
  const location = useLocation();

  // --- Collapsible Section States ---
  const [openSections, setOpenSections] = useState({});

  // Super Admin Navigation Categorization
  const superAdminSections = [
    {
      title: "Main",
      defaultOpen: true,
      items: [{ name: "Dashboard", route: "/", icon: faGaugeHigh }],
    },
    {
      title: "Core Management",
      defaultOpen: true,
      items: [
        { name: "Study Centers", route: "/study-centres", icon: faSchool },
        { name: "Students", route: "/all-centre-students", icon: faUsers },
        { name: "Teachers", route: "/all-MAHDIYYAH-teachers", icon: faChalkboardTeacher },
      ],
    },
    {
      title: "Academic Operations",
      defaultOpen: true,
      items: [
        { name: "Subjects", route: "/all-subjects", icon: faBookOpenReader },
        { name: "Classrooms", route: "/class-management", icon: faToolbox },
        { name: "Exams", route: "/create-exam", icon: faCheckToSlot },
        { name: "Exam Timetables", route: "/timetables", icon: faCalendar },
        { name: "Results", route: "/result-section", icon: faMarker },
        { name: "Previous Results", route: "/previous-results", icon: faCheckDouble },
        { name: "Supplementary Exam", route: "/supplementary-exam", icon: faFileArchive, badge: "New" },
      ],
    },
    {
      title: "System & Utilities",
      defaultOpen: false,
      items: [
        { name: "Downloads", route: "/downloads", icon: faDownload },
        { name: "Shared Files", route: "/manage-downloads", icon: faDownload },
        { name: "Notifications", route: "/create-notification", icon: faBell },
        { name: "Messages", route: "/create-messages", icon: faEnvelope },
        { name: "Configurations", route: "/configurations", icon: faCog },
        { name: "Recycle Bin", route: "/trash", icon: faTrash },
      ],
    },
  ];

  // Study Centre Admin Navigation Categorization
  const adminSections = [
    {
      title: "Main",
      defaultOpen: true,
      items: [{ name: "Dashboard", route: "/", icon: faGaugeHigh }],
    },
    {
      title: "Student & Staff",
      defaultOpen: true,
      items: [
        { name: "Students", route: "/all-classes", icon: faGraduationCap },
        { name: "Teachers", route: "/all-teachers", icon: faChalkboardUser },
        { name: "New Admissions", route: "/new-admissions", icon: faBook },
      ],
    },
    {
      title: "Exam & Results",
      defaultOpen: true,
      items: [
        { name: "Mark Entry", route: "/mark-entry", icon: faPenAlt },
        { name: "Hall Tickets", route: "/hall-tickets", icon: faFileArchive },
        { name: "Supplementary Hall Tickets", route: "/supplementary-hall-tickets", icon: faFileArchive, badge: "New" },
        { name: "Exam Results", route: "/result-view", icon: faCheckDouble },
        { name: "Bulk Exam Results", route: "/bulk-result-view", icon: faTableList },
        { name: "Previous Results", route: "/previous-results/admin", icon: faCheckDouble },
        { name: "Supplementary Exam", route: "/centre-supplementary-exam", icon: faFileArchive },
      ],
    },
    {
      title: "Utilities",
      defaultOpen: false,
      items: [
        { name: "My Uploads", route: "/my-uploads", icon: faUpload },
        { name: "Shared Downloads", route: "/shared-downloads", icon: faDownload },
        { name: "My Messages", route: "/my-messages", icon: faEnvelope },
        { name: "Centre Profile", route: "/study-centre-profile/", icon: faUser },
      ],
    },
  ];

  const sections =
    authData?.role === "superAdmin"
      ? superAdminSections
      : authData?.role === "admin"
      ? adminSections
      : [];

  // Auto expand category containing current active URL path
  useEffect(() => {
    const updatedState = { ...openSections };
    sections.forEach((section) => {
      const containsActive = section.items.some((item) =>
        item.route === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.route)
      );
      if (containsActive) {
        updatedState[section.title] = true;
      } else if (updatedState[section.title] === undefined) {
        updatedState[section.title] = section.defaultOpen;
      }
    });
    setOpenSections(updatedState);
  }, [location.pathname]);

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLinkClick = () => {
    if (openSidebar) setOpenSidebar(false);
  };

  return (
    <>
      {/* --- Mobile Top Bar --- */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden shadow-xs">
        <Logo />
        <button
          onClick={() => setOpenSidebar(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
        </button>
      </div>

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
        <div className="flex h-full flex-col p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
            <Logo />
            <button
              onClick={() => setOpenSidebar(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Accordion Sections */}
          <div className="flex-grow overflow-y-auto pr-1 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            {sections.map((section, sIdx) => {
              const isExpanded = openSections[section.title] !== false;
              return (
                <div key={sIdx} className="space-y-1">
                  {/* Category Header with Toggle Chevron */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    className="group flex w-full items-center justify-between px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{section.title}</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {section.items.length}
                      </span>
                    </span>
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronDown : faChevronRight}
                      className="h-2.5 w-2.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-150"
                    />
                  </button>

                  {/* Category Nav Links */}
                  {isExpanded && (
                    <nav className="space-y-1 pt-0.5">
                      {section.items.map((nav, nIdx) => (
                        <NavItem key={nIdx} nav={nav} onClick={handleLinkClick} />
                      ))}
                    </nav>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Profile Footer */}
          {authData ? (
            <UserProfile authData={authData} onLogout={logout} />
          ) : (
            <Link
              to="/login"
              className="mt-auto flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 p-2.5 text-sm font-semibold text-white shadow-md transition"
            >
              <span>Login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
