import {
    faEdit,
    faFilePdf,
    faSearch,
    faSpinner,
    faTableList,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef, useState } from "react";
import Axios from "../../../Axios";
import { ClassContext } from "../../../context/classContext";
import { UserAuthContext } from "../../../context/userContext";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";

const PageHeader = ({ title, subtitle }) => (
    <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="mt-2 text-lg text-slate-500">{subtitle}</p>
    </div>
);

const StyledSelect = ({ value, onChange, options, placeholder, ...props }) => (
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
);

const StudentResultRow = ({ result, subjects, onEdit, onDelete, index, role }) => (
    <tr className="hover:bg-slate-50 transition border-b border-slate-200">
        <td className="p-2 text-center text-slate-400 font-medium border-r border-slate-100">{index + 1}</td>
        <td className="p-2 text-slate-700 font-bold border-r border-slate-100">{result.student?.registerNo || "-"}</td>
        <td className="p-2 font-bold text-slate-800 uppercase truncate max-w-[150px] border-r border-slate-100">{result.student?.studentName || "-"}</td>
        {subjects.map((sub, i) => {
            const mark = result.marks.find(m => m.subject?._id === sub._id) || {};
            return (
                <React.Fragment key={i}>
                    <td className="p-1 text-center text-slate-600 border-r border-slate-100">{mark.fa || "-"}</td>
                    <td className="p-1 text-center text-slate-600 border-r border-slate-100">{mark.sa || "-"}</td>
                    <td className="p-1 text-center text-slate-600 border-r border-slate-100">{mark.tenPercent || "-"}</td>
                    <td className="p-1 text-center text-slate-600 border-r border-slate-100">{mark.tl || "-"}</td>
                    <td className={`p-1 text-center font-black border-r border-slate-200 ${mark.status === 'FAILED' ? 'text-red-600' : 'text-slate-600'}`}>{mark.status || "-"}</td>
                </React.Fragment>
            );
        })}
        <td className="p-2 text-center font-black text-red-500 border-r border-slate-100">{result.noOfFailed || "0"}</td>
        <td className={`p-2 text-center font-black border-r border-slate-100 ${result.semStatus?.toString().toUpperCase() === 'FAILED' ? 'text-red-600' : 'text-slate-600'}`}>{result.semStatus || "-"}</td>
        <td className="p-2 text-center font-black text-slate-900 bg-slate-50 border-r border-slate-100">{result.gTotal || "0"}</td>
        <td className="p-2 text-center font-bold text-indigo-600 border-r border-slate-100">{(Number(result.percentage) / 100).toFixed(2)}%</td>
        <td className="p-2 text-center font-black text-slate-700 bg-indigo-50/10 border-r border-slate-100">{result.className || "-"}</td>
        {role === 'superAdmin' && (
            <td className="p-2 text-center">
                <div className="flex justify-center gap-1">
                    <button onClick={() => onEdit(result)} className="text-indigo-400 hover:text-indigo-700 p-1.5 rounded-full hover:bg-indigo-50 transition"><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={() => onDelete(result._id)} className="text-red-300 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition"><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </td>
        )}
    </tr>
);

const BulkResultsTable = ({ results, subjects, onEdit, onDelete, role }) => (
    <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full text-[10px] border-collapse bg-white">
            <thead className="bg-[#f8fafc] sticky top-0 z-10 font-black uppercase text-slate-500 border-b-2 border-slate-200">
                <tr>
                    <th className="p-2 border-r border-slate-200" rowSpan={2}>#</th>
                    <th className="p-2 border-r border-slate-200" rowSpan={2}>Reg No</th>
                    <th className="p-2 border-r border-slate-200" rowSpan={2}>Student Name</th>
                    {subjects.map((sub, i) => (
                        <th key={i} className="p-2 border-r border-slate-200 text-indigo-700 bg-indigo-50/20" colSpan={5}>
                            {sub.subjectName}
                        </th>
                    ))}
                    <th className="p-2 border-r border-slate-200 text-red-600" rowSpan={2}>Failed</th>
                    <th className="p-2 border-r border-slate-200" rowSpan={2}>Status</th>
                    <th className="p-2 border-r border-slate-200 text-slate-900 bg-slate-100" rowSpan={2}>G.Total</th>
                    <th className="p-2 border-r border-slate-200 text-indigo-600" rowSpan={2}>%</th>
                    <th className="p-2 border-r border-slate-200" rowSpan={2}>Class</th>
                    {role === 'superAdmin' && <th className="p-2" rowSpan={2}>Actions</th>}
                </tr>
                <tr className="bg-slate-50/50">
                    {subjects.map((_, i) => (
                        <React.Fragment key={i}>
                            <th className="p-1 border-r border-slate-200 text-[8px]">FA</th>
                            <th className="p-1 border-r border-slate-200 text-[8px]">SA</th>
                            <th className="p-1 border-r border-slate-200 text-[8px]">10%</th>
                            <th className="p-1 border-r border-slate-200 text-[8px]">TL</th>
                            <th className="p-1 border-r border-indigo-100 text-[8px] text-indigo-600 font-black">ST</th>
                        </React.Fragment>
                    ))}
                </tr>
            </thead>
            <tbody>
                {results.map((res, index) => (
                    <StudentResultRow key={index} index={index} result={res} subjects={subjects} onEdit={onEdit} onDelete={onDelete} role={role} />
                ))}
            </tbody>
        </table>
    </div>
);

const VerticalStudentReport = ({ result, subjects }) => (
    <div className="mb-4 border border-slate-400 p-4 bg-white relative print:break-inside-avoid">
        <div className="flex justify-between items-end border-b border-slate-400 pb-2 mb-3">
            <div>
                <h2 className="text-lg font-black text-slate-800 uppercase leading-none">{result.student?.studentName}</h2>
                <div className="flex gap-3 mt-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Reg No: <span className="text-slate-900">{result.student?.registerNo}</span></p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Class: <span className="text-slate-900">{result.className}</span></p>
                </div>
            </div>
            <div className="text-right">
                {/* Total marks box removed */}
            </div>
        </div>

        <table className="w-full text-[10px] font-bold border-collapse border border-slate-300 mb-3">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-300 font-black uppercase text-[9px]">
                    <th className="text-left p-1.5 border-r border-slate-300 w-[30%]">Subject</th>
                    <th className="w-16 text-center p-1.5 border-r border-slate-300">FA</th>
                    <th className="w-16 text-center p-1.5 border-r border-slate-300">SA</th>
                    <th className="w-16 text-center p-1.5 border-r border-slate-300">10%</th>
                    <th className="w-16 text-center p-1.5 border-r border-slate-300">TL</th>
                    <th className="w-16 text-center p-1.5">STATUS</th>
                </tr>
            </thead>
            <tbody>
                {subjects.map((sub, i) => {
                    const mark = result.marks.find(m => m.subject?._id === sub._id) || {};
                    return (
                        <tr key={i} className="border-b border-slate-200">
                            <td className="p-1.5 border-r border-slate-200 uppercase truncate max-w-[120px]">{sub.subjectName}</td>
                            <td className="text-center p-1.5 border-r border-slate-200 font-normal">{mark.fa || "-"}</td>
                            <td className="text-center p-1.5 border-r border-slate-200 font-normal">{mark.sa || "-"}</td>
                            <td className="text-center p-1.5 border-r border-slate-200 font-normal">{mark.tenPercent || "-"}</td>
                            <td className="text-center p-1.5 border-r border-slate-200 font-normal">{mark.tl || "-"}</td>
                            <td className={`text-center p-1.5 font-black ${mark.status?.toString().toUpperCase() === 'FAILED' ? 'text-red-700' : 'text-slate-700'}`}>{mark.status || "-"}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

        {/* Consolidated Summary as Table */}
        <div className="w-full">
            <table className="w-full border border-slate-600 text-[9px] font-black uppercase text-center">
                <thead className="bg-slate-50 border-b border-slate-600">
                    <tr>
                        <th className="p-1 border-r border-slate-600">Total Failed</th>
                        <th className="p-1 border-r border-slate-600">Final Status</th>
                        <th className="p-1 border-r border-slate-600">Percentage</th>
                        <th className="p-1">Grand Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-1.5 border-r border-slate-600 text-xs">{result.noOfFailed}</td>
                        <td className={`p-1.5 border-r border-slate-600 text-xs ${result.semStatus?.toString().toUpperCase() === 'FAILED' ? 'text-red-700' : 'text-slate-800'}`}>{result.semStatus}</td>
                        <td className="p-1.5 border-r border-slate-600 text-xs">{(Number(result.percentage) / 100).toFixed(2)}%</td>
                        <td className="p-1.5 text-base bg-slate-50">{result.gTotal}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const BulkResultsReport = React.forwardRef(({ results, subjects, examName }, ref) => (
    <div ref={ref} className="p-6 bg-white max-w-4xl mx-auto">
        <div className="mb-10 text-center border-b-4 border-double border-slate-800 pb-8 print:block hidden">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-1">Official Result Statement</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">MAHDIYYA PORTAL EXAMINATION BOARD</p>
            <div className="mt-2 text-indigo-700 font-black uppercase text-xs tracking-widest">{examName}</div>
            <div className="flex justify-center gap-6 mt-4 text-[10px] font-black text-slate-500 uppercase">
                <span>Academic Session: {new Date().getFullYear()}</span>
                <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
        </div>

        {results.map((res, index) => (
            <VerticalStudentReport key={index} result={res} subjects={subjects} />
        ))}
    </div>
));

function BulkResultView() {
    const [exams, setExams] = useState([]);
    const { classes, getClasses } = useContext(ClassContext);
    const { authData } = useContext(UserAuthContext);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        classId: "",
        examId: "",
    });
    const [editModal, setEditModal] = useState({ isOpen: false, result: null });

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    useEffect(() => {
        getClasses && getClasses();
        const fetchData = async () => {
            try {
                const { data } = await Axios.get("/exam?isActive=true");
                setExams(data);
            } catch (error) {
                console.error("Failed to fetch filters:", error);
            }
        };
        fetchData();
    }, [getClasses]);

    const fetchResults = async (e) => {
        if (e) e.preventDefault();
        if (!filters.classId || !filters.examId) return;

        setLoading(true);
        try {
            const subRes = await Axios.get(`/subject?class=${filters.classId}`);
            setSubjects(subRes.data || []);

            const scId = authData.role === "admin" ? authData.branch?._id : "";
            const { data } = await Axios.get(
                `/result/bulk-results?classId=${filters.classId}&examId=${filters.examId}${scId ? `&studyCentreId=${scId}` : ""}`
            );
            setResults(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("Are you sure you want to delete ALL results for this class and exam? This action cannot be undone.")) return;
        try {
            await Axios.delete(`/result/bulk-results/${filters.classId}/${filters.examId}`);
            toast.success("All results deleted successfully");
            setResults([]);
        } catch (error) {
            toast.error("Failed to delete results");
        }
    };

    const handleDeleteSingle = async (id) => {
        if (!window.confirm("Delete this student's result?")) return;
        try {
            await Axios.delete(`/result/bulk-results/${id}`);
            toast.success("Result deleted");
            setResults(results.filter(r => r._id !== id));
        } catch (error) {
            toast.error("Failed to delete result");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await Axios.patch(`/result/bulk-results/${editModal.result._id}`, editModal.result);
            toast.success("Result updated successfully");
            setEditModal({ isOpen: false, result: null });
            fetchResults();
        } catch (error) {
            toast.error("Failed to update result");
        }
    };

    const handleExportExcel = async () => {
        try {
            const scId = authData.role === "admin" ? authData.branch?._id : "";
            const response = await Axios.get(
                `/result/bulk-export?classId=${filters.classId}&examId=${filters.examId}${scId ? `&studyCentreId=${scId}` : ""}`,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            const cls = classes.find(c => c._id === filters.classId)?.className || "results";
            link.setAttribute("download", `Results_${cls}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to export Excel");
        }
    };

    return (
        <main className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-2xl mx-auto">
                <PageHeader
                    title="Bulk Exam Results"
                    subtitle="View and download aggregated results for each class."
                />

                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8">
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={fetchResults}>
                        <StyledSelect
                            value={filters.classId}
                            onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                            options={classes.map((c) => ({ value: c._id, label: c.className }))}
                            placeholder="-- Select Class --"
                            required
                        />
                        <StyledSelect
                            value={filters.examId}
                            onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
                            options={exams.map((e) => ({ value: e._id, label: e.examName }))}
                            placeholder="-- Select Exam --"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2.5 transition md:col-span-2"
                        >
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            View Results
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 text-slate-300">
                        <FontAwesomeIcon icon={faSpinner} spin size="4x" className="mb-6" />
                        <p className="text-2xl font-black uppercase tracking-widest">Processing...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="bg-white border-b-8 border-indigo-600 rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex gap-4">
                                {authData.role === "superAdmin" && (
                                    <>
                                        <button
                                            onClick={handleDeleteAll}
                                            className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-5 py-2 rounded-2xl text-xs font-black uppercase transition flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Delete All
                                        </button>
                                        <button
                                            onClick={handleExportExcel}
                                            className="bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 px-5 py-2 rounded-2xl text-xs font-black uppercase transition flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faTableList} />
                                            Export Excel
                                        </button>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition shadow-xl shadow-indigo-100"
                            >
                                <FontAwesomeIcon icon={faFilePdf} />
                                Generate PDF report
                            </button>
                        </div>

                        <div className="p-4 overflow-auto">
                            <BulkResultsTable
                                results={results}
                                subjects={subjects}
                                onEdit={(res) => setEditModal({ isOpen: true, result: res })}
                                onDelete={handleDeleteSingle}
                                role={authData.role}
                            />
                        </div>

                        <div className="hidden">
                            <BulkResultsReport
                                ref={componentRef}
                                results={results}
                                subjects={subjects}
                                examName={exams.find(e => e._id === filters.examId)?.examName}
                            />
                        </div>
                    </div>
                ) : filters.classId && filters.examId ? (
                    <div className="text-center p-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <FontAwesomeIcon icon={faTableList} className="text-5xl text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No Results Found</h3>
                        <p className="text-slate-500">Try adjusting your filters or upload results for this class.</p>
                    </div>
                ) : null}

                {/* Edit Modal */}
                {editModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-indigo-50/30">
                                <h3 className="text-xl font-bold text-slate-800">Edit Marks: {editModal.result?.student?.studentName}</h3>
                                <button onClick={() => setEditModal({ isOpen: false, result: null })} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
                            </div>
                            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {subjects.map((sub, i) => {
                                        const markIndex = editModal.result.marks.findIndex(m => m.subject?._id === sub._id);
                                        const mark = editModal.result.marks[markIndex] || { fa: "", sa: "", tenPercent: "", tl: "", status: "" };

                                        const updateMark = (field, val) => {
                                            const newMarks = [...editModal.result.marks];
                                            if (markIndex === -1) {
                                                newMarks.push({ subject: sub._id, [field]: val });
                                            } else {
                                                newMarks[markIndex][field] = val;
                                            }
                                            setEditModal({ ...editModal, result: { ...editModal.result, marks: newMarks } });
                                        };

                                        return (
                                            <div key={i} className="p-4 border border-slate-200 rounded-2xl shadow-sm">
                                                <h4 className="font-bold text-indigo-700 mb-3 truncate border-b border-indigo-50 pb-2">{sub.subjectName}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">FA</label>
                                                        <input type="text" className="w-full border rounded p-1.5 text-sm" value={mark.fa} onChange={e => updateMark('fa', e.target.value)} />
                                                    </div>
                                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">SA</label>
                                                        <input type="text" className="w-full border rounded p-1.5 text-sm" value={mark.sa} onChange={e => updateMark('sa', e.target.value)} />
                                                    </div>
                                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">10%</label>
                                                        <input type="text" className="w-full border rounded p-1.5 text-sm" value={mark.tenPercent} onChange={e => updateMark('tenPercent', e.target.value)} />
                                                    </div>
                                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">TL</label>
                                                        <input type="text" className="w-full border rounded p-1.5 text-sm" value={mark.tl} onChange={e => updateMark('tl', e.target.value)} />
                                                    </div>
                                                    <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">Status (P/F)</label>
                                                        <input type="text" className="w-full border rounded p-1.5 text-sm font-bold" value={mark.status} onChange={e => updateMark('status', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div><label className="text-xs font-bold text-indigo-400 uppercase">G.Total</label>
                                        <input type="text" className="w-full border rounded p-2 font-bold" value={editModal.result.gTotal} onChange={e => setEditModal({ ...editModal, result: { ...editModal.result, gTotal: e.target.value } })} />
                                    </div>
                                    <div><label className="text-xs font-bold text-indigo-400 uppercase">Percentage</label>
                                        <input type="text" className="w-full border rounded p-2 font-bold" value={editModal.result.percentage} onChange={e => setEditModal({ ...editModal, result: { ...editModal.result, percentage: e.target.value } })} />
                                    </div>
                                    <div><label className="text-xs font-bold text-indigo-400 uppercase">Sem Status</label>
                                        <input type="text" className="w-full border rounded p-2 font-bold" value={editModal.result.semStatus} onChange={e => setEditModal({ ...editModal, result: { ...editModal.result, semStatus: e.target.value } })} />
                                    </div>
                                    <div><label className="text-xs font-bold text-indigo-400 uppercase">Failed Count</label>
                                        <input type="text" className="w-full border rounded p-2 font-bold" value={editModal.result.noOfFailed} onChange={e => setEditModal({ ...editModal, result: { ...editModal.result, noOfFailed: e.target.value } })} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setEditModal({ isOpen: false, result: null })} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                                    <button type="submit" className="px-8 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg shadow-indigo-100">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default BulkResultView;
