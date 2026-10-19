import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Axios from "../Axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCheck,
  faCircleExclamation,
  faCopy,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faLockOpen,
  faMagnifyingGlass,
  faRotate,
  faShieldHalved,
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { UserAuthContext } from "../context/userContext";

export default function Settings() {
  const { authData } = useContext(UserAuthContext);
  const isSuperAdmin = authData?.role === "superAdmin";

  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "centres" : "password");

  // Own password change form state (single password field)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
  });
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Study Centres credentials (Super Admin view)
  const [centres, setCentres] = useState([]);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'custom', 'default'

  // Security Modal state for Revealing a Centre's Password
  const [revealModal, setRevealModal] = useState({
    isOpen: false,
    centre: null,
    superAdminPassword: "",
    revealedPassword: null,
    loading: false,
    error: "",
    copied: false,
  });

  // Reset Centre Password Modal state (Super Admin action)
  const [resetModal, setResetModal] = useState({
    isOpen: false,
    centre: null,
    superAdminPassword: "",
    newPassword: "",
    confirmPassword: "",
    loading: false,
    error: "",
  });

  // Load study centres credentials for Super Admin
  const loadCentresCredentials = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoadingCentres(true);
    try {
      const { data } = await Axios.get("/auth/study-centres-credentials");
      setCentres(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load study centres credentials");
    } finally {
      setLoadingCentres(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadCentresCredentials();
    }
  }, [isSuperAdmin, loadCentresCredentials]);

  // Handle changing user's own password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 4) {
      toast.error("New password must be at least 4 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      await Axios.patch("/auth/password", {
        password: passwordForm.newPassword,
      });

      toast.success("Password updated successfully!");
      setPasswordForm({
        newPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Open Reveal Password Modal
  const openRevealModal = (centre) => {
    setRevealModal({
      isOpen: true,
      centre,
      superAdminPassword: "",
      revealedPassword: null,
      loading: false,
      error: "",
      copied: false,
    });
  };

  // Submit Super Admin password to reveal centre password
  const handleRevealPassword = async (e) => {
    e.preventDefault();
    if (!revealModal.superAdminPassword) {
      setRevealModal((prev) => ({ ...prev, error: "Please enter your Super Admin password" }));
      return;
    }

    setRevealModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const { data } = await Axios.post("/auth/reveal-study-centre-password", {
        centreId: revealModal.centre._id,
        superAdminPassword: revealModal.superAdminPassword,
      });

      setRevealModal((prev) => ({
        ...prev,
        revealedPassword: data.password,
        loading: false,
        error: "",
      }));
    } catch (err) {
      setRevealModal((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Incorrect Super Admin password. Access denied.",
      }));
    }
  };

  // Copy revealed password to clipboard
  const handleCopyPassword = () => {
    if (!revealModal.revealedPassword) return;
    navigator.clipboard.writeText(revealModal.revealedPassword);
    setRevealModal((prev) => ({ ...prev, copied: true }));
    setTimeout(() => {
      setRevealModal((prev) => ({ ...prev, copied: false }));
    }, 2000);
  };

  // Open Reset Centre Password Modal
  const openResetModal = (centre) => {
    setResetModal({
      isOpen: true,
      centre,
      superAdminPassword: "",
      newPassword: "",
      confirmPassword: "",
      loading: false,
      error: "",
    });
  };

  // Submit Super Admin reset for a centre's password
  const handleResetCentrePassword = async (e) => {
    e.preventDefault();

    if (!resetModal.superAdminPassword) {
      setResetModal((prev) => ({ ...prev, error: "Super Admin password is required" }));
      return;
    }
    if (!resetModal.newPassword || resetModal.newPassword.length < 4) {
      setResetModal((prev) => ({ ...prev, error: "New password must be at least 4 characters" }));
      return;
    }
    if (resetModal.newPassword !== resetModal.confirmPassword) {
      setResetModal((prev) => ({ ...prev, error: "Passwords do not match" }));
      return;
    }

    setResetModal((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      await Axios.patch(`/auth/reset-centre-password/${resetModal.centre._id}`, {
        superAdminPassword: resetModal.superAdminPassword,
        newPassword: resetModal.newPassword,
      });

      toast.success(`Password for ${resetModal.centre.studyCentreName} updated successfully`);
      setResetModal({
        isOpen: false,
        centre: null,
        superAdminPassword: "",
        newPassword: "",
        confirmPassword: "",
        loading: false,
        error: "",
      });
      loadCentresCredentials();
    } catch (err) {
      setResetModal((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Failed to update study centre password",
      }));
    }
  };

  // Filtered study centres list
  const filteredCentres = useMemo(() => {
    return centres.filter((c) => {
      const matchesSearch =
        c.studyCentreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studyCentreCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "custom") {
        return matchesSearch && c.hasCustomPassword;
      }
      if (statusFilter === "default") {
        return matchesSearch && !c.hasCustomPassword;
      }
      return matchesSearch;
    });
  }, [centres, searchTerm, statusFilter]);

  // Summary counts
  const stats = useMemo(() => {
    const total = centres.length;
    const custom = centres.filter((c) => c.hasCustomPassword).length;
    const defaultPass = total - custom;
    return { total, custom, defaultPass };
  }, [centres]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      {/* Background Decorative Blurs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* --- Header --- */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-xs font-bold text-indigo-700 shadow-xs backdrop-blur-md">
                <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
                Security &amp; Account Portal
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Settings &amp; Access Control
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isSuperAdmin
                  ? "Manage your credentials and inspect institution security access."
                  : "Update and secure your institution's portal login credentials."}
              </p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={loadCentresCredentials}
                disabled={loadingCentres}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faRotate} spin={loadingCentres} />
                Refresh List
              </button>
            )}
          </div>

          {/* Navigation Tabs for Super Admin */}
          {isSuperAdmin && (
            <div className="mt-6 flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("centres")}
                className={`relative pb-3 text-sm font-bold transition-colors ${
                  activeTab === "centres"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Study Centre Credentials
                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {centres.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("password")}
                className={`ml-8 relative pb-3 text-sm font-bold transition-colors ${
                  activeTab === "password"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                My Super Admin Password
              </button>
            </div>
          )}
        </header>

        {/* ========================================================================= */}
        {/* SUPER ADMIN: Study Centres Credentials View */}
        {/* ========================================================================= */}
        {isSuperAdmin && activeTab === "centres" && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-xs backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Centres</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FontAwesomeIcon icon={faBuilding} className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-xs backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Custom Password Set</p>
                    <p className="mt-1 text-2xl font-black text-purple-700">{stats.custom}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <FontAwesomeIcon icon={faKey} className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-xs backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Default (1986)</p>
                    <p className="mt-1 text-2xl font-black text-slate-700">{stats.defaultPass}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice Banner */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-2xs backdrop-blur-md">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-base text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900">Protected Institution Passwords</p>
                <p className="mt-0.5 leading-relaxed text-amber-800">
                  Passwords are encrypted. For security purposes, each institution's password remains masked.
                  You will be prompted to enter your Super Admin password whenever you wish to reveal or reset any centre's password.
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by centre name, code, username..."
                  className="w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="all">All ({centres.length})</option>
                  <option value="custom">Custom Password ({stats.custom})</option>
                  <option value="default">Default Password (1986) ({stats.defaultPass})</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">#</th>
                      <th className="px-5 py-3.5">Study Centre</th>
                      <th className="px-5 py-3.5">Code / Username</th>
                      <th className="px-5 py-3.5">Password Status</th>
                      <th className="px-5 py-3.5">Password</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loadingCentres ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-indigo-600" />
                          Loading study centres credentials…
                        </td>
                      </tr>
                    ) : filteredCentres.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          No study centres matched your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCentres.map((centre, idx) => (
                        <tr key={centre._id} className="transition-colors hover:bg-indigo-50/30">
                          <td className="px-5 py-4 text-xs font-semibold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-2xs">
                                {centre.studyCentreName?.charAt(0)?.toUpperCase() || "C"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-snug">{centre.studyCentreName}</p>
                                <p className="text-xs text-slate-500">{centre.district || "District not set"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                              {centre.username}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {centre.hasCustomPassword ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                                Custom Password
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Default (1986)
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400 select-none tracking-widest text-xs">
                                ••••••••
                              </span>
                              <button
                                type="button"
                                onClick={() => openRevealModal(centre)}
                                title="Click to verify Super Admin password and reveal"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300"
                              >
                                <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                                Reveal
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openResetModal(centre)}
                              title="Assign or reset password for this study centre"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
                            >
                              <FontAwesomeIcon icon={faKey} className="h-3 w-3 text-slate-400" />
                              Reset
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OWN PASSWORD CHANGE: For Both Admin & Super Admin */}
        {/* ========================================================================= */}
        {(!isSuperAdmin || activeTab === "password") && (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex items-center gap-3.5 border-b border-slate-100 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                  <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {isSuperAdmin ? "Change Super Admin Password" : "Change Institution Password"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {isSuperAdmin
                      ? "Keep your master account secure with a robust password."
                      : "Enter your current password and choose a secure new password for your study centre."}
                  </p>
                </div>
              </div>

              {!isSuperAdmin && (
                <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <FontAwesomeIcon icon={faBuilding} />
                    <span>{authData?.branch?.studyCentreName || authData?.username}</span>
                  </div>
                  <p className="mt-1 text-indigo-700">
                    Username: <span className="font-mono font-bold">{authData?.username}</span> · Note: If you haven't
                    changed your password before, your current default password is <strong>1986</strong>.
                  </p>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                {/* Single Password Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      minLength={4}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                      placeholder="Enter new password (min. 4 characters)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <FontAwesomeIcon icon={showNewPass ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                  >
                    {passwordLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Updating Password…
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        Save New Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* SECURITY MODAL: Reveal Password for a Study Centre */}
      {/* ========================================================================= */}
      {revealModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FontAwesomeIcon icon={revealModal.revealedPassword ? faLockOpen : faShieldHalved} size="lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Security Gate</p>
                  <h3 className="text-lg font-black text-slate-900">
                    {revealModal.revealedPassword ? "Institution Credentials" : "Super Admin Verification"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevealModal({ ...revealModal, isOpen: false })}
                className="rounded-xl px-2.5 py-1 text-lg text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600">
              <p className="font-bold text-slate-800">{revealModal.centre?.studyCentreName}</p>
              <p className="mt-0.5 text-slate-500">
                Code: <span className="font-mono font-semibold">{revealModal.centre?.studyCentreCode}</span> · Username:{" "}
                <span className="font-mono font-semibold">{revealModal.centre?.username}</span>
              </p>
            </div>

            {revealModal.error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <FontAwesomeIcon icon={faCircleExclamation} />
                <span>{revealModal.error}</span>
              </div>
            )}

            {!revealModal.revealedPassword ? (
              <form onSubmit={handleRevealPassword}>
                <p className="mb-3 text-xs text-slate-500">
                  Enter your <strong>Super Admin password</strong> to authorize and reveal this institution's password.
                </p>

                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Super Admin Password
                  <input
                    type="password"
                    autoFocus
                    required
                    value={revealModal.superAdminPassword}
                    onChange={(e) =>
                      setRevealModal({ ...revealModal, superAdminPassword: e.target.value, error: "" })
                    }
                    placeholder="Enter your master password"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRevealModal({ ...revealModal, isOpen: false })}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={revealModal.loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {revealModal.loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faKey} />}
                    Authorize &amp; Reveal
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Active Login Password
                  </p>
                  <p className="mt-2 select-all font-mono text-2xl font-black text-emerald-700">
                    {revealModal.revealedPassword}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-600">
                    {revealModal.centre?.hasCustomPassword ? "Custom password updated by institution" : "Default initial password"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700"
                  >
                    <FontAwesomeIcon icon={revealModal.copied ? faCheck : faCopy} />
                    {revealModal.copied ? "Copied to Clipboard!" : "Copy Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevealModal({ ...revealModal, isOpen: false })}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET MODAL: Super Admin Setting New Password for a Centre */}
      {/* ========================================================================= */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FontAwesomeIcon icon={faKey} size="lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Admin Action</p>
                  <h3 className="text-lg font-black text-slate-900">Reset Centre Password</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModal({ ...resetModal, isOpen: false })}
                className="rounded-xl px-2.5 py-1 text-lg text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600">
              <p className="font-bold text-slate-800">{resetModal.centre?.studyCentreName}</p>
              <p className="mt-0.5 text-slate-500">
                Code: <span className="font-mono font-semibold">{resetModal.centre?.studyCentreCode}</span>
              </p>
            </div>

            {resetModal.error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <FontAwesomeIcon icon={faCircleExclamation} />
                <span>{resetModal.error}</span>
              </div>
            )}

            <form onSubmit={handleResetCentrePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Password for Centre <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={resetModal.newPassword}
                  onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value, error: "" })}
                  placeholder="Enter new password (min. 4 chars)"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={resetModal.confirmPassword}
                  onChange={(e) => setResetModal({ ...resetModal, confirmPassword: e.target.value, error: "" })}
                  placeholder="Re-enter new password"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Super Admin Password <span className="text-rose-500">*</span>
                  <input
                    type="password"
                    required
                    value={resetModal.superAdminPassword}
                    onChange={(e) => setResetModal({ ...resetModal, superAdminPassword: e.target.value, error: "" })}
                    placeholder="Verify your Super Admin password"
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetModal({ ...resetModal, isOpen: false })}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetModal.loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/25 transition hover:bg-purple-700 disabled:opacity-60"
                >
                  {resetModal.loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />}
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
