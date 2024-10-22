import { createContext, useState } from "react";
import Axios from "../Axios";

export const ExamContext = createContext({});

export const ExamProvider = (props) => {
  const [exams, setExams] = useState([]);

  const getExams = async (isActive) => {
    console.log('====================================');
    console.log(isActive);
    console.log('====================================');
    try {
      const res = await Axios.get(`/exam?isActive=${isActive}`);
      if (res.status === 200) {
        console.log('====================================');
        console.log(res.data);
        console.log('====================================');
        setExams(res.data);
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const value = {
    getExams,
    exams,
  };

  return (
    <ExamContext.Provider value={value}>{props.children}</ExamContext.Provider>
  );
};
