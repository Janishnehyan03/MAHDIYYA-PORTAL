import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Axios from "../Axios";

export const UserAuthContext = createContext({});

export const UserAuthProvider = (props) => {
  const [authData, setAuthData] = useState(null);
  const { pathname } = useLocation();

  const checkUserLogin = useCallback(async () => {
    try {
      const res = await Axios.post("/auth/checkLogin");
      if (res.status === 200) {
        setAuthData(res.data.user);
      }
    } catch (error) {
      console.log(error.response?.data);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const res = await Axios.post("/auth/logout");
      if (res.data.success) {
        setAuthData(null);
        window.location.href = "/login";
      }
    } catch (error) {
      console.log(error.response);
    }
  }, []);

  const value = useMemo(() => ({
    checkUserLogin,
    authData,
    setAuthData,
    logout,
  }), [checkUserLogin, authData, logout]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <UserAuthContext.Provider value={value}>
      {props.children}
    </UserAuthContext.Provider>
  );
};
