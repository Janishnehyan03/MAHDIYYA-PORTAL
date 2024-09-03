import {
  faFileCircleCheck,
  faPen,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserAuthContext } from "../../../context/userContext";

function CceHome() {
  const { authData } = useContext(UserAuthContext);
  return (
    <div>
      <h1 className="text-4xl text-center font-bold  my-5">CCE Marks </h1>
      <div className="lg:grid lg:grid-cols-3 gap-3 m-4">
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
              CCE Marks
            </h1>
          </div>
        </Link>
        {authData.role === "admin" && (
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
                Add CCE Marks
              </h1>
            </div>
          </Link>
        )}
        {authData.role === "admin" && (
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
                Edit CCE Marks
              </h1>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default CceHome;
