import {
  faBookReader,
  faBuilding,
  faChalkboardTeacher,
  faEdit,
  faEnvelope,
  faMapLocationDot,
  faMapPin,
  faPhone,
  faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "../../../Axios";
import Loading from "../../../components/Loading"; // Assuming you have a standard Loading component

// --- Reusable Component: StatCard ---
const StatCard = ({ title, value, icon, color }) => (
  <div
    className={`p-5 rounded-xl bg-white shadow-sm flex items-center gap-5 border-l-4 border-${color}-500`}
  >
    <div className={`p-4 rounded-full bg-${color}-100`}>
      <FontAwesomeIcon icon={icon} className={`h-6 w-6 text-${color}-600`} />
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800">{value ?? 0}</p>
      <p className="text-sm font-medium text-slate-500">{title}</p>
    </div>
  </div>
);

// --- Reusable Component: DetailItem ---
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 py-3">
    <FontAwesomeIcon icon={icon} className="h-5 w-5 text-slate-400 mt-1" />
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-base text-slate-700 font-semibold">
        {value || (
          <span className="text-slate-400 font-normal">Not Provided</span>
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
        console.error(
          "Failed to fetch study centre details:",
          err.response || err
        );
        setError(
          "Could not load study centre details. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };
    getStudyCentre();
  }, [centreId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
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
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 tracking-tight">
            {studyCentre.studyCentreName}
          </h1>
          <p className="mt-1 text-md text-slate-500">
            Affiliated Year: {studyCentre.affiliatedYear}
          </p>
        </header>

        {/* --- Stats Section --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Centre Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                  Contact Information
                </h3>
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

              <div>
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                  Location Details
                </h3>
                <DetailItem
                  icon={faBuilding}
                  label="Place"
                  value={studyCentre.place}
                />
                <DetailItem
                  icon={faMapPin}
                  label="District & State"
                  value={`${studyCentre.district}, ${studyCentre.state}`}
                />
                <DetailItem
                  icon={faMapLocationDot}
                  label="Post Office & Pin"
                  value={`${studyCentre.postOffice} - ${studyCentre.pinCode}`}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image and Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Centre Photo
              </h3>
              {studyCentre.imageCover ? (
                <img
                  src={studyCentre.imageCover}
                  alt={`${studyCentre.studyCentreName} cover`}
                  className="w-full h-48 object-cover rounded-lg bg-slate-100"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                  No Image Available
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Actions
              </h3>
              <Link
                to={`/edit-branch/${centreId}`}
                className="w-full text-center bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit Centre
              </Link>
              {studyCentre.googleMapUrl && (
                <a
                  href={studyCentre.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faMapLocationDot} />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudyCentreView;
