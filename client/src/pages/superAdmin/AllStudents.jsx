import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../../Axios";
import TableSkeleton from "../../components/skeletons/TableSkeleton.jsx";
import BulkDeleteModal from "../../components/superadmin/students/BulkDeleteModal.jsx";
import StudentsExportTable from "../../components/superadmin/students/StudentsExportTable.jsx";
import StudentsTable from "../../components/superadmin/students/StudentsTable.jsx";
import StudentsToolbar from "../../components/superadmin/students/StudentsToolbar.jsx";
import BulkImportStudents from "../../components/superadmin/students/BulkImportStudents.jsx";

// Helper function for formatting dates
const formatDate = (d, m, y) => {
  if (!d || !m || !y) return "N/A";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB");
};

function AllStudents() {
  const tableRef = useRef(null);
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studyCentres, setStudyCentres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ classId: "", studyCentre: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "registerNo",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Data Fetching
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const studentsRes = await Axios.get("/student");
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [studentsRes, classesRes, centresRes] = await Promise.all([
          Axios.get("/student"),
          Axios.get("/class"),
          Axios.get("/study-centre?sort=studyCentreName"),
        ]);
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
        setStudyCentres(centresRes.data.docs);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Memoized Data Processing
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    if (filters.classId) {
      filtered = filtered.filter((s) => s.class?._id === filters.classId);
    }
    if (filters.studyCentre) {
      filtered = filtered.filter((s) => s.branch?._id === filters.studyCentre);
    }
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(lowercasedTerm) ||
          s.registerNo?.toString().includes(lowercasedTerm)
      );
    }
    return filtered;
  }, [students, filters, searchTerm]);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...filteredStudents];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStudents, sortConfig]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedStudents, currentPage]);

  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
    setDownloaded(false); // Reset when filter changes
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await Axios.delete(`/student/class/${filters.classId}`);
      await fetchStudents();
      setIsDeleteModalOpen(false);
      setDownloaded(false);
    } catch (err) {
      alert("Failed to delete students. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Table Columns
  const columns = [
    { label: "Reg. No", key: "registerNo", class: "w-1/12" },
    { label: "Name", key: "studentName", class: "w-3/12" },
    { label: "Class", key: "class.className", class: "w-2/12" },
    { label: "Study Centre", key: "branch.studyCentreName", class: "w-3/12" },
  ];

  return (
    <div className="bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div>
        {/* --- Header --- */}
        <header className="mb-8 ml-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">All Students</h1>
            <p className="text-slate-500 mt-1">
              Search, filter, import, and manage all student records.
            </p>
          </div>
          <div>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 rounded-md font-semibold text-sm transition-colors shadow-sm border ${
                showBulkImport
                  ? "bg-green-50 border-green-400 text-green-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-green-100"
              }`}
              onClick={() => setShowBulkImport((v) => !v)}
            >
              <span className="material-icons mr-2" aria-hidden>
                upload_file
              </span>
              {showBulkImport ? "Hide Bulk Import" : "Bulk Import Students"}
            </button>
          </div>
        </header>

        {/* --- Bulk Import Toggle Section --- */}
        {showBulkImport && (
          <div className="mb-5 bg-white border border-green-200 rounded-lg shadow px-6 py-5">
            <BulkImportStudents classId={filters.classId} onSuccess={fetchStudents} />
            <div className="text-xs text-green-700 mt-3">
              <strong>Instructions:</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>Download the sample Excel file and fill in student data.</li>
                <li>
                  <span className="font-semibold">Select a class</span> first, then choose the Excel file and import.
                </li>
                <li>Make sure all "CENTRE CODE" values in the Excel match codes of existing study centres.</li>
                <li>
                  <span className="font-medium text-red-700">Note:</span> All students will be assigned to the selected class and respective study centre based on the Excel data.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* --- Controls Toolbar (children prop not used, just toolbar) --- */}
        <StudentsToolbar
          studyCentres={studyCentres}
          classes={classes}
          filters={filters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleFilterChange={handleFilterChange}
          setCurrentPage={setCurrentPage}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />

        {/* --- Table Section --- */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <StudentsTable
            loading={loading}
            columns={columns}
            paginatedStudents={paginatedStudents}
            sortedStudents={sortedStudents}
            requestSort={requestSort}
            sortConfig={sortConfig}
            navigate={navigate}
            TableSkeleton={TableSkeleton}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* --- Hidden Table for Export --- */}
        <StudentsExportTable
          sortedStudents={sortedStudents}
          formatDate={formatDate}
          tableRef={tableRef}
        />

        {/* --- Bulk Delete Modal --- */}
        <BulkDeleteModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          downloaded={downloaded}
          setDownloaded={setDownloaded}
          filteredStudents={filteredStudents}
          handleBulkDelete={handleBulkDelete}
          deleting={deleting}
          filters={filters}
        />
      </div>
    </div>
  );
}

export default AllStudents;