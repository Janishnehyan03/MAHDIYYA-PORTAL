import { createContext, useState } from "react";
import Axios from "../Axios";

export const ClassContext = createContext({});

export const ClassProvider = (props) => {
  const [classes, setClasses] = useState([]);

  const getClasses = async (isActive) => {
    try {
      const res = await Axios.get(`/class`);
      if (res.status === 200) {
        setClasses(res.data);
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const value = {
    getClasses,
    classes,
  };

  return (
    <ClassContext.Provider value={value}>{props.children}</ClassContext.Provider>
  );
};
