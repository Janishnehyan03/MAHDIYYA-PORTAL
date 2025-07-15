import { faFileExcel, faSearch, faSpinner, faTableList, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import Axios from "../../../Axios";
import { ClassContext } from "../../../context/classContext";
import { UserAuthContext } from "../../../context/userContext";

// --- Reusable UI Components for a Cleaner Structure ---

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
    <option value="" disabled>{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const FilterBar = ({ filters, setFilters, classes, branches, exams, authData }) => (
  <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StyledSelect
        value={filters.classId}
        onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
        options={classes.map(c => ({ value: c._id, label: c.className }))}
        placeholder="-- Select Class --"
      />
      {authData.role === "superAdmin" && (
        <StyledSelect
          value={filters.studyCentreId}
          onChange={(e) => setFilters({ ...filters, studyCentreId: e.target.value })}
          options={branches.map(b => ({ value: b._id, label: b.studyCentreName }))}
          placeholder="-- Select Study Centre --"
        />
      )}
      <StyledSelect
        value={filters.examId}
        onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
        options={exams.map(e => ({ value: e._id, label: e.examName }))}
        placeholder="-- Select Exam --"
      />
    </div>
  </div>
);

const EmptyState = ({ icon, title, message }) => (
  <div className="text-center p-10 bg-slate-100/70 rounded-2xl">
    <FontAwesomeIcon icon={icon} className="text-4xl text-slate-400 mb-4" />
    <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
    <p className="text-slate-500 mt-1">{message}</p>
  </div>
);

const ResultsTable = ({ results, subjectNames }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
            <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                    <th className="p-3 text-left font-semibold text-slate-600 border-b-2 border-slate-200" rowSpan="2">#</th>
                    <th className="p-3 text-left font-semibold text-slate-600 border-b-2 border-slate-200" rowSpan="2">Register No</th>
                    <th className="p-3 text-left font-semibold text-slate-600 border-b-2 border-slate-200" rowSpan="2">Student Name</th>
                    {Array.from(subjectNames).map((subjectName) => (
                        <th key={subjectName} className="p-3 text-center font-semibold text-slate-600 border-b-2 border-slate-200" colSpan="3">{subjectName}</th>
                    ))}
                </tr>
                <tr>
                    {Array.from(subjectNames).flatMap((subjectName) => [
                        <th key={`${subjectName}-fa`} className="p-2 text-center font-medium text-slate-500 text-xs border-b-2 border-slate-200">FA</th>,
                        <th key={`${subjectName}-sa`} className="p-2 text-center font-medium text-slate-500 text-xs border-b-2 border-slate-200">SA</th>,
                        <th key={`${subjectName}-total`} className="p-2 text-center font-bold text-slate-600 text-xs border-b-2 border-slate-200">Total</th>,
                    ])}
                </tr>
            </thead>
            <tbody className="bg-white">
                {results.map((result, index) => <ResultTableRow key={result?._id || index} result={result} index={index} subjectNames={subjectNames} />)}
            </tbody>
        </table>
    </div>
);

const ResultTableRow = ({ result, index, subjectNames }) => {
    // Determine row background color for striped effect
    const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

    return (
        <tr className={rowClass}>
            <td className="p-3 text-slate-500">{index + 1}</td>
            <td className="p-3 font-mono text-slate-600">{result.student?.registerNo || "N/A"}</td>
            <td className="p-3 font-semibold text-slate-800">{result.student?.studentName || "N/A"}</td>
            {Array.from(subjectNames).flatMap((subjectName) => {
                const examResult = result.subjectResults.find(sr => sr.subject.subjectName === subjectName && sr.type === "exam");
                const cceResult = result.subjectResults.find(sr => sr.subject.subjectName === subjectName && sr.type === "cce");

                const cceMarks = cceResult?.marksObtained ?? "-";
                const saMarks = examResult?.marksObtained ?? "-";
                const totalMarks = (cceResult?.marksObtained ?? 0) + (examResult?.marksObtained ?? 0);
                const hasMarks = cceResult || examResult;

                return [
                    <td key={`${subjectName}-cce`} className="p-3 text-center text-slate-600">{cceMarks}</td>,
                    <td key={`${subjectName}-sa`} className="p-3 text-center text-slate-600">{saMarks}</td>,
                    <td key={`${subjectName}-total`} className="p-3 text-center font-bold text-indigo-600">{hasMarks ? totalMarks : "-"}</td>
                ];
            })}
        </tr>
    );
};


// --- The Main Component ---

function ResultView() {
  const [exams, setExams] = useState([]);
  const { classes, getClasses } = useContext(ClassContext);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { authData } = useContext(UserAuthContext);

  const [filters, setFilters] = useState({
    classId: null,
    examId: null,
    studyCentreId: null,
  });

  const areFiltersSet = filters.classId && filters.examId && (authData.role !== 'superAdmin' || filters.studyCentreId);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
        getClasses();
        try {
            const [examsRes, branchesRes] = await Promise.all([
                Axios.get('/exam?isActive=true'),
                authData.role === 'superAdmin' ? Axios.get('/study-centre?sort=studyCentreName') : Promise.resolve({ data: { docs: [] } })
            ]);
            setExams(examsRes.data);
            setBranches(branchesRes.data.docs);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        }
    };
    fetchInitialData();
  }, [getClasses, authData.role]);


  const getResults = useCallback(async () => {
    if (!areFiltersSet) return;
    setLoading(true);
    setResults([]); // Clear previous results
    try {
        const studyCentreParam = authData.role === "superAdmin" ? `&studyCentreId=${filters.studyCentreId}` : `&studyCentreId=${authData.branch._id}`;
        const { data } = await Axios.get(`/result?examId=${filters.examId}&classId=${filters.classId}${studyCentreParam}`);
        setResults(data);
    } catch (error) {
        console.error("Failed to fetch results:", error.response);
        setResults([]);
    } finally {
        setLoading(false);
    }
  }, [filters, areFiltersSet, authData]);

  // Trigger fetch when filters are ready
  useEffect(() => {
    getResults();
  }, [getResults]);


  // --- Memoized Derived State for Performance ---
  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    return results.filter(
      (result) =>
        result.student?.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.registerNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const subjectNames = useMemo(() => {
    const names = new Set();
    results.forEach(r => r.subjectResults.forEach(sr => names.add(sr.subject.subjectName)));
    return names;
  }, [results]);


  // --- Excel Download Handler ---
  const downloadExcel = () => {
    const selectedClass = classes.find(c => c._id === filters.classId);
    const selectedExam = exams.find(e => e._id === filters.examId);
    const fileName = `${selectedClass?.className}_${selectedExam?.examName}.xlsx`;
    
    const worksheetData = filteredResults.map((result, index) => {
      const row = {
        '#': index + 1,
        'Register No': result.student?.registerNo || 'N/A',
        'Student Name': result.student?.studentName || 'N/A',
        'Study Centre': result.student?.branch?.studyCentreCode || 'N/A',
      };
      subjectNames.forEach(subjectName => {
        const examResult = result.subjectResults.find(sr => sr.subject.subjectName === subjectName && sr.type === "exam");
        const cceResult = result.subjectResults.find(sr => sr.subject.subjectName === subjectName && sr.type === "cce");
        const totalMarks = (cceResult?.marksObtained ?? 0) + (examResult?.marksObtained ?? 0);
        
        row[`${subjectName} FA`] = cceResult?.marksObtained ?? '-';
        row[`${subjectName} SA`] = examResult?.marksObtained ?? '-';
        row[`${subjectName} Total`] = (examResult || cceResult) ? totalMarks : '-';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, fileName);
  };


  return (
    <main className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <PageHeader title="View Exam Results" subtitle="Filter by class, exam, and study centre to view and download student results." />
        
        <FilterBar {...{ filters, setFilters, classes, branches, exams, authData }} />

        <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {areFiltersSet ? (
                <>
                    {/* --- Toolbar: Search and Download --- */}
                    <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200">
                        <div className="relative w-full md:w-80">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or reg no..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <button
                            onClick={downloadExcel}
                            disabled={filteredResults.length === 0 || loading}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm transition hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faFileExcel} />
                            <span>Download Excel</span>
                        </button>
                    </div>

                    {/* --- Content Area: Loading, No Results, or Table --- */}
                    <div className="p-4">
                        {loading ? (
                            <div className="h-64 flex flex-col justify-center items-center text-slate-500">
                                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-indigo-500"/>
                                <p className="mt-3 font-medium">Fetching results...</p>
                            </div>
                        ) : filteredResults.length > 0 ? (
                            <>
                                <p className="text-sm text-slate-600 mb-4 px-2">
                                    Showing <span className="font-bold">{filteredResults.length}</span> results.
                                </p>
                                <ResultsTable results={filteredResults} subjectNames={subjectNames} />
                            </>
                        ) : (
                            <EmptyState icon={faTableList} title="No Results Found" message="There are no results matching your search term or filter criteria." />
                        )}
                    </div>
                </>
            ) : (
                <div className="p-8">
                    <EmptyState icon={faWandMagicSparkles} title="Let's Find Some Results" message="Please select a class, exam, and study centre from the filters above to get started." />
                </div>
            )}
        </div>
      </div>
    </main>
  );
}

export default ResultView;