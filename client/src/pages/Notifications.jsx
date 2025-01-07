import React, { useState, useEffect } from "react";
import Axios from "../Axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const getAllNotifications = async () => {
    try {
      let { data } = await Axios.get("/notification");
      setNotifications(data.docs);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllNotifications();
  }, []);
  return (
    <div className="mx-auto ">
      <h1 className="text-white font-bold text-center text-3xl my-4">
        All Notifications
      </h1>

      <div className="px-4 py-8 m-auto mt-5  grid grid-cols-1 lg:grid-cols-2">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification, key) => (
              <a
                href={notification?.url}
                className="relative  w-full group mt-2 mx-2"
              >
                <div className="relative px-7 py-6 bg-gray-900 ring-1 ring-blue-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M6.75 6.75C6.75 5.64543 7.64543 4.75 8.75 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V19.25L12 14.75L6.75 19.25V6.75Z"
                    />
                  </svg>
                  <div className="space-y-2">
                    <p className="text-slate-800">{notification?.title}</p>
                    <a
                      href={notification?.url}
                      className="block text-indigo-400 group-hover:text-slate-800 transition duration-200"
                      target="_blank"
                    >
                      Go to details
                      {/* <span className="text-white animate-pulse text-sm ml-3 bg-red-500 rounded-full px-2">new</span> */}
                    </a>
                  </div>
                </div>
              </a>
            ))}
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default Notifications;
