import { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { UserAuthContext } from "./context/userContext";

function ProtectedRoutes({ children }) {
  const { authData } = useContext(UserAuthContext);
  const navigate = useNavigate();
  if (authData) {
    return (
      <div className="lg:ml-[280px]">
        <Sidebar />
        <div>{children ? children : <Outlet />}</div>
      </div>
    );
  } else {
    navigate("/not-logged");
  }
}

export default ProtectedRoutes;
