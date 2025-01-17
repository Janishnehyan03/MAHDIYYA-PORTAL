import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserAuthContext } from "../../../context/userContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faSchoolCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Axios from "../../../Axios";
import { useEffect } from "react";

function AllClasses() {
  const { authData } = useContext(UserAuthContext);

  const [classes, setCLasses] = useState([]);
  const getAllClasses = async () => {
    try {
      let { data } = await Axios.get("/class");
      setCLasses(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllClasses();
  }, []);

  return (
    <>
    <h1 className="text-teal-300 font-bold text-3xl mt-4 text-center">
      {authData?.branch.studyCentreName}
    </h1>
    <h1 className="my-3 text-center text-teal-200 p-3 font-semibold">
      All Students
    </h1>
    <Link to={`/new-student`}>
      <button className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold ml-4 rounded-md shadow-lg">
        New Student
      </button>
    </Link>
    <div className="w-full items-center px-4 py-8 m-auto mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {classes.map((item, key) => (
        <Link
          to={`/all-students/${item._id}`}
          key={key}
          className="w-full p-2 group"
        >
          <div className="py-4 overflow-hidden bg-gray-800 rounded-xl duration-300 shadow-lg transform hover:scale-105 hover:bg-gray-700">
            <div className="flex justify-center">
              <div className="px-4 py-4 bg-teal-700 rounded-xl bg-opacity-70 text-white text-2xl">
                <FontAwesomeIcon icon={faSchoolCircleCheck} />
              </div>
            </div>
            <h1 className="text-xl text-center font-bold text-teal-300 mt-4 group-hover:text-teal-200">
              {item.className}
            </h1>
          </div>
        </Link>
      ))}
    </div>
    <a href="/CMS STUDENT FORM.xlsx">
      <div className="flex cursor-pointer transition px-4 py-2 bg-teal-800 hover:bg-teal-700 text-teal-200 font-bold space-x-2 items-center rounded-full max-w-md m-3 text-center justify-center shadow-lg">
        <FontAwesomeIcon icon={faDownload} />
        <p>Download Excel Sheet</p>
      </div>
    </a>
  </>
  
  );
}

export default AllClasses;
