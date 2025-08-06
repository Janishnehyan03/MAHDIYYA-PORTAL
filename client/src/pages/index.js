import ProtectedRoutes from "../ProtectRoutes";
import Restricted from "../Restricted";
import NewAdmission from "../components/New Admission/NewAdmission.jsx";
import Login from "./Login";
import NotAllowed from "./NotAllowed";
import NotLoggedIn from "./NotLoggedIn";
import NotFound from "./Not_found";
import AllClasses from "./admin/class/AllClasses";
import AddStudent from "./admin/student/AddStudent.jsx";
import EditStudent from "./admin/student/EditStudent.jsx";
import AllTeachers from "./admin/teacher/AllTeachers.jsx";
import CreateTeacher from "./admin/teacher/CreateTeacher.jsx";
import EditTeacher from "./admin/teacher/EditTeacher.jsx";
import Profile from "./student/StudentProfile.jsx";
import AllStudents from "./superAdmin/AllStudents.jsx";
import ClassBasedStudents from "./superAdmin/ClassBasedStudents.jsx";
import AddResult from "./superAdmin/result/AddResult";
import ResultHome from "./superAdmin/result/ResultHome";
import ResultView from "./superAdmin/result/ResultView";
import AllStudyCentres from "./superAdmin/study-centre/AllStudyCentres.jsx";
import CreateStudyCentre from "./superAdmin/study-centre/CreateStudyCentre.jsx";
import EditStudyCentre from "./superAdmin/study-centre/EditStudyCentre.jsx";
import StudyCentreTeachers from "./superAdmin/study-centre/StudyCentreTeachers.jsx";
import StudyCentreView from "./superAdmin/study-centre/StudyCentreView.jsx";
import AllMAHDIYYAHTeachers from "./superAdmin/teacher/AllMahdiyyaTeachers.jsx";

import EditCceMark from "./admin/cce-mark/EditCceMark.jsx";
import ViewCceMarks from "./admin/cce-mark/ViewCceMarks.jsx";
import TransferStudent from "./student/TransferStudent.jsx";
import AllCourses from "./superAdmin/course/AllCourses.jsx";
import CreateCourse from "./superAdmin/course/CreateCourse";
import EditCourse from "./superAdmin/course/EditCourse";
import AddCceMark from "./superAdmin/result/AddCceMark.jsx";
import DropoutList from "./student/DropoutList.jsx";

export const Teacher = {
  EditTeacher,
  AllTeachers,
  CreateTeacher,
  StudyCentreTeachers,
  AllMAHDIYYAHTeachers

};
export const Auth = {
  Login,
  ProtectedRoutes,
  Restricted,
  NotAllowed,
  NotFound,
  NotLoggedIn,
};
export const Student = {
  ClassBasedStudents,
  EditStudent,
  NewAdmission,
  Profile,
  AllClasses,
  AddStudent,
  TransferStudent,
  DropoutList
};
export const StudyCentre = {
  AllStudyCentres,
  EditStudyCentre,
  CreateStudyCentre,
  AllStudents,
  StudyCentreView,
};
export const Result = {
  AddResult,
  ResultHome,
  ResultView,
};
export const CceMark = {
  AddCceMark,
  ViewCceMarks,
  EditCceMark
};
export const Course = {
  CreateCourse,
  EditCourse,
  AllCourses
};
