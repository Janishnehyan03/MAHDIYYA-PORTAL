import {
  faArrowRightFromBracket, // A more intuitive icon for logout
  faBars,
  faBell,
  faBookOpen,
  faBookOpenReader,
  faBuildingCircleArrowRight,
  faClose,
  faHome,
  faMarker,
  faMessage,
  faPersonChalkboard,
  faRecycle,
  faUser,
  faUserCheck
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserAuthContext } from "./../context/userContext"; // Assuming path is correct

// --- Helper Components for a Cleaner Structure ---

// A dedicated Logo component for reusability
const Logo = () => (
  <Link to="/" className="flex items-center gap-2 px-4">
 
    <h1 className="text-2xl font-bold text-slate-800">Mahdiyya Portal</h1>
  </Link>
);

// A dedicated NavItem component for cleaner mapping and styling
const NavItem = ({ nav, onClick }) => (
  <NavLink
    to={nav.route}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ease-in-out ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 hover:translate-x-1"
      }`
    }
  >
    <FontAwesomeIcon icon={nav.icon} className="w-5 h-5" />
    <span className="font-medium">{nav.name}</span>
  </NavLink>
);

// A dedicated User Profile component for the bottom section
const UserProfile = ({ authData, onLogout }) => (
  <div className="mt-auto pt-4 border-t border-slate-200">
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-200">
      <Link to="/profile" className="flex items-center gap-3">
        {/* Placeholder for a user avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
          <FontAwesomeIcon icon={faUser} className="text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800">
            {authData.username}
          </p>
          <p className="text-xs text-slate-500 capitalize">{authData.role}</p>
        </div>
      </Link>
      <button
        onClick={onLogout}
        title="Logout"
        className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </button>
    </div>
  </div>
);


function Sidebar() {
  const { authData, logout } = useContext(UserAuthContext);
  const [openSidebar, setOpenSidebar] = useState(false);

  // --- Navigation Data (Unchanged) ---
  const adminNavigations = [
    { name: "Dashboard", route: "/", icon: faHome },
    { name: "Teachers", route: "/all-teachers", icon: faPersonChalkboard },
    { name: "Mark Entry", route: "/mark-entry", icon: faBookOpen },
    { name: "My Messages", route: "/my-messages", icon: faMessage },
  ];

  const superAdminNavigations = [
    { name: "Dashboard", route: "/", icon: faHome },
    { name: "Study Centers", route: "/study-centres", icon: faBuildingCircleArrowRight },
    { name: "Students", route: "/all-centre-students", icon: faBookOpenReader },
    { name: "Teachers", route: "/all-mahdiyya-teachers", icon: faUserCheck },
    { name: "Notifications", route: "/create-notification", icon: faBell },
    { name: "Messages", route: "/create-messages", icon: faMessage },
    { name: "Results", route: "/result-section", icon: faMarker },
  ];

  const navigations = authData?.role === "admin" ? adminNavigations :
                      authData?.role === "superAdmin" ? superAdminNavigations : [];

  const handleLinkClick = () => {
    // Close sidebar on mobile link click
    if (openSidebar) {
      setOpenSidebar(false);
    }
  };

  return (
    <>
      {/* --- Mobile Header --- */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
        <Logo />
        <button
          onClick={() => setOpenSidebar(true)}
          className="text-slate-600"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
        </button>
      </div>

      {/* --- Sidebar Overlay for Mobile --- */}
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* --- Main Sidebar --- */}
      {/* Use <aside> for semantic meaning. Notice the softer bg-slate-50 */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-50 border-r border-slate-200 z-50
                   w-72 transform transition-transform duration-300 ease-in-out
                   lg:translate-x-0 ${
                     openSidebar ? "translate-x-0" : "-translate-x-full"
                   } flex flex-col`}
      >
        <div className="flex flex-col h-full p-5">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <button
              onClick={() => setOpenSidebar(false)}
              className="lg:hidden text-slate-500 hover:text-slate-800"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faClose} className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links - much cleaner now! */}
          <nav className="flex-grow flex flex-col gap-y-2">
            {navigations.map((nav, index) => (
              <NavItem key={index} nav={nav} onClick={handleLinkClick} />
            ))}
          </nav>

          {/* User/Auth Section at the bottom */}
          {authData ? (
            <UserProfile authData={authData} onLogout={logout} />
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center p-3 mt-auto rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
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