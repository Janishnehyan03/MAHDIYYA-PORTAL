import {
  DocumentArrowDownIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Axios from "../../../Axios";
import { ClassContext } from "../../../context/classContext";
import { ExamContext } from "../../../context/examContext";
import { UserAuthContext } from "../../../context/userContext";

// --- Helper & State Components ---

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center text-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="mt-4 text-lg text-gray-600">Fetching Results...</p>
  </div>
);

const InitialState = () => (
  <div className="text-center py-20">
    <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-xl font-semibold text-gray-800">
      View FA Results
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      Please select filters above and click "Fetch Results" to begin.
    </p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20">
    <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-xl font-semibold text-gray-800">
      No Results Found
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      There are no results matching your selected criteria.
    </p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-center rounded-md">
    <div className="flex justify-center">
      <ExclamationTriangleIcon
        className="h-6 w-6 text-red-400"
        aria-hidden="true"
      />
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

// --- Main UI Components ---

function FilterPanel({
  classes,
  branches,
  exams,
  filters,
  setFilters,
  onSearch,
  authData,
}) {
  const isSuperAdmin = authData.role === "superAdmin";
  const canSearch =
    filters.classId &&
    filters.examId &&
    (isSuperAdmin ? filters.studyCentreId : true);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Class Select */}
        <div>
          <label
            htmlFor="class"
            className="block text-sm font-medium text-gray-700"
          >
            Class
          </label>
          <select
            id="class"
            value={filters.classId || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, classId: e.target.value }))
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes &&
              classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.className}
                </option>
              ))}
          </select>
        </div>

        {/* Branch Select (SuperAdmin only) */}
        {isSuperAdmin && (
          <div>
            <label
              htmlFor="branch"
              className="block text-sm font-medium text-gray-700"
            >
              Study Centre
            </label>
            <select
              id="branch"
              value={filters.studyCentreId || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  studyCentreId: e.target.value,
                }))
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select a centre
              </option>
              {branches &&
                branches.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.studyCentreName}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Exam Select */}
        <div>
          <label
            htmlFor="exam"
            className="block text-sm font-medium text-gray-700"
          >
            Exam
          </label>
          <select
            id="exam"
            value={filters.examId || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, examId: e.target.value }))
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>
              Select an exam
            </option>
            {exams &&
              exams.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.examName}
                </option>
              ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="lg:col-start-4">
          <button
            onClick={onSearch}
            disabled={!canSearch}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Fetch Results
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsTable({ results, subjectNames, onDownload }) {
  // Define a failing threshold (e.g., less than 40%)
  const FAILING_THRESHOLD = 4; // Assuming max marks are 10

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="text-lg font-semibold text-gray-800">Results</h3>
        <button
          onClick={onDownload}
          disabled={results.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Download Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reg. No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              {Array.from(subjectNames).map((subjectName) => (
                <th
                  key={subjectName}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {subjectName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={result._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.student?.registerNo || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.student?.studentName || "N/A"}
                </td>
                {Array.from(subjectNames).map((subjectName) => {
                  const subjectResult = result.subjectResults.find(
                    (sr) => sr.subject.subjectName === subjectName
                  );
                  const mark = subjectResult ? subjectResult.cceMark : "-";
                  const isFailing =
                    typeof mark === "number" && mark < FAILING_THRESHOLD;
                  return (
                    <td
                      key={subjectName}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-center ${
                        isFailing ? "text-red-600 font-bold" : "text-gray-700"
                      }`}
                    >
                      {mark}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main View Component ---

function ResultView() {
  const { exams = [], getExams } = useContext(ExamContext);
  const { classes = [], getClasses } = useContext(ClassContext);
  const { authData = {} } = useContext(UserAuthContext);

  const [branches, setBranches] = useState([]);
  const [results, setResults] = useState([]);
  const [subjectNames, setSubjectNames] = useState(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    classId: "",
    examId: "",
    studyCentreId: "",
  });

  // Fetch initial dropdown data
  useEffect(() => {
    getClasses && getClasses();
    getExams && getExams(true);
    if (authData.role === "superAdmin") {
      const getBranches = async () => {
        try {
          const { data } = await Axios.get(
            `/study-centre?sort=studyCentreName`
          );
          setBranches(data.docs);
        } catch (error) {
          console.error("Failed to fetch branches:", error);
        }
      };
      getBranches();
    }
    // eslint-disable-next-line
  }, [authData.role]);

  const handleFetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setResults([]); // Clear previous results

    try {
      let studyCentre = "";
      if (authData.role === "superAdmin") {
        studyCentre = filters.studyCentreId;
      } else if (authData.branch && authData.branch._id) {
        studyCentre = authData.branch._id;
      }

      const { data } = await Axios.get(
        `/cce?examId=${filters.examId}&classId=${filters.classId}&studyCentreId=${studyCentre}`
      );

      setResults(data);

      // Derive subject names from the fetched results
      const newSubjectNames = new Set();
      data.forEach((result) => {
        if (Array.isArray(result.subjectResults)) {
          result.subjectResults.forEach((sr) => {
            if (sr.subject && sr.subject.subjectName) {
              newSubjectNames.add(sr.subject.subjectName);
            }
          });
        }
      });
      setSubjectNames(newSubjectNames);
    } catch (err) {
      setError(
        "Failed to fetch results. Please check your connection or try again."
      );
      console.error(err.response || err);
    } finally {
      setLoading(false);
    }
  }, [filters, authData]);

  const downloadExcel = () => {
    if (!results.length) return;

    const dataToExport = results.map((result) => {
      const row = {
        "Register No": result.student?.registerNo || "N/A",
        "Student Name": result.student?.studentName || "N/A",
      };
      subjectNames.forEach((subjectName) => {
        const subjectResult = result.subjectResults.find(
          (sr) => sr.subject.subjectName === subjectName
        );
        row[subjectName] = subjectResult ? subjectResult.cceMark : "-";
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    // Create a more robust filename
    const selectedClass = classes.find((c) => c._id === filters.classId);
    const className = selectedClass
      ? selectedClass.className.replace(/\s+/g, "_")
      : "Class";
    const selectedExam = exams.find((e) => e._id === filters.examId);
    const examName = selectedExam
      ? selectedExam.examName.replace(/\s+/g, "_")
      : "Exam";

    XLSX.writeFile(workbook, `FA_Results_${className}_${examName}.xlsx`);
  };

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Formative Assessment Results
          </h1>
          <p className="mt-1 text-md text-gray-600">
            Filter and view FA results for students.
          </p>
        </div>

        <FilterPanel
          classes={classes}
          branches={branches}
          exams={exams}
          filters={filters}
          setFilters={setFilters}
          onSearch={handleFetchResults}
          authData={authData}
        />

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : !hasSearched ? (
            <InitialState />
          ) : results.length === 0 ? (
            <EmptyState />
          ) : (
            <ResultsTable
              results={results}
              subjectNames={subjectNames}
              onDownload={downloadExcel}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default ResultView;