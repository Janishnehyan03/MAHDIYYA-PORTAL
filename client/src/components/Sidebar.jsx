import {
  faAward,
  faBars,
  faBell,
  faChalkboardUser,
  faEnvelope,
  faGaugeHigh,
  faGraduationCap,
  faPenToSquare,
  faRightFromBracket,
  faSchool,
  faUser,
  faUserGraduate,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserAuthContext } from "./../context/userContext";

// --- Brand logo: gradient mark + wordmark ---
const Logo = ({ dark = true }) => (
  <Link to="/" className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-900/30">
      <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-white" />
    </span>
    <div className="leading-tight">
      <h1
        className={`text-base font-bold tracking-tight ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        MAHDIYYAH
      </h1>
      <p className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
        Portal
      </p>
    </div>
  </Link>
);

// --- Single navigation item with gradient active state ---
const NavItem = ({ nav, onClick }) => (
  <NavLink
    to={nav.route}
    onClick={onClick}
    end={nav.route === "/"}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900/40"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-white/5 text-slate-400 group-hover:text-white"
          }`}
        >
          <FontAwesomeIcon icon={nav.icon} className="h-4 w-4" />
        </span>
        <span>{nav.name}</span>
      </>
    )}
  </NavLink>
);

// --- Bottom user card ---
const UserProfile = ({ authData, onLogout }) => (
  <div className="mt-auto pt-4">
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
      <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
          {authData.username?.charAt(0)?.toUpperCase() || (
            <FontAwesomeIcon icon={faUser} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {authData.username}
          </p>
          <p className="truncate text-xs capitalize text-slate-400">
            {authData.role}
          </p>
        </div>
      </Link>
      <button
        onClick={onLogout}
        title="Logout"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
      </button>
    </div>
  </div>
);

function Sidebar() {
  const { authData, logout } = useContext(UserAuthContext);
  const [openSidebar, setOpenSidebar] = useState(false);

  // --- Navigation Data ---
  const adminNavigations = [
    { name: "Dashboard", route: "/", icon: faGaugeHigh },
    { name: "Teachers", route: "/all-teachers", icon: faChalkboardUser },
    { name: "Mark Entry", route: "/mark-entry", icon: faPenToSquare },
    { name: "My Messages", route: "/my-messages", icon: faEnvelope },
  ];

  const superAdminNavigations = [
    { name: "Dashboard", route: "/", icon: faGaugeHigh },
    { name: "Study Centers", route: "/study-centres", icon: faSchool },
    { name: "Students", route: "/all-centre-students", icon: faUserGraduate },
    { name: "Teachers", route: "/all-MAHDIYYAH-teachers", icon: faChalkboardUser },
    { name: "Notifications", route: "/create-notification", icon: faBell },
    { name: "Messages", route: "/create-messages", icon: faEnvelope },
    { name: "Results", route: "/result-section", icon: faAward },
  ];

  const navigations =
    authData?.role === "admin"
      ? adminNavigations
      : authData?.role === "superAdmin"
      ? superAdminNavigations
      : [];

  const handleLinkClick = () => {
    if (openSidebar) setOpenSidebar(false);
  };

  return (
    <>
      {/* --- Mobile Header --- */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Logo dark={false} />
        <button
          onClick={() => setOpenSidebar(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
        </button>
      </div>

      {/* --- Mobile Overlay --- */}
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* --- Main Sidebar --- */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 transform flex-col bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          openSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-5">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpenSidebar(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>

          {/* Section label */}
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Menu
          </p>

          {/* Navigation */}
          <nav className="flex flex-grow flex-col gap-1.5">
            {navigations.map((nav, index) => (
              <NavItem key={index} nav={nav} onClick={handleLinkClick} />
            ))}
          </nav>

          {/* Auth section */}
          {authData ? (
            <UserProfile authData={authData} onLogout={logout} />
          ) : (
            <Link
              to="/login"
              className="mt-auto flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-3 font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-600 hover:to-purple-700"
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
