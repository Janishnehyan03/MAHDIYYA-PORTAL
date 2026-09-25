import {
  faBars,
  faGraduationCap,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserAuthContext } from "../context/userContext";

export default function Navbar({ onOpenSidebar }) {
  const { authData, logout } = useContext(UserAuthContext);

  const roleLabel =
    authData?.role === "superAdmin" ? "Super Admin" : "Branch Admin";

  const profileRoute =
    authData?.role === "admin" ? "/study-centre-profile/" : "/";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Left side: Mobile menu toggle + Logo, Desktop portal indicator */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
        </button>

        {/* Mobile Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 lg:hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 shadow-sm text-white">
            <FontAwesomeIcon icon={faGraduationCap} className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            MAHDIYYAH
          </span>
        </Link>

        {/* Desktop Portal Badge */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            {roleLabel} Portal
          </span>
        </div>
      </div>

      {/* Right side: User Profile Details & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {authData ? (
          <>
            {/* User Details Link */}
            <Link
              to={profileRoute}
              title={authData.role === "admin" ? "View Centre Profile" : "Dashboard"}
              className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-xs">
                {authData.username?.charAt(0)?.toUpperCase() || (
                  <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                  {authData.username}
                </p>
                <p className="text-[10px] font-medium capitalize text-slate-500 leading-tight mt-0.5">
                  {roleLabel}
                </p>
              </div>
            </Link>

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-slate-200" />

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-500 transition-colors"
              />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
