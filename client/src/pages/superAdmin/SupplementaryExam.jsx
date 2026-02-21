import React, { useState, useEffect } from "react";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faUpload, faSpinner, faCog, faDatabase, faUsers } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

// Toggle Switch component
const ToggleSwitch = ({ enabled, onChange, loading }) => (
    <button
        type="button"
        disabled={loading}
        onClick={onChange}
        className={`${enabled ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        <span
            className={`${enabled ? "translate-x-6" : "translate-x-1"
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
    </button>
);

function SupplementaryExam() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [activeTab, setActiveTab] = useState("data"); // 'settings', 'data', 'status'

    // Configuration state
    const [config, setConfig] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
        fetchRecords();
        fetchConfig();
    }, [selectedClass]);

    const fetchConfig = async () => {
        try {
            const { data } = await Axios.get("/configurations");
            setConfig(data);
        } catch (error) {
            console.error("Error fetching configurations", error);
        }
    };

    const handleToggle = async () => {
        if (!config || !config._id) return;
        setToggleLoading(true);
        const newStatus = !config.supplementaryExam;
        try {
            await Axios.patch(`/configurations/${config._id}`, {
                supplementaryExam: newStatus,
            });
            setConfig(prev => ({ ...prev, supplementaryExam: newStatus }));
            toast.success(`Supplementary Exams ${newStatus ? 'Enabled' : 'Disabled'}`);
        } catch (error) {
            toast.error("Failed to update settings");
            console.error(error);
        } finally {
            setToggleLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const { data } = await Axios.get("/class");
            setClasses(data);
        } catch (error) {
            console.error("Error fetching classes", error);
        }
    };

    const fetchRecords = async () => {
        try {
            const url = selectedClass ? `/supplementary-exam/super-admin-records?classId=${selectedClass}` : "/supplementary-exam/super-admin-records";
            const { data } = await Axios.get(url);
            setRecords(data.data.records);
        } catch (error) {
            console.error("Error fetching records", error);
        }
    };

    const handleDownloadTemplate = async () => {
        if (!selectedClass) {
            alert("Please select a class first");
            return;
        }
        try {
            setLoading(true);
            const response = await Axios.get(`/supplementary-exam/template/${selectedClass}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const classNameStr = classes.find((c) => c._id === selectedClass)?.className || selectedClass;
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Template_${classNameStr}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert("Download failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFinalData = async () => {
        try {
            setLoading(true);
            const urlPath = selectedClass ? `/supplementary-exam/download-final-data/${selectedClass}` : "/supplementary-exam/download-final-data";
            const response = await Axios.get(urlPath, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const classNameStr = selectedClass ? classes.find((c) => c._id === selectedClass)?.className || selectedClass : 'All_Classes';
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Final_Supplementary_Marks_${classNameStr}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            const errData = error.response?.data;
            toast.error(errData?.message || "Failed to download final data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedClass) {
            toast.warn("Please select a class and a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("classId", selectedClass);

        try {
            setLoading(true);
            const { data } = await Axios.post("/supplementary-exam/upload-initial", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(data.message);
            setFile(null);
            fetchRecords(); // Refresh table
        } catch (error) {
            console.error("Upload failed", error);
            const errData = error.response?.data;
            if (errData?.errors && Array.isArray(errData.errors)) {
                // Display the first few errors, or iterate
                errData.errors.slice(0, 3).forEach(err => toast.error(err));
                if (errData.errors.length > 3) {
                    toast.error(`...and ${errData.errors.length - 3} more errors.`);
                }
            } else {
                toast.error(errData?.message || "Upload failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Supplementary Exam Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage settings, assignments, and submissions for supplementary exams.
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`${activeTab === "settings"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <FontAwesomeIcon icon={faCog} /> Settings
                        </button>
                        <button
                            onClick={() => setActiveTab("data")}
                            className={`${activeTab === "data"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <FontAwesomeIcon icon={faDatabase} /> Data Management
                        </button>
                        <button
                            onClick={() => setActiveTab("status")}
                            className={`${activeTab === "status"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <FontAwesomeIcon icon={faUsers} /> Student Status
                        </button>
                    </nav>
                </div>

                {activeTab === "settings" && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8 max-w-2xl">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Feature Settings</h2>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-gray-700">Enable Supplementary Exams</h3>
                                <p className="text-sm text-gray-500">Allow study centres to access and upload supplementary marks.</p>
                            </div>
                            <ToggleSwitch
                                enabled={config?.supplementaryExam || false}
                                onChange={handleToggle}
                                loading={toggleLoading || !config}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "data" && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Class
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    required
                                >
                                    <option value="" disabled>Select a Class</option>
                                    {classes.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.className}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={handleDownloadTemplate}
                                    disabled={loading || !selectedClass}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto"
                                >
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
                                    Download Template
                                </button>
                                <button
                                    onClick={handleDownloadFinalData}
                                    disabled={loading || !selectedClass}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 w-full sm:w-auto"
                                >
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
                                    Download Final Data
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Assignments</h3>
                            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-center">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full sm:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !file || !selectedClass}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                >
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUpload} />}
                                    Upload Data
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === "status" && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Student Status</h3>
                            {selectedClass && (
                                <span className="text-sm text-gray-500">
                                    Class Filter Applied
                                </span>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Reg No</th>
                                        <th className="px-6 py-3">Student Name</th>
                                        <th className="px-6 py-3">Study Centre</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Marks Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {records.length > 0 ? (
                                        records.map((r) => (
                                            <tr key={r._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">{r.registerNo}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{r.studentName}</td>
                                                <td className="px-6 py-4 text-gray-500">{r.studyCentreName} ({r.studyCentreCode})</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${r.studyCentreSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {r.studyCentreSubmitted ? "Completed" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {r.studyCentreSubmitted && r.centreSubmittedAt ? new Date(r.centreSubmittedAt).toLocaleDateString() : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SupplementaryExam;
