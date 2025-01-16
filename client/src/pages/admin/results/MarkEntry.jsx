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
    <div className="bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl text-center font-bold my-5 text-teal-300">
        Mark Entry
      </h1>
      {authData.role === "admin" && (
        <div className="lg:grid lg:grid-cols-3 gap-6 mx-6">
          <Link to={"/view-cce-mark"}>
            <div className="py-6 bg-gray-800 hover:bg-gray-700 rounded-xl shadow-md transform transition-all duration-300 group cursor-pointer">
              <div className="flex justify-center">
                <div className="p-4 bg-gray-600 group-hover:bg-teal-500 rounded-full bg-opacity-40 text-3xl">
                  <FontAwesomeIcon icon={faFileCircleCheck} color="white" />
                </div>
              </div>
              <h1 className="text-xl text-center font-bold text-gray-300 group-hover:text-teal-300 mt-4">
                Formative Assessment
              </h1>
            </div>
          </Link>

          {configuration?.faSubmission && (
            <Link to={"/add-cce-mark"}>
              <div className="py-6 bg-gray-800 hover:bg-gray-700 rounded-xl shadow-md transform transition-all duration-300 group cursor-pointer">
                <div className="flex justify-center">
                  <div className="p-4 bg-gray-600 group-hover:bg-teal-500 rounded-full bg-opacity-40 text-3xl">
                    <FontAwesomeIcon icon={faPlusSquare} color="white" />
                  </div>
                </div>
                <h1 className="text-xl text-center font-bold text-gray-300 group-hover:text-teal-300 mt-4">
                  Add FA Marks
                </h1>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 gap-6 mx-6 mt-2">
        {authData.role === "admin" && (
          <>
            <Link to={"/result-view"}>
              <div className="py-6 bg-teal-700 hover:bg-teal-600 rounded-xl shadow-lg transform transition-transform duration-300 group cursor-pointer">
                <div className="flex justify-center">
                  <div className="p-4 bg-white group-hover:bg-gray-100 rounded-full bg-opacity-80 text-teal-700 group-hover:text-teal-600 text-3xl">
                    <FontAwesomeIcon icon={faFileCircleCheck} />
                  </div>
                </div>
                <h1 className="text-xl text-center font-semibold text-white group-hover:text-gray-100 mt-4">
                  Summative Assessment
                </h1>
              </div>
            </Link>
            {configuration?.saSubmission && (
              <Link to={"/add-result"}>
                <div className="py-6 bg-teal-700 hover:bg-teal-600 rounded-xl shadow-lg transform transition-transform duration-300 group cursor-pointer">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white group-hover:bg-gray-100 rounded-full bg-opacity-80 text-teal-700 group-hover:text-teal-600 text-3xl">
                      <FontAwesomeIcon icon={faPlusSquare} />
                    </div>
                  </div>
                  <h1 className="text-xl text-center font-semibold text-white group-hover:text-gray-100 mt-4">
                    Add SA Marks
                  </h1>
                </div>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MarkEntry;
