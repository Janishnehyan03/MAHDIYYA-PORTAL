import {
  faArrowLeft,
  faBookReader,
  faBuilding,
  faChalkboardTeacher,
  faEdit,
  faEnvelope,
  faMapLocationDot,
  faMapPin,
  faPhone,
  faTrashCan,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Axios from "../../../Axios";
import Loading from "../../../components/Loading";

// Full class strings per theme (Tailwind can't see dynamically built names).
const STAT_THEMES = {
  indigo: {
    gradient: "from-indigo-500 to-indigo-600",
    tint: "bg-indigo-50 text-indigo-600",
  },
  sky: {
    gradient: "from-sky-500 to-cyan-600",
    tint: "bg-sky-50 text-sky-600",
  },
};

// --- Reusable Component: StatCard ---
const StatCard = ({ title, value, icon, color = "indigo" }) => {
  const theme = STAT_THEMES[color] || STAT_THEMES.indigo;
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${theme.gradient}`}
      >
        <FontAwesomeIcon icon={icon} className="h-6 w-6" />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value ?? 0}</p>
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>
    </div>
  );
};

// --- Reusable Component: DetailItem ---
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <FontAwesomeIcon icon={icon} className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold text-slate-700">
        {value || (
          <span className="font-normal text-slate-400">Not Provided</span>
        )}
      </p>
    </div>
  </div>
);

// --- Main View Component ---
function StudyCentreView() {
  const { centreId } = useParams();
  const [studyCentre, setStudyCentre] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigate();

  const deleteStudyCentre = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this study centre?")) {
      try {
        await Axios.delete(`/study-centre/${centreId}`);
        navigation("/study-centres");
      } catch (err) {
        console.error("Failed to delete study centre:", err.response || err);
        setError("Could not delete study centre. Please try again later.");
      }
    }
  };

  useEffect(() => {
    const getStudyCentre = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await Axios.get(`/study-centre/${centreId}`);
        setStudyCentre(data.data);
        setStudentCount(data.students);
        setTeacherCount(data.teachers);
      } catch (err) {
        console.error("Failed to fetch study centre details:", err.response || err);
        setError("Could not load study centre details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getStudyCentre();
  }, [centreId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-600">
        {error}
      </div>
    );
  }

  if (!studyCentre) {
    return (
      <div className="p-8 text-center text-slate-600">
        Study centre not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <Link
          to="/study-centres"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Study Centres
        </Link>

        {/* --- Hero Header --- */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white ring-1 ring-inset ring-white/20">
                {studyCentre.studyCentreName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    {studyCentre.studyCentreName}
                  </h1>
                  {studyCentre.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-300 ring-1 ring-inset ring-rose-400/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                  {studyCentre.studyCentreCode && (
                    <span className="font-mono">
                      Code: {studyCentre.studyCentreCode}
                    </span>
                  )}
                  {studyCentre.affiliatedYear && (
                    <span>Affiliated: {studyCentre.affiliatedYear}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* --- Stats Section --- */}
        <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            title="Students"
            value={studentCount}
            icon={faBookReader}
            color="indigo"
          />
          <StatCard
            title="Teachers"
            value={teacherCount}
            icon={faChalkboardTeacher}
            color="sky"
          />
        </section>

        {/* --- Main Content Grid --- */}
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <h2 className="mb-6 text-xl font-bold text-slate-800">
              Centre Details
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Contact Information
                </h3>
                <div className="divide-y divide-slate-100">
                  <DetailItem
                    icon={faUserTie}
                    label="Principal"
                    value={studyCentre.currentPrincipal}
                  />
                  <DetailItem
                    icon={faPhone}
                    label="Phone"
                    value={studyCentre.phone}
                  />
                  <DetailItem
                    icon={faEnvelope}
                    label="Email"
                    value={studyCentre.email}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Location Details
                </h3>
                <div className="divide-y divide-slate-100">
                  <DetailItem
                    icon={faBuilding}
                    label="Place"
                    value={studyCentre.place}
                  />
                  <DetailItem
                    icon={faMapPin}
                    label="District & State"
                    value={`${studyCentre.district || ""}${
                      studyCentre.state ? `, ${studyCentre.state}` : ""
                    }`.replace(/^,\s*/, "")}
                  />
                  <DetailItem
                    icon={faMapLocationDot}
                    label="Post Office & Pin"
                    value={`${studyCentre.postOffice || ""}${
                      studyCentre.pinCode ? ` - ${studyCentre.pinCode}` : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Image and Actions */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Centre Photo
              </h3>
              {studyCentre.imageCover ? (
                <img
                  src={studyCentre.imageCover}
                  alt={`${studyCentre.studyCentreName} cover`}
                  className="h-48 w-full rounded-xl bg-slate-100 object-cover"
                />
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <FontAwesomeIcon icon={faBuilding} className="mb-2 text-2xl" />
                  <span className="text-sm">No Image Available</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
                Actions
              </h3>
              <Link
                to={`/edit-branch/${centreId}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700"
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit Centre
              </Link>
              {studyCentre.googleMapUrl && (
                <a
                  href={studyCentre.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  <FontAwesomeIcon icon={faMapLocationDot} />
                  View on Google Maps
                </a>
              )}
              <button
                onClick={deleteStudyCentre}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Delete Centre
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudyCentreView;
