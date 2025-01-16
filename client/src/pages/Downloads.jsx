import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../Axios";
import { UserAuthContext } from "../context/userContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function Downloads() {
  const { authData } = useContext(UserAuthContext);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");

  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);

  const deleteFile = async (e, id) => {
    e.preventDefault();
    if (window.confirm("do you want to delete this file")) {
      try {
        let res = await Axios.delete(`/downloads/${id}`);
        if (res.status === 200) {
          window.location.reload();
        }
      } catch (error) {
        toast.error("something went wrong", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        console.log(error.response);
      }
    }
  };
  const handleFileChange = (file) => {
    setFile(file);
  };
  const getDownloads = async () => {
    try {
      let { data } = await Axios.get("/downloads");
      setDownloads(data);
    } catch (error) {
      console.log(error.response);
    }
  };
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("type", type);
  const fileUpload = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (!title || !type || !file) {
        toast.error("Please fill all fields", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        setLoading(false);
      }

      let res = await Axios.post("/downloads", formData);
      if (res.status === 200) {
        setFile(null);
        setLoading(true);
        toast.success("file uploaded successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        window.location.reload();
      }
    } catch (error) {
      setLoading(false);
      console.log(error.response);
      toast.error("Error occured", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    getDownloads();
  }, [type]);
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-10">
        Downloads
      </h1>

      {authData?.role === "superAdmin" && (
        <div className="max-w-xl mx-auto bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          {/* Select Dropdown */}
          <div className="mb-6">
            <label
              htmlFor="countries"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Select an Option
            </label>
            <select
              id="countries"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3 transition"
            >
              <option value="" disabled>
                Choose one
              </option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label
              htmlFor="formFile"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Upload Your File
            </label>
            <input
              type="file"
              id="formFile"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-lg p-3 cursor-pointer focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label
              htmlFor="file-title"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="file-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Upload Button */}
          <div>
            {loading ? (
              <button
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg opacity-70 cursor-not-allowed"
                disabled
              >
                Uploading...
              </button>
            ) : (
              <button
                onClick={fileUpload}
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-500 transition"
              >
                Upload
              </button>
            )}
          </div>
        </div>
      )}

      {/* Downloads Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {downloads.map((download, key) => (
          <div
            key={download._id}
            className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-transform transform hover:scale-105"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold uppercase text-indigo-500">
                {download.type}
              </span>
              {authData?.role === "superAdmin" && (
                <button
                  onClick={(e) => deleteFile(e, download._id)}
                  className="bg-red-600 p-2 rounded-full hover:bg-red-500 text-white transition"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>

            {/* Title */}
            <a
              href={download.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-lg font-bold text-gray-200 hover:text-indigo-500 transition"
            >
              {download.title}
            </a>

            {/* Download Button */}
            <div className="mt-4 flex items-center justify-between">
              <a
                href={download.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition"
              >
                Download
              </a>
              <p className="text-sm text-gray-400">{/* Optional Info */}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Downloads;
