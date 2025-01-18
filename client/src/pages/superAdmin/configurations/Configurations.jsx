import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";

const AdminConfigPage = () => {
  const [settings, setSettings] = useState({
    academicYear: "",
    saSubmission: false,
    faSubmission: false,
    hallTicketDownload: false,
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
    <div className="min-h-screen bg-gray-900 text-white py-6 flex flex-col justify-center sm:py-12">
      <div className="flex justify-between space-x-3 py-3 sm:max-w-3xl sm:mx-auto">
        <div className="px-4 py-4 bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Admin Configuration</h1>

            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Half Year Exam Result Submission</label>
                <div className="flex items-center">
                  <button
                    className={`${
                      settings.saSubmission ? "bg-blue-500" : "bg-gray-600"
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200`}
                    onClick={() => handleToggle("saSubmission")}
                  >
                    <span
                      className={`${
                        settings.saSubmission
                          ? "translate-x-5"
                          : "translate-x-0"
                      } inline-block h-5 w-5 rounded-full bg-gray-900 transition-transform duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm">
                    {settings.saSubmission ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">FA Mark Submission</label>
                <div className="flex items-center">
                  <button
                    className={`${
                      settings.faSubmission ? "bg-blue-500" : "bg-gray-600"
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200`}
                    onClick={() => handleToggle("faSubmission")}
                  >
                    <span
                      className={`${
                        settings.faSubmission
                          ? "translate-x-5"
                          : "translate-x-0"
                      } inline-block h-5 w-5 rounded-full bg-gray-900 transition-transform duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm">
                    {settings.faSubmission ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Hall Ticket Download</label>
                <div className="flex items-center">
                  <button
                    className={`${
                      settings.hallTicketDownload
                        ? "bg-blue-500"
                        : "bg-gray-600"
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200`}
                    onClick={() => handleToggle("hallTicketDownload")}
                  >
                    <span
                      className={`${
                        settings.hallTicketDownload
                          ? "translate-x-5"
                          : "translate-x-0"
                      } inline-block h-5 w-5 rounded-full bg-gray-900 transition-transform duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm">
                    {settings.hallTicketDownload ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Last Register Number</label>
                <input
                  type="text"
                  value={settings.lastRegisterNo}
                  onChange={updateLastRegisterNo}
                  className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigPage;
