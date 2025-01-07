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
      <h1 className="text-white font-bold text-3xl mt-4 text-center">
        {authData?.branch.studyCentreName}
      </h1>
      <h1 className="bg-blue-600 my-3 text-center text-white p-3 font-semibold">
        All Students
      </h1>
      <Link to={`/new-student`}>
        <button className="px-4 py-2 bg-blue-900 text-white font-semibold ml-4 hover:bg-blue-800">
          New Student{" "}
        </button>
      </Link>
      <div className="w-full items-center px-4 py-8 m-auto mt-5 grid grid-cols-1 lg:grid-cols-3">
        {classes.map((item, key) => (
          <Link
            to={`/all-students/${item._id}`}
            key={key}
            className="w-full p-2"
          >
            <div className=" py-4 overflow-hidden bg-blue-600 rounded-xl  duration-300 shadow-2xl group">
              <div className="flex">
                <div className="px-4 py-4 bg-teal-300  rounded-xl bg-opacity-30 mx-auto text-2xl">
                  <FontAwesomeIcon
                    icon={faSchoolCircleCheck}
                    color="white"
                  ></FontAwesomeIcon>
                </div>
              </div>
              <h1 className="text-xl text-center font-bold text-white mt-4 group-hover:text-teal-50">
                {item.className}
              </h1>
            </div>
          </Link>
        ))}
      </div>
      <a href="/CMS STUDENT FORM.xlsx">
        <div className="flex bg-blue-600 hover:bg-blue-600 cursor-pointer transition px-4 py-2 text-white font-bold space-x-2 items-center rounded-full max-w-md m-3 text-center justify-center">
          <FontAwesomeIcon icon={faDownload} />
          <p> Download Excel Sheet</p>
        </div>
      </a>
    </>
  );
}

export default AllClasses;
