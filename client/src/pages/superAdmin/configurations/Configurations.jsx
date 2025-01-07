import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";

const AdminConfigPage = () => {
  const [settings, setSettings] = useState({
    academicYear: "",
    saSubmission: false,
    faSubmission: false,
    lastRegisterNo: "", // Added lastRegisterNo to state
  });
  const [message, setMessage] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  const getConfigurations = async () => {
    try {
      let response = await Axios.get("/configurations");
      setSettings(response.data);
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleToggle = async (setting) => {
    try {
      const updatedValue = !settings[setting];
      await Axios.patch(`/configurations/${settings._id}`, {
        [setting]: updatedValue,
      });
      setSettings((prevSettings) => ({
        ...prevSettings,
        [setting]: updatedValue,
      }));
    } catch (err) {
      console.log(err.response);
    }
  };

  // Update Last Register Number
  const updateLastRegisterNo = async (e) => {
    const newLastRegisterNo = e.target.value;
    try {
      await Axios.patch(`/configurations/${settings._id}`, {
        lastRegisterNo: newLastRegisterNo,
      });
      setSettings((prevSettings) => ({
        ...prevSettings,
        lastRegisterNo: newLastRegisterNo,
      }));
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleInputChange = (e, index) => {
    const newYears = [...academicYears];
    newYears[index].year = e.target.value;
    setAcademicYears(newYears);
  };

  const createAcademicYear = async () => {
    try {
      setLoading(true);
      await Axios.post(`/academic-year`, { year });
      getAcademicYears();
      setYear("");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err.response);
    }
  };

  const handleInputBlur = async (yearId, year) => {
    try {
      setMessage("updating");
      await Axios.patch(`/academic-year/${yearId}`, { year });
      getAcademicYears();
      setMessage("updated");
    } catch (err) {
      console.log(err.response);
    }
  };

  const getAcademicYears = async () => {
    try {
      let { data } = await Axios.get(`/academic-year`);
      setAcademicYears(data);
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    getConfigurations();
    getAcademicYears();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="flex justify-between space-x-3 py-3 sm:max-w-3xl sm:mx-auto">
        <div className="px-4 py-4 bg-gray-900 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-2xl mx-auto">
            <div>
              <h1 className="text-2xl font-semibold mb-6">Admin Configuration</h1>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Half Year Exam Result Submission
                </label>
                <div className="flex items-center">
                  <button
                    className={`${
                      settings.saSubmission ? "bg-blue-600" : "bg-gray-200"
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleToggle("saSubmission")}
                  >
                    <span
                      className={`${
                        settings.saSubmission
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-gray-900 shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm text-white">
                    {settings.saSubmission ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  FA Mark Submission
                </label>
                <div className="flex items-center">
                  <button
                    className={`${
                      settings.faSubmission ? "bg-blue-600" : "bg-gray-200"
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleToggle("faSubmission")}
                  >
                    <span
                      className={`${
                        settings.faSubmission
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-gray-900 shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm text-white">
                    {settings.faSubmission ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* New Field: Last Register Number */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Register Number
                </label>
                <input
                  type="text"
                  value={settings.lastRegisterNo}
                  onChange={updateLastRegisterNo}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  New Admission Requests
                </label>
                <div className="flex items-center">
                  <button
                    className={`${
                      settings.newAdmission ? "bg-blue-600" : "bg-gray-200"
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleToggle("newAdmission")}
                  >
                    <span
                      className={`${
                        settings.newAdmission
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-gray-900 shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm text-white">
                    {settings.newAdmission ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Year Creation Section */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Academic Years
            </label>
            <div className="flex">
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {loading ? (
                <button className="bg-gray-700 text-white px-3 py-2 rounded-full ml-2">
                  Loading..
                </button>
              ) : (
                <button
                  onClick={() => createAcademicYear()}
                  className="bg-gray-700 text-white px-3 py-2 rounded-full ml-2"
                >
                  Create
                </button>
              )}
            </div>

            {academicYears.map((year, index) => (
              <div className="flex items-center space-x-2" key={year._id}>
                <input
                  type="text"
                  value={year.year}
                  onChange={(e) => handleInputChange(e, index)}
                  onBlur={() => handleInputBlur(year._id, year.year)}
                  className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {year.currentYear && <p className="text-sm ">Current Year</p>}
              </div>
            ))}
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigPage;
