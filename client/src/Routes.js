import { CceMark, Result, Student, StudyCentre, Teacher } from "./pages";
import AdminHome from "./pages/AdminHome";
import ViewTeacher from "./pages/ViewTeacher";
import FileUpload from "./pages/admin/FileUpload";
import MyMessages from "./pages/admin/MyMessages";
import MyUploads from "./pages/admin/MyUploads";
import AdmissionManagement from "./pages/admin/admission/AdmissionManagement";
import Admissions from "./pages/admin/admission/Admissions";
import BulkHallTickets from "./pages/admin/hall-tickets/BulkHallTickets";
import PreviousExamManagement from "./pages/admin/previous-exam/PreviousExamManagement";
import PreviousExamTable from "./pages/admin/previous-exam/PreviousExamTable";
import MarkEntry from "./pages/admin/results/MarkEntry";
import StudyCentreProfile from "./pages/admin/study-centre/StudyCentreProfile";
import AllSubjects from "./pages/superAdmin/AllSubjects";
import ClassManagment from "./pages/superAdmin/ClassManagment";
import CreateExam from "./pages/superAdmin/CreateExam";
import CreateMessage from "./pages/superAdmin/CreateMessage";
import EditSubject from "./pages/superAdmin/EditSubject";
import RecycleBin from "./pages/superAdmin/RecycleBin";
import TimeTables from "./pages/superAdmin/Timetables";
import UploadedFiles from "./pages/superAdmin/UploadedFiles";
import Configurations from "./pages/superAdmin/configurations/Configurations";
import CreateNotification from "./pages/superAdmin/notification/CreateNotification";
import SupplementaryExam from "./pages/superAdmin/SupplementaryExam";
import SupplementaryExamCentre from "./pages/admin/SupplementaryExamCentre";

export const SuperAdminRoutes = [
  {
    route: "/create-study-centre",
    component: <StudyCentre.CreateStudyCentre />,
    role: "superAdmin",
  },
  {
    route: "/study-centres",
    component: <StudyCentre.AllStudyCentres />,
    role: "superAdmin",
  },

  {
    route: "/edit-branch/:id",
    component: <StudyCentre.EditStudyCentre />,
    role: "superAdmin",
  },

  {
    route: "/all-centre-students",
    component: <StudyCentre.AllStudents />,
    role: "superAdmin",
  },
  {
    route: "/all-MAHDIYYAH-teachers",
    component: <Teacher.AllMAHDIYYAHTeachers />,
    role: "superAdmin",
  },
  {
    route: "/all-subjects",
    component: <AllSubjects />,
    role: "superAdmin",
  },
  {
    route: "/edit-subject/:id",
    component: <EditSubject />,
    role: "superAdmin",
  },

  {
    route: "/create-notification",
    component: <CreateNotification />,
    role: "superAdmin",
  },
  {
    route: "/class-management",
    component: <ClassManagment />,
    role: "superAdmin",
  },

  {
    route: "/create-exam",
    component: <CreateExam />,
    role: "superAdmin",
  },
  {
    route: "/uploaded-files/:id",
    component: <UploadedFiles />,
    role: "superAdmin",
  },

  {
    route: "/uploaded-files/:id",
    component: <UploadedFiles />,
    role: "superAdmin",
  },

  {
    route: "/create-messages",
    component: <CreateMessage />,
    role: "superAdmin",
  },
  {
    route: "/trash",
    component: <RecycleBin />,
    role: "superAdmin",
  },

  {
    route: "/result-section/",
    component: <Result.ResultHome />,
    role: "superAdmin",
  },

  {
    route: "/study-centre/:centreId",
    component: <StudyCentre.StudyCentreView />,
    role: "superAdmin",
  },
  {
    route: "/configurations",
    component: <Configurations />,
    role: "superAdmin",
  },
  {
    route: "/timetables",
    component: <TimeTables />,
    role: "superAdmin",
  },
  {
    route: "/transfer-student/:studentId",
    component: <Student.TransferStudent />,
    role: "superAdmin",
  },
  {
    route: "/admission-management",
    component: <AdmissionManagement />,
    role: "superAdmin",
  },
  {
    route: "/previous-results",
    component: <PreviousExamManagement />,
    role: "superAdmin",
  },
  {
    route: "/supplementary-exam",
    component: <SupplementaryExam />,
    role: "superAdmin",
  }
];

export const AdminRoutes = [
  {
    route: "/",
    component: <AdminHome />,
  },
  {
    route: "/all-students/:classId",
    component: <Student.ClassBasedStudents />,
  },
  {
    route: "/all-classes",
    component: <Student.AllClasses />,
  },
  {
    route: "/dropout-list",
    component: <Student.DropoutList />,
  },
  {
    route: "/all-teachers",
    component: <Teacher.AllTeachers />,
  },

  {
    route: "/new-student",
    component: <Student.AddStudent />,
  },

  {
    route: "/edit-student/:id",
    component: <Student.EditStudent />,
  },
  {
    route: "/teacher/:id",
    component: <ViewTeacher />,
  },
  {
    route: "/edit-teacher/:id",
    component: <Teacher.EditTeacher />,
  },
  {
    route: "/create-teacher",
    component: <Teacher.CreateTeacher />,
  },

  {
    route: "/new-admissions",
    component: <Admissions />,
  },

  {
    route: "/my-uploads",
    component: <MyUploads />,
  },
  {
    route: "/file-upload/:referenceId",
    component: <FileUpload />,
  },
  {
    route: "/my-messages",
    component: <MyMessages />,
  },
  {
    route: "/result-view/",
    component: <Result.ResultView />,
  },
  {
    route: "/study-centre-profile/",
    component: <StudyCentreProfile />,
  },
  {
    route: "/mark-entry/",
    component: <MarkEntry />,
  },
  {
    route: "/view-cce-mark/",
    component: <CceMark.ViewCceMarks />,
  },
  { route: "/add-cce-mark/", component: <CceMark.AddCceMark /> },
  { route: "/add-result", component: <Result.AddResult /> },
  { route: "/previous-results/admin", component: <PreviousExamTable /> },
  { route: "/hall-tickets", component: <BulkHallTickets /> },
  { route: "/centre-supplementary-exam", component: <SupplementaryExamCentre /> }
];
