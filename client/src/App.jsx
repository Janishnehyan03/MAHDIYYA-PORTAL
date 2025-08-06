import { useContext, useEffect, useState, lazy, Suspense } from "react";
import "react-quill/dist/quill.bubble.css";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminRoutes, SuperAdminRoutes } from "./Routes";
import { UserAuthContext } from "./context/userContext";

// Lazy-load all page components for better performance
const AdmissionCreated = lazy(() =>
  import("./components/New Admission/AdmissionCreated")
);
const About = lazy(() => import("./pages/About"));
const AllNotifications = lazy(() => import("./pages/AllNotifications"));
const CenterRegister = lazy(() => import("./pages/CenterRegister"));
const Downloads = lazy(() => import("./pages/Downloads"));
const InstitutionDuty = lazy(() => import("./pages/Duty"));
const EmailSent = lazy(() => import("./pages/EmailSent"));
const HallTicket = lazy(() => import("./pages/HallTicket"));
const NotificationView = lazy(() => import("./pages/NotificationView"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SpecialHallTicket = lazy(() => import("./pages/SpecialHallticket"));
const StudentResult = lazy(() => import("./pages/StudentResult"));
const CourseDetails = lazy(() => import("./pages/courses/CourseDetails"));

const Auth = {
  NotFound: lazy(() => import("./pages/Not_found")),
  Login: lazy(() => import("./pages/Login")),
  NotLoggedIn: lazy(() => import("./pages/NotLoggedIn")),
  NotAllowed: lazy(() => import("./pages/NotAllowed")),
  ProtectedRoutes: lazy(() => import("./ProtectRoutes")),
  Restricted: lazy(() => import("./Restricted")),
};

const Student = {
  Profile: lazy(() => import("./pages/student/StudentProfile")),
  NewAdmission: lazy(() => import("./components/New Admission/NewAdmission")),
};

function LoadingScreen() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-400"></div>
        <div className="text-lg text-slate-500">Loading...</div>
      </div>
    </div>
  );
}

export default function App() {
  const { checkUserLogin } = useContext(UserAuthContext);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Only block protected routes on login check, not the whole app
    checkUserLogin().finally(() => setAuthLoading(false));
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="flex min-h-screen">
        <div className="w-full">
          <ToastContainer position="top-center" />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="*" element={<Auth.NotFound />} />
              <Route path="/login" element={<Auth.Login />} />
              <Route path="/about-us" element={<About />} />
              <Route
                path="/hallticket/download"
                element={<SpecialHallTicket />}
              />
              <Route path="/result" element={<StudentResult />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admission-created" element={<AdmissionCreated />} />
              <Route path="/course-details/:id" element={<CourseDetails />} />
              <Route path="/institution-duty" element={<InstitutionDuty />} />
              <Route path="/email-sent/:email" element={<EmailSent />} />
              <Route path="/profile/:id" element={<Student.Profile />} />
              <Route path="/new-admission" element={<Student.NewAdmission />} />
              <Route path="/not-logged" element={<Auth.NotLoggedIn />} />
              <Route path="/not-allowed" element={<Auth.NotAllowed />} />
              <Route path="/all-notifications" element={<AllNotifications />} />
              <Route path="/notification/:id" element={<NotificationView />} />
              <Route path="/CenterRegister" element={<CenterRegister />} />
              <Route path="/hall-ticket" element={<HallTicket />} />
              <Route path="/downloads" element={<Downloads />} />

              {AdminRoutes.map((route, index) => (
                <Route
                  key={index}
                  path={route.route}
                  element={
                    <Auth.ProtectedRoutes>
                      <Suspense fallback={<LoadingScreen />}>
                        {route.component}
                      </Suspense>
                    </Auth.ProtectedRoutes>
                  }
                />
              ))}
              {SuperAdminRoutes.map((route, index) => (
                <Route
                  path={route.route}
                  key={index}
                  element={
                    <Auth.Restricted role={route.role}>
                      <Suspense fallback={<LoadingScreen />}>
                        {route.component}
                      </Suspense>
                    </Auth.Restricted>
                  }
                />
              ))}
            </Routes>
          </Suspense>
        </div>
      </div>
      {/* <Footer/> */}
    </>
  );
}
