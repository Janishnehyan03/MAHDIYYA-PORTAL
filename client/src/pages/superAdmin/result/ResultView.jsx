import {
  faFileExcel,
  faSearch,
  faSpinner,
  faTableList,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import Axios from "../../../Axios";
import { ClassContext } from "../../../context/classContext";
import { UserAuthContext } from "../../../context/userContext";

// --- Reusable UI Components for a Cleaner Structure ---

const PageHeader = ({ title, subtitle }) => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
      {title}
    </h1>
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

const FilterBar = ({
  filters,
  setFilters,
  classes,
  branches,
  exams,
  authData,
  onFetch,
}) => (
  <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <form
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onFetch();
      }}
    >
      <StyledSelect
        value={filters.classId}
        onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
        options={classes.map((c) => ({ value: c._id, label: c.className }))}
        placeholder="-- Select Class --"
        required
      />
      {authData.role === "superAdmin" && (
        <StyledSelect
          value={filters.studyCentreId}
          onChange={(e) =>
            setFilters({ ...filters, studyCentreId: e.target.value })
          }
          options={branches.map((b) => ({
            value: b._id,
            label: b.studyCentreName,
          }))}
          placeholder="-- Select Study Centre --"
          // required
        />
      )}
      <StyledSelect
        value={filters.examId}
        onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
        options={exams.map((e) => ({ value: e._id, label: e.examName }))}
        placeholder="-- Select Exam --"
        required
      />
      <button
        type="submit"
        className="md:col-span-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2.5 mt-2 md:mt-0"
      >
        <FontAwesomeIcon icon={faSearch} className="mr-2" /> Fetch Results
      </button>
    </form>
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
          <th
            className="p-3 text-left font-semibold text-slate-600 border-b-2 border-slate-200"
            rowSpan="2"
          >
            #
          </th>
          <th
            className="p-3 text-left font-semibold text-slate-600 border-b-2 border-slate-200"
            rowSpan="2"
          >
            Register No
          </th>
          <th
            className="p-3 text-left font-semibold text-slate-600 border-b-2 border-slate-200"
            rowSpan="2"
          >
            Student Name
          </th>
          {Array.from(subjectNames.entries()).map(([code, name]) => (
            <th
              key={code}
              className="p-3 text-center font-semibold text-slate-600 border-b-2 border-slate-200"
              colSpan="3"
            >
              <div className="text-sm">{name}</div>
              <div className="text-xs text-slate-400">{code}</div>
            </th>
          ))}
        </tr>
        <tr>
          {Array.from(subjectNames.entries()).flatMap(([code]) => [
            <th
              key={`${code}-fa`}
              className="p-2 text-center font-medium text-slate-500 text-xs border-b-2 border-slate-200"
            >
              FA
            </th>,
            <th
              key={`${code}-sa`}
              className="p-2 text-center font-medium text-slate-500 text-xs border-b-2 border-slate-200"
            >
              SA
            </th>,
            <th
              key={`${code}-total`}
              className="p-2 text-center font-bold text-slate-600 text-xs border-b-2 border-slate-200"
            >
              Total
            </th>,
          ])}
        </tr>
      </thead>
      <tbody className="bg-white">
        {results.map((result, index) => (
          <ResultTableRow
            key={result?._id || index}
            result={result}
            index={index}
            subjectNames={subjectNames}
          />
        ))}
      </tbody>
    </table>
  </div>
);

function ResultTableRow({ result, subjectNames, index }) {
  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="p-3 border-t border-slate-200">{index + 1}</td>
      <td className="p-3 border-t border-slate-200">
        {result.student?.registerNo ?? "-"}
      </td>
      <td className="p-3 border-t border-slate-200 font-medium text-slate-700">
        {result.student?.studentName ?? result.student?.name ?? "-"}
      </td>

      {Array.from(subjectNames.keys()).flatMap((code) => {
        const examResult = result.subjectResults?.find(
          (sr) => sr.subject?.subjectCode === code && sr.type === "exam"
        );
        const cceResult = result.subjectResults?.find(
          (sr) => sr.subject?.subjectCode === code && sr.type === "cce"
        );

        const cceMarks = cceResult?.marksObtained;
        const saMarks = examResult?.marksObtained;

        let totalMarks;
        if (cceMarks === "A" && saMarks === "A") {
          totalMarks = "A";
        } else if (cceMarks === "A") {
          totalMarks = saMarks ?? "-";
        } else if (saMarks === "A") {
          totalMarks = cceMarks ?? "-";
        } else if (cceMarks == null && saMarks == null) {
          totalMarks = "-";
        } else {
          totalMarks = (Number(cceMarks) || 0) + (Number(saMarks) || 0);
        }

        return [
          <td
            key={`${result?._id || index}-${code}-fa`}
            className="p-3 text-center border-t border-slate-200"
          >
            {cceMarks ?? "-"}
          </td>,
          <td
            key={`${result?._id || index}-${code}-sa`}
            className="p-3 text-center border-t border-slate-200"
          >
            {saMarks ?? "-"}
          </td>,
          <td
            key={`${result?._id || index}-${code}-total`}
            className="p-3 text-center border-t border-slate-200 font-semibold text-slate-700"
          >
            {totalMarks}
          </td>,
        ];
      })}
    </tr>
  );
}

// --- The Main Component ---

function ResultView() {
  const [exams, setExams] = useState([]);
  const { classes, getClasses } = useContext(ClassContext);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { authData } = useContext(UserAuthContext);
  const [subjects, setSubjects] = useState([]);

  const [filters, setFilters] = useState({
    classId: "",
    examId: "",
    studyCentreId: "",
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!filters.classId) return;
      try {
        const { data } = await Axios.get(`/subject?class=${filters.classId}`);
        console.log("Fetched subjects:", data);
        setSubjects(data); // assuming `data` is an array of subject objects
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [filters.classId]);
  const areFiltersSet = filters.classId && filters.examId;
  // &&
  // (authData.role !== "superAdmin" || filters.studyCentreId);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      getClasses();
      try {
        const [examsRes, branchesRes] = await Promise.all([
          Axios.get("/exam?isActive=true"),
          authData.role === "superAdmin"
            ? Axios.get("/study-centre?sort=studyCentreName")
            : Promise.resolve({ data: { docs: [] } }),
        ]);
        setExams(examsRes.data);
        setBranches(branchesRes.data.docs);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line
  }, [authData.role]);

  // --- Only fetch results on filter submit ---
  const getResults = useCallback(async () => {
    if (!areFiltersSet) return;
    setLoading(true);
    setResults([]);
    try {
      const studyCentreParam =
        authData.role === "superAdmin"
          ? `&studyCentreId=${filters.studyCentreId}`
          : `&studyCentreId=${authData.branch._id}`;
      const { data } = await Axios.get(
        `/result?examId=${filters.examId}&classId=${filters.classId}${studyCentreParam}`
      );
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error.response || error);
      setResults([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [filters, areFiltersSet, authData]);

  // --- Memoized Derived State for Performance ---
  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    return results.filter(
      (result) =>
        (result.student?.studentName || result.student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (result.student?.registerNo || result.student?.admNo || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const subjectNames = useMemo(() => {
    const subjectsMap = new Map();

    // Get all subjects for the selected class first
    const validSubjectCodes = subjects.map((s) => s.subjectCode);

    results.forEach((r) => {
      (r.subjectResults || []).forEach((sr) => {
        const code = sr.subject?.subjectCode;
        const name = sr.subject?.subjectName;
        if (code && validSubjectCodes.includes(code)) {
          subjectsMap.set(code, name);
        }
      });
    });

    // If results are empty, just use the class subjects directly
    if (subjectsMap.size === 0 && subjects.length > 0) {
      subjects.forEach((s) => subjectsMap.set(s.subjectCode, s.subjectName));
    }

    return subjectsMap;
  }, [results, subjects]);

  // --- Excel Download Handler ---
  const downloadExcel = () => {
    if (!results.length) {
      toast.error("No results to export");
      return;
    }

    const data = results.map((result) => {
      const row = {
        "#": results.indexOf(result) + 1,
        "Adm No": result.student?.admNo || result.student?.registerNo || "-",
        "Student Name":
          result.student?.studentName || result.student?.name || "-",
        "Study Centre": result.student?.branch?.studyCentreName || "-",
        "Study Centre Code": result.student?.branch?.studyCentreCode || "-",
      };

      subjectNames.forEach((name, code) => {
        const examResult = (result.subjectResults || []).find(
          (sr) => sr.subject?.subjectCode === code && sr.type === "exam"
        );
        const cceResult = (result.subjectResults || []).find(
          (sr) => sr.subject?.subjectCode === code && sr.type === "cce"
        );

        const cceMarks = cceResult?.marksObtained;
        const saMarks = examResult?.marksObtained;

        let totalMarks;
        if (cceMarks === "A" && saMarks === "A") {
          totalMarks = "A";
        } else if (cceMarks === "A") {
          totalMarks = saMarks ?? "-";
        } else if (saMarks === "A") {
          totalMarks = cceMarks ?? "-";
        } else if (cceMarks == null && saMarks == null) {
          totalMarks = "-";
        } else {
          totalMarks = (Number(cceMarks) || 0) + (Number(saMarks) || 0);
        }

        row[`${name} FA`] = cceMarks ?? "-";
        row[`${name} SA`] = saMarks ?? "-";
        row[`${name} Total`] = examResult || cceResult ? totalMarks : "-";
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "Exam_Results.xlsx");
    toast.success("Results exported successfully");
  };

  return (
    <main className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <PageHeader
          title="View Exam Results"
          subtitle="Filter by class, exam, and study centre to view and download student results."
        />

        <FilterBar
          filters={filters}
          setFilters={setFilters}
          classes={classes}
          branches={branches}
          exams={exams}
          authData={authData}
          onFetch={getResults}
        />

        <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {areFiltersSet ? (
            <>
              {/* --- Toolbar: Search and Download --- */}
              <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200">
                <div className="relative w-full md:w-80">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or reg no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      size="2x"
                      className="text-indigo-500"
                    />
                    <p className="mt-3 font-medium">Fetching results...</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <>
                    <p className="text-sm text-slate-600 mb-4 px-2">
                      Showing{" "}
                      <span className="font-bold">
                        {filteredResults.length}
                      </span>{" "}
                      results.
                    </p>
                    <ResultsTable
                      results={filteredResults}
                      subjectNames={subjectNames}
                    />
                  </>
                ) : (
                  <EmptyState
                    icon={faTableList}
                    title="No Results Found"
                    message="There are no results matching your search term or filter criteria."
                  />
                )}
              </div>
            </>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={faWandMagicSparkles}
                title="Let's Find Some Results"
                message="Please select a class, exam, and study centre from the filters above to get started."
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ResultView;
