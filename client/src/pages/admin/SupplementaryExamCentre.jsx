import React, { useState, useEffect } from "react";
import Axios from "../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faUpload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function SupplementaryExamCentre() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        fetchConfig();
        fetchClasses();
        fetchRecords();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await Axios.get("/configurations");
            setConfig(data);
        } catch (error) {
            console.error("Error fetching configurations", error);
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
            const { data } = await Axios.get("/supplementary-exam/centre-records");
            setRecords(data.data.records);
        } catch (error) {
            console.error("Error fetching records", error);
        }
    };

    const handleDownloadList = async () => {
        try {
            setLoading(true);
            const urlPath = selectedClass ? `/supplementary-exam/download-centre-list/${selectedClass}` : "/supplementary-exam/download-centre-list";
            const response = await Axios.get(urlPath, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const classNameStr = selectedClass ? classes.find((c) => c._id === selectedClass)?.className || selectedClass : 'All_Classes';
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Supplementary_Marks_Entry_${classNameStr}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert(error.response?.data?.message || "Download failed. You might not have any assigned students.");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadMarks = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.warn("Please select a file to upload");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const { data } = await Axios.post("/supplementary-exam/upload-marks", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(data.message);
            setFile(null);
            fetchRecords(); // Refresh table
        } catch (error) {
            console.error("Upload failed", error);
            const errData = error.response?.data;
            if (errData?.errors && Array.isArray(errData.errors)) {
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
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Supplementary Exam Marks Entry
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Download your assigned students list, enter their marks, and upload the completed file.
                    </p>
                </div>

                {config && !config.supplementaryExam ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Notice:</strong> The Supplementary Exam feature is currently disabled by the administration. You cannot download lists or upload marks at this time.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Class
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

                            <button
                                onClick={handleDownloadList}
                                disabled={loading || !selectedClass}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
                                Download Student List
                            </button>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Entered Marks</h3>
                            <form onSubmit={handleUploadMarks} className="flex flex-col sm:flex-row gap-4 items-center">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full sm:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !file}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                >
                                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUpload} />}
                                    Upload Marks
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Your Assigned Students</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Reg No</th>
                                    <th className="px-6 py-3">Student Name</th>
                                    <th className="px-6 py-3">Class</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Completed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {records.length > 0 ? (
                                    records.map((r) => (
                                        <tr key={r._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{r.registerNo}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{r.studentName}</td>
                                            <td className="px-6 py-4 text-gray-500">{r.class?.className}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${r.studyCentreSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {r.studyCentreSubmitted ? "Marks Entered" : "Pending Action"}
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
                                            No students are currently assigned to your centre for supplementary exams.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupplementaryExamCentre;
