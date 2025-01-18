import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import AllNotifications from "../../AllNotifications";

function CreateNotification() {
  const navigate = useNavigate();

  const initialState = {
    title: "",
    url: "",
  };
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res = await Axios.post("/notification", formData);
      if (res.status === 200) {
        setLoading(false);
        setFormData(initialState);
        toast.success("Notification Added Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
      }
      navigate("/all-notifications");
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
      console.log(error.response);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
      <section className="bg-gray-800 p-6 lg:w-2/4 mx-auto rounded-lg shadow-lg">
        <div className="max-w-screen-xl mx-auto">
          <h3 className="text-4xl font-bold text-white uppercase mb-6 text-center">
            Create Notification
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="px-4 sm:px-0">
                <label
                  className="block text-sm font-bold mb-2 text-[#eeeeee]"
                  htmlFor="notificationTitle"
                >
                  Notification Title
                </label>
                <input
                  className="focus:ring-indigo-500 focus:border-indigo-500 shadow appearance-none border rounded w-full py-4 px-3 leading-tight focus:outline-none focus:shadow-outline uppercase bg-gray-700 text-white"
                  id="notificationTitle"
                  type="text"
                  value={formData.title}
                  onChange={onChange}
                  placeholder="Notification Title"
                  name="title"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="px-4 sm:px-0">
                <label
                  className="block text-sm font-bold mb-2 text-[#eeeeee]"
                  htmlFor="notificationLink"
                >
                  Notification Link
                </label>
                <input
                  className="focus:ring-indigo-500 focus:border-indigo-500 shadow appearance-none border rounded w-full py-4 px-3 leading-tight focus:outline-none focus:shadow-outline uppercase bg-gray-700 text-white"
                  id="notificationLink"
                  type="text"
                  value={formData.url}
                  onChange={onChange}
                  placeholder="Notification Link"
                  name="url"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="px-4 sm:px-0">
                {!loading ? (
                  <button
                    type="submit"
                    className="w-full  bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase transition"
                  >
                    Create Notification
                  </button>
                ) : (
                  <div className="w-full  bg-teal-500 text-center text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase">
                    Processing..
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
      <AllNotifications />
    </div>
  );
}

export default CreateNotification;
