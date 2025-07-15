import { useContext, useEffect } from "react";
import ReactGA from "react-ga";
import "react-quill/dist/quill.bubble.css";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminRoutes, SuperAdminRoutes } from "./Routes";
import AdmissionCreated from "./components/New Admission/AdmissionCreated";
import { UserAuthContext } from "./context/userContext";
import { Auth, Student } from "./pages";
import About from "./pages/About";
import AllNotifications from "./pages/AllNotifications";
import CenterRegister from "./pages/CenterRegister";
import Downloads from "./pages/Downloads";
import InstitutionDuty from "./pages/Duty";
import EmailSent from "./pages/EmailSent";
import HallTicket from "./pages/HallTicket";
import NotificationView from "./pages/NotificationView";
import Notifications from "./pages/Notifications";
import SpecialHallTicket from "./pages/SpecialHallticket";
import StudentResult from "./pages/StudentResult";
import CourseDetails from "./pages/courses/CourseDetails";

export default function App() {
  const { checkUserLogin } = useContext(UserAuthContext);

  useEffect(() => {
    checkUserLogin();
  }, []);
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <>
      <div className="flex min-h-screen ">
        <div className="w-full">
          <ToastContainer position="top-center" />
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
            {/* <Route path="/launch" element={<LaunchBtn />} /> */}
            <Route path="/downloads" element={<Downloads />} />

            {AdminRoutes.map((route, index) => (
              <Route
                key={index}
                path={route.route}
                element={
                  <Auth.ProtectedRoutes>{route.component}</Auth.ProtectedRoutes>
                }
              />
            ))}
            {SuperAdminRoutes.map((route, index) => (
              <Route
                path={route.route}
                key={index}
                element={
                  <Auth.Restricted role={route.role}>
                    {route.component}
                  </Auth.Restricted>
                }
              />
            ))}
          </Routes>
          <Routes></Routes>
        </div>
      </div>
      {/* <Footer/> */}
    </>
  );
}
