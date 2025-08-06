import { useContext, useEffect, useMemo, useState } from "react";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

// Modern buffer animation component
const LongFetchAnimation = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 border-solid"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

const DEFAULT_CLASSES = [
  "CMS FIRST YEAR",
  "CMS SECOND YEAR",
  "DEGREE FIRST YEAR",
  "DEGREE SECOND YEAR",
  "DEGREE FINAL YEAR",
];

const PreviousExamTable = () => {
  // --- State Management ---
  const [previousExams, setPreviousExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedExamData, setSelectedExamData] = useState(null);
  const [selectedSheetName, setSelectedSheetName] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { authData } = useContext(UserAuthContext);
  const [sheetFields, setSheetFields] = useState([]);

  // State for classes (now static)
  const [classes] = useState(DEFAULT_CLASSES);
  const [selectedClass, setSelectedClass] = useState(DEFAULT_CLASSES[0] || "");

  useEffect(() => {
    setLoading(true);
    if (
      selectedExamData &&
      Array.isArray(selectedExamData) &&
      selectedExamData.length > 6
    ) {
      setSheetFields(selectedExamData[6]);
    } else {
      setSheetFields([]);
    }
    setLoading(false);
  }, [selectedExamData]);

  useEffect(() => {
    const fetchPreviousExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Axios.get("/previous-exam");
        setPreviousExams(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch exam list.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreviousExams();
  }, []);

  // Fetch exam details when exam is selected, default class to first
  const fetchExamDetails = async (examId) => {
    if (selectedExamId === examId) {
      setSelectedExamId(null);
      setSelectedExamData(null);
      setSelectedSheetName(null);
      return;
    }

    setIsDetailsLoading(true);
    setSelectedExamId(examId);
    setSelectedExamData(null);
    setSelectedSheetName(null);

    const defaultClass = classes[0] || "";

    try {
      if (defaultClass) {
        const response = await Axios.get(`/previous-exam/${examId}`, {
          params: { sheetName: defaultClass },
        });
        const { googleSheetData } = response.data || {};
        if (googleSheetData && Array.isArray(googleSheetData[defaultClass])) {
          setSelectedExamData(googleSheetData[defaultClass]);
          setSelectedSheetName(defaultClass);
          setSelectedClass(defaultClass);
        } else {
          setSelectedExamData([]);
          setSelectedSheetName(defaultClass);
          setSelectedClass(defaultClass);
        }
      } else {
        setSelectedExamData([]);
        setSelectedSheetName("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch exam details.");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // When class (sheetName) is changed for the selected exam, refetch that sheet for the selected exam
  useEffect(() => {
    const fetchSheetForExam = async () => {
      if (!selectedExamId || !selectedClass) return;
      setIsDetailsLoading(true);
      setSelectedExamData(null);
      setSelectedSheetName(selectedClass);
      try {
        const response = await Axios.get(`/previous-exam/${selectedExamId}`, {
          params: { sheetName: selectedClass },
        });
        const { googleSheetData } = response.data || {};
        if (googleSheetData && Array.isArray(googleSheetData[selectedClass])) {
          setSelectedExamData(googleSheetData[selectedClass]);
          setSelectedSheetName(selectedClass);
        } else {
          setSelectedExamData([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch results.");
      } finally {
        setIsDetailsLoading(false);
      }
    };
    if (selectedExamId && selectedClass) {
      fetchSheetForExam();
    }
    // eslint-disable-next-line
  }, [selectedClass, selectedExamId]);

  const handleChangeClass = (className) => {
    setSelectedClass(className);
    // triggers useEffect above
  };

  const filteredExamResults = useMemo(() => {
    if (!selectedExamData || !authData?.branch?.studyCentreCode) return null;
    const centreCode = authData.branch.studyCentreCode;
    return selectedExamData.filter(
      (row) =>
        Array.isArray(row) &&
        row.some(
          (cell) => typeof cell === "string" && cell.includes(centreCode)
        )
    );
  }, [selectedExamData, authData]);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LongFetchAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-red-700 bg-red-100 rounded-lg shadow-sm">
        <i className="fas fa-exclamation-triangle fa-2x mb-4 animate-bounce"></i>
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (previousExams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <i className="fas fa-inbox fa-3x mb-4"></i>
        <h3 className="text-xl font-semibold">No Previous Exams Found</h3>
        <p className="mt-1 text-sm">Published exam results will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <i className="fas fa-history text-blue-500 text-2xl mr-3"></i>
        <h1 className="text-3xl font-bold text-gray-800">
          Previous Exam Results
        </h1>
      </div>

      {/* Exam Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {previousExams.map((exam) => (
          <div
            key={exam._id}
            onClick={() => fetchExamDetails(exam._id)}
            className={`p-5 bg-white rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
              selectedExamId === exam._id
                ? "border-blue-500 shadow-lg"
                : "border-gray-200 hover:border-blue-400 hover:shadow-md"
            }`}
          >
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
              {exam.className}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {exam.admission.admissionName}
            </p>
            <button className="text-sm font-medium text-blue-600 mt-4 animate-pulse">
              {selectedExamId === exam._id ? "Hide Details" : "View Details"}
            </button>
          </div>
        ))}
      </div>

      {/* Details Section */}
      {(isDetailsLoading || selectedExamData) && selectedExamId && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg relative">
          {isDetailsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <LongFetchAnimation />
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Exam Details</h2>
            <button
              onClick={() => {
                setSelectedExamId(null);
                setSelectedExamData(null);
                setSelectedSheetName(null);
                setSelectedClass(classes[0] || "");
              }}
              className="text-gray-500 hover:text-red-600 transition"
              title="Close"
            >
              <i className="fas fa-times fa-lg"></i>
            </button>
          </div>

          {/* Class (sheet) Selection Dropdown */}
          {classes.length > 1 && (
            <div className="mb-5">
              <label className="mr-2 font-semibold">Class:</label>
              <select
                className="p-2 border rounded"
                value={selectedClass}
                onChange={(e) => handleChangeClass(e.target.value)}
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filteredExamResults && (
            <div className="overflow-x-auto border border-gray-300 rounded-xl shadow-sm">
              <table className="min-w-full border border-gray-300 rounded-lg bg-white">
                <thead>
                  {/* Subject Names Row (from 6th row of selectedExamData) */}
                  {selectedExamData && Array.isArray(selectedExamData[5]) && (
                    <tr>
                      {sheetFields.map((_, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="border border-gray-300 px-6 py-2 text-left text-xs font-semibold text-blue-700 bg-blue-50 tracking-wider"
                          style={{ fontWeight: 600 }}
                        >
                          {selectedExamData[5][index] ?? ""}
                        </th>
                      ))}
                    </tr>
                  )}
                  <tr>
                    {sheetFields.map((header, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="border border-gray-300 px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-100"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredExamResults.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {sheetFields.map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-200 px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {row[cellIndex] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredExamResults.length <= 1 && (
                    <tr>
                      <td
                        colSpan={sheetFields.length}
                        className="border border-gray-300 text-center py-8 text-gray-500 bg-gray-50"
                      >
                        No results found for your study centre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviousExamTable;
