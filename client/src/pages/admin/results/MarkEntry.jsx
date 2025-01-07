import {
  faFileCircleCheck,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

function MarkEntry() {
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
      {authData.role === "admin" && (
        <div className="lg:grid lg:grid-cols-3 gap-3 m-4">
          <Link to={"/view-cce-mark"}>
            <div className="py-4 overflow-hidden cursor-pointer bg-gray-800 rounded-xl group duration-300 shadow-2xl">
              <div className="flex">
                <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                  <FontAwesomeIcon icon={faFileCircleCheck} color="white" />
                </div>
              </div>
              <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
                Formative Assessment
              </h1>
            </div>
          </Link>

          {configuration?.faSubmission && (
            <Link to={"/add-cce-mark"}>
              <div className="py-4 overflow-hidden cursor-pointer bg-gray-800 rounded-xl group duration-300 shadow-2xl">
                <div className="flex">
                  <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                    <FontAwesomeIcon icon={faPlusSquare} color="white" />
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
                  Add FA Marks
                </h1>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 gap-3 m-4">
        { authData.role === "admin" && (
          <>
            <Link to={"/result-view"}>
              <div className=" py-4 overflow-hidden  cursor-pointer bg-blue-600 rounded-xl group  duration-300 shadow-2xl group">
                <div className="flex">
                  <div className="px-4 py-4 bg-teal-300 group-hover:bg-teal-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                    <FontAwesomeIcon
                      icon={faFileCircleCheck}
                      color="white"
                    ></FontAwesomeIcon>
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold group-hover:text-white text-white mt-4">
                  Summative Assessment
                </h1>
              </div>
            </Link>
            {configuration?.saSubmission &&<Link to={"/add-result"}>
              <div className=" py-4 overflow-hidden  cursor-pointer bg-blue-600 rounded-xl group  duration-300 shadow-2xl group">
                <div className="flex">
                  <div className="px-4 py-4 bg-teal-300 group-hover:bg-teal-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                    <FontAwesomeIcon
                      icon={faPlusSquare}
                      color="white"
                    ></FontAwesomeIcon>
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold group-hover:text-white text-white mt-4">
                  Add SA Marks
                </h1>
              </div>
            </Link>}
          </>
        )}
      </div>
    </div>
  );
}

export default MarkEntry;
