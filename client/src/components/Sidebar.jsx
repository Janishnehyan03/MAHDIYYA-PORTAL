import {
  faBars,
  faBell,
  faBookOpen,
  faBookOpenReader,
  faBuildingCircleArrowRight,
  faClose,
  faHome,
  faMarker,
  faMessage,
  faPersonChalkboard,
  faPowerOff,
  faRecycle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserAuthContext } from "./../context/userContext";

function Sidebar() {
  const { authData, logout } = useContext(UserAuthContext);
  const [openSidebar, setOpenSidebar] = useState(false);

  const navigations = [
    {
      name: "Dashboard",
      route: "/",
      icon: faHome,
    },

    {
      name: "New Teacher",
      route: "/create-teacher",
      icon: faPersonChalkboard,
    },

    {
      name: "Results",
      route: "/result-view",
      icon: faBookOpen,
    },
  ];
  const SuperAdmin = [
    {
      name: "Dashboard",
      route: "/",
      icon: faHome,
    },

    {
      name: "Study Centers",
      route: "/study-centre-section",
      icon: faBuildingCircleArrowRight,
    },
    {
      name: "Students",
      route: "/all-centre-students",
      icon: faBookOpenReader,
    },
    {
      name: "Create Course",
      route: "/create-course",
      icon: faBookOpen,
    },
    {
      name: "Create Notification",
      route: "/create-notification",
      icon: faBell,
    },
    {
      name: "Create Messages",
      route: "/create-messages",
      icon: faMessage,
    },
    {
      name: "Result Management",
      route: "/result-section",
      icon: faMarker,
    },
    {
      name: "Recycle Bin",
      route: "/trash",
      icon: faRecycle,
    },
  ];

  return (
    <>
      <div
        onClick={() => setOpenSidebar(!openSidebar)}
        className="relative z-40"
      >
        <span className="absolute top-1 right-1 text-white text-4xl cursor-pointer">
          <button
            className="bi bi-filter-left px-2 rounded-md"
            onClick={() => setOpenSidebar(!openSidebar)}
          >
            {!openSidebar ? (
              <FontAwesomeIcon
                icon={faBars}
                className="cursor-pointer ml-28 lg:hidden"
              />
            ) : (
              <FontAwesomeIcon
                icon={faClose}
                className="cursor-pointer ml-28 lg:hidden"
              />
            )}
          </button>
        </span>

        <div
          className={`fixed top-0 bottom-0 lg:left-0 p-4 lg:w-[250px] w-full overflow-y-auto bg-gray-900 text-center transition-transform duration-300 ${
            !openSidebar ? "transform -translate-x-full lg:transform-none" : ""
          }`}
        >
          <div className="p-3 mt-1 mb-6 flex items-center justify-between">
            <Link to={"/"} className="ml-3">
              <h1 className="font-bold text-3xl text-gray-400 border-b-2 pb-1">
                DASHBOARD
              </h1>
            </Link>
            <div className="my-2 bg-gray-600 h-[1px]" />
          </div>

          {authData?.role === "admin" &&
            navigations.map((navigation, index) => (
              <NavLink
                to={navigation.route}
                key={index}
                className={({ isActive }) =>
                  isActive
                    ? "p-3 mt-3 flex items-center rounded-md px-4 bg-teal-600 text-white duration-300"
                    : "p-3 mt-3 flex items-center rounded-md px-4 text-white hover:bg-teal-600 duration-300"
                }
              >
                <FontAwesomeIcon icon={navigation.icon} className="text-xl" />
                <span className="text-sm ml-4 font-semibold">
                  {navigation.name}
                </span>
              </NavLink>
            ))}

          {authData?.role === "superAdmin" &&
            SuperAdmin.map((navigation, index) => (
              <NavLink
                to={navigation.route}
                key={index}
                className={({ isActive }) =>
                  isActive
                    ? "p-3 mt-3 flex items-center rounded-md px-4 bg-teal-600 text-white duration-300"
                    : "p-3 mt-3 flex items-center rounded-md px-4 text-white hover:bg-teal-600 duration-300"
                }
              >
                <FontAwesomeIcon icon={navigation.icon} className="text-xl" />
                <span className="text-sm ml-4 font-semibold">
                  {navigation.name}
                </span>
              </NavLink>
            ))}

          <div className="my-4 bg-gray-600 h-[1px]" />

          {authData ? (
            <div className="absolute bottom-2 w-full">
              <div className="p-3 mt-3 flex items-center justify-between rounded-md bg-teal-600 text-white">
                <Link
                  to={"/profile"}
                  className="text-sm ml-4 font-semibold text-white uppercase"
                >
                  <FontAwesomeIcon icon={faUser} /> {authData.username}
                </Link>
              </div>

              <div
                onClick={() => logout()}
                className="p-3 mt-3 flex items-center rounded-md cursor-pointer hover:bg-red-600 text-white"
              >
                <FontAwesomeIcon icon={faPowerOff} />
                <span className="text-sm ml-4 font-semibold">Logout</span>
              </div>
            </div>
          ) : (
            <Link
              to={"/login"}
              className="p-3 mt-3 flex items-center rounded-md bg-teal-600 text-white cursor-pointer"
            >
              <i className="bi bi-box-arrow-in-right" />
              <span className="text-sm ml-4 font-semibold">Login</span>
            </Link>
          )}

          {authData?.role === "admin" && (
            <NavLink
              to={"/my-messages"}
              className={({ isActive }) =>
                isActive
                  ? "p-3 mt-3 flex items-center rounded-md px-4 bg-teal-600 text-white duration-300"
                  : "p-3 mt-3 flex items-center rounded-md px-4 text-white hover:bg-teal-600 duration-300"
              }
            >
              <FontAwesomeIcon icon={faMessage} className="text-xl" />
              <span className="text-sm ml-4 font-semibold">My Messages</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
