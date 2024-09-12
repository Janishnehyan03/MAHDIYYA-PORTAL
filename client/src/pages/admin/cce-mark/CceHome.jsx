import {
  faFileCircleCheck,
  faPen,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserAuthContext } from "../../../context/userContext";
import Axios from "../../../Axios";

function CceHome() {
  const [configuration, setConfiguration] = useState();

  const { authData } = useContext(UserAuthContext);

  const getConfigurations = async () => {
    try {
      let response = await Axios.get("/configurations");
      console.log(response.data);
      
      setConfiguration(response.data);
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    getConfigurations();
  }, []);
  return (
    <div>
      <h1 className="text-4xl text-center font-bold  my-5">Mark Entry </h1>
      <div className="lg:grid lg:grid-cols-3 gap-3 m-4">
        {configuration?.faSubmission && authData.role === "admin" && (
          <>
            <Link to={"/view-cce-mark"}>
              <div className=" py-4 overflow-hidden  cursor-pointer bg-gray-800 rounded-xl group  duration-300 shadow-2xl group">
                <div className="flex">
                  <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                    <FontAwesomeIcon
                      icon={faFileCircleCheck}
                      color="white"
                    ></FontAwesomeIcon>
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
                  Formative Assessment
                </h1>
              </div>
            </Link>
            <Link to={"/add-cce-mark"}>
              <div className=" py-4 overflow-hidden  cursor-pointer bg-gray-800 rounded-xl group  duration-300 shadow-2xl group">
                <div className="flex">
                  <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                    <FontAwesomeIcon
                      icon={faPlusSquare}
                      color="white"
                    ></FontAwesomeIcon>
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
                  Add FA Marks
                </h1>
              </div>
            </Link>
            <Link to={"/edit-cce-mark"}>
              <div className=" py-4 overflow-hidden  cursor-pointer bg-gray-800 rounded-xl group  duration-300 shadow-2xl group">
                <div className="flex">
                  <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                    <FontAwesomeIcon
                      icon={faPen}
                      color="white"
                    ></FontAwesomeIcon>
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
                  Edit FA Marks
                </h1>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default CceHome;
