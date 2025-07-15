import {
  faAdd,
  faChartSimple,
  faCheck,
  faChevronDown,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../../../Axios"; // Assuming path is correct

// --- Helper Components for a Cleaner & More Attractive UI ---

// Reusable component for the main page header
const PageHeader = ({ title, subtitle }) => (
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
      {title}
    </h1>
    <p className="mt-2 text-lg text-slate-500">{subtitle}</p>
  </div>
);

// Reusable component for the action cards (Check Results, Add Result)
const ActionCard = ({ to, icon, title, colorClass }) => (
  <Link to={to} className="group">
    <div className="w-full h-full p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 ${colorClass.bg} transition-colors duration-300 group-hover:bg-opacity-100`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={`text-2xl ${colorClass.text}`}
        />
      </div>
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-slate-500">Click to proceed</p>
    </div>
  </Link>
);

// A container to handle the chart's different states (loading, empty, showing data)
const ChartContainer = ({
  loading,
  hasData,
  children,
  onSelectExam,
  exams,
  selectedExam,
}) => (
  <div className="w-full max-w-4xl mx-auto mt-16 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <div className="flex flex-col  justify-between sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Exam Statistics</h2>
        <p className="text-slate-500">Pass/Fail rate by subject.</p>
      </div>
      {/* A much more attractive select dropdown */}
      <div className="relative">
        <select
          className="appearance-none w-full sm:w-64 bg-slate-50 border border-slate-300 text-slate-700 font-semibold py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onChange={onSelectExam}
          value={selectedExam || ""}
        >
          <option value="" disabled>
            Select an exam
          </option>
          {exams.map((item) => (
            <option key={item._id} value={item._id}>
              {item.examName}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>

    <div className="h-80 flex items-center justify-center">
      {loading ? (
        <div className="text-center text-slate-500">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="2x"
            className="mb-2 text-indigo-500"
          />
          <p>Loading Statistics...</p>
        </div>
      ) : hasData ? (
        children
      ) : (
        <div className="text-center text-slate-500">
          <FontAwesomeIcon
            icon={faChartSimple}
            size="3x"
            className="mb-4 text-slate-400"
          />
          <h3 className="font-semibold text-lg">No Data to Display</h3>
          <p>
            Please select an exam from the dropdown above to view its
            statistics.
          </p>
        </div>
      )}
    </div>
  </div>
);

function ResultHome() {
  const [statistics, setStatistics] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading feedback

  // Fetch exams on component mount
  useEffect(() => {
    const getExams = async () => {
      try {
        const { data } = await Axios.get(`/exam?isActive=true`);
        setExams(data);
      } catch (error) {
        console.log(error.response);
      }
    };
    getExams();
  }, []);

  // Fetch statistics when selectedExam changes
  const getStatistics = useCallback(async (examId) => {
    if (!examId) return;
    setLoading(true);
    try {
      const { data } = await Axios.get(`/result/statistics?examId=${examId}`);
      setStatistics(data);
    } catch (error) {
      console.log(error);
      setStatistics([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectExam = (e) => {
    const examId = e.target.value;
    setSelectedExam(examId);
    getStatistics(examId);
  };

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = React.useMemo(() => {
    const transformed = statistics.map((item) => ({
      label: item.subjectName,
      passed: item.passed,
      failed: item.failed,
    }));
    return {
      series: [
        {
          data: transformed.map((item) => item.passed),
          label: "Passed",
          id: "pvId",
          stack: "total",
          color: "#4f46e5",
        }, // Indigo
        {
          data: transformed.map((item) => item.failed),
          label: "Failed",
          id: "uvId",
          stack: "total",
          color: "#f43f5e",
        }, // Rose
      ],
      xAxis: [
        { data: transformed.map((item) => item.label), scaleType: "band" },
      ],
    };
  }, [statistics]);

  return (
    // Use a main container for better layout and padding
    <main className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Result Section"
          subtitle="Manage, add, and view student exam results and statistics."
        />

        {/* Action Cards Grid - more responsive and centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <ActionCard
            to="/result-view"
            icon={faCheck}
            title="Check Results"
            colorClass={{ bg: "bg-green-100", text: "text-green-600" }}
          />
          <ActionCard
            to="/add-result"
            icon={faAdd}
            title="Add New Result"
            colorClass={{ bg: "bg-blue-100", text: "text-blue-600" }}
          />
        </div>

        {/* Chart Section */}
        <ChartContainer
          loading={loading}
          hasData={statistics.length > 0}
          exams={exams}
          selectedExam={selectedExam}
          onSelectExam={handleSelectExam}
        >
          <BarChart
            series={chartData.series}
            xAxis={chartData.xAxis}
            // Let the chart fill its container
            width={undefined}
            height={320}
            slotProps={{
              legend: {
                labelStyle: {
                  fontSize: 14,
                  fontWeight: "bold",
                },
              },
            }}
          />
        </ChartContainer>
      </div>
    </main>
  );
}

export default ResultHome;
