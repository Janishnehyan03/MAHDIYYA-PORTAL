import {
    faDownload,
    faFileUpload,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import Axios from "../../../Axios";
import { ClassContext } from "../../../context/classContext";
import { toast } from "react-toastify";

const PageHeader = ({ title, subtitle }) => (
    <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            {title}
        </h1>
        <p className="mt-2 text-lg text-slate-500">{subtitle}</p>
    </div>
);

const StyledSelect = ({ value, onChange, options, placeholder, label, ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-semibold text-slate-600 ml-1">{label}</label>}
        <select
            value={value || ""}
            onChange={onChange}
            className="w-full bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            {...props}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

function BulkMarkUpload() {
    const [exams, setExams] = useState([]);
    const { classes, getClasses } = useContext(ClassContext);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedExam, setSelectedExam] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getClasses && getClasses();
        const fetchExams = async () => {
            try {
                const { data } = await Axios.get("/exam?isActive=true");
                setExams(data);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
            }
        };
        fetchExams();
    }, [getClasses]);

    const handleDownloadDemo = async () => {
        if (!selectedClass) {
            toast.warning("Please select a class first");
            return;
        }
        setLoading(true);
        try {
            const response = await Axios.get(`/result/bulk-demo/${selectedClass}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            const fileName = `Bulk_Mark_Demo_${classes.find(c => c._id === selectedClass)?.className}.xlsx`;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Demo file downloaded");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download demo file");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedExam || !file) {
            toast.warning("Please fill all fields and select a file");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await Axios.post(
                `/result/bulk-upload/${selectedClass}/${selectedExam}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            toast.success(data.message || "Bulk results uploaded successfully");
            setFile(null);
            // Reset file input if needed
            e.target.reset();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload bulk results");
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <PageHeader
                    title="Bulk Mark Upload"
                    subtitle="Download the demo Excel, fill in the marks, and upload it to the system."
                />

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <StyledSelect
                            label="1. Select Class"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            options={classes.map((c) => ({ value: c._id, label: c.className }))}
                            placeholder="-- Choose Class --"
                        />
                        <div className="flex flex-col justify-end">
                            <button
                                onClick={handleDownloadDemo}
                                disabled={loading || !selectedClass}
                                className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50"
                            >
                                {loading ? (
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                ) : (
                                    <FontAwesomeIcon icon={faDownload} />
                                )}
                                Download Demo Excel
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">2. Upload Filled Excel</h3>
                        <form onSubmit={handleUpload} className="space-y-6">
                            <StyledSelect
                                label="Select Exam"
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                options={exams.map((e) => ({ value: e._id, label: e.examName }))}
                                placeholder="-- Choose Exam --"
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Select File</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <FontAwesomeIcon icon={faFileUpload} className="text-4xl text-slate-400" />
                                        <p className="text-slate-500">
                                            {file ? (
                                                <span className="text-indigo-600 font-semibold">{file.name}</span>
                                            ) : (
                                                "Click or drag file here to upload"
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400">Only .xlsx or .xls files allowed</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !file || !selectedExam || !selectedClass}
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:bg-slate-300 disabled:shadow-none"
                            >
                                {uploading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload & Process Marks"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default BulkMarkUpload;
