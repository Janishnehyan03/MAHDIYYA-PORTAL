// This component was already improved in the previous request.
// Here it is again for completeness, ensuring it matches the new theme perfectly.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import AllNotifications from "../../AllNotifications";

function CreateNotification() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.post("/notification", { title, url });
      if (res.status === 200) {
        toast.success("Notification Added Successfully!", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
        setTimeout(() => {
          navigate("/all-notifications"); // Navigate to the improved list page
        }, 1000);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Something went wrong", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
      console.log(error.response);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 ">
      <div className="w-full max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8 mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
            Create Notification
          </h2>

          <div className="mb-6">
            <label
              htmlFor="notificationTitle"
              className="block text-sm font-semibold mb-2 text-gray-600"
            >
              Notification Title
            </label>
            <input
              id="notificationTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Important Exam Update"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="notificationLink"
              className="block text-sm font-semibold mb-2 text-gray-600"
            >
              Notification Link
            </label>
            <input
              id="notificationLink"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/notification"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Create Notification"}
          </button>
        </form>
      </div>

      <AllNotifications className="mt-8 w-full max-w-2xl" />
    </div>
  );
}

export default CreateNotification;
