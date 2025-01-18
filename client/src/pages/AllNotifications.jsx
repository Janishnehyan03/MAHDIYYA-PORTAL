import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Axios from "../Axios";

function AllNotifications() {
  const [notifications, setNotifications] = useState([]);

  const getAllNotifications = async () => {
    try {
      let { data } = await Axios.get("/notification");
      setNotifications(data.docs);
    } catch (error) {
      console.log(error);
    }
  };
  const deleteNotification = async (id) => {
    if (window.confirm("Do you want to delete this item")) {
      try {
        await Axios.post("/notification/" + id);
        getAllNotifications();
      } catch (error) {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    getAllNotifications();
  }, []);
  return (
    <div className="container mx-auto p-4">
    <h1 className="text-white font-bold text-center text-3xl my-4">
      All Notifications
    </h1>

    <div className="px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
      {notifications.length > 0 ? (
        notifications.map((notification, key) => (
          <div className="relative w-full group mt-2 mx-2" key={key}>
            <div className="relative px-7 py-6 bg-gray-900 ring-1 ring-blue-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <button
                onClick={() => deleteNotification(notification._id)}
                className="absolute top-4 right-2"
                aria-label="Delete notification"
              >
                <FontAwesomeIcon icon={faTrash} color="#e74848" />
              </button>
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
                <p className="text-white font-semibold">{notification?.title}</p>
                <a
                  href={notification?.url}
                  className="block text-indigo-400 group-hover:text-indigo-600 transition duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to details
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-white text-center col-span-2">
          No notifications available.
        </p>
      )}
    </div>
  </div>
  );
}

export default AllNotifications;
