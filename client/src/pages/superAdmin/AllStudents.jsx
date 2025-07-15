import {
  faDownload,
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import Axios from "../../Axios";
import TableSkeleton from "../../components/skeletons/TableSkeleton.jsx"; // You'll need to create this

// --- Helper function for formatting dates ---
const formatDate = (d, m, y) => {
  if (!d || !m || !y) return "N/A";
  // Basic formatting, can be improved with a library like date-fns
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB"); // e.g., 24/09/2023
};

function AllStudents() {
  const tableRef = useRef(null);
  const navigate = useNavigate();

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studyCentres, setStudyCentres] = useState([]);
  const [classes, setClasses] = useState([]);

  // --- Feature States: Filters, Search, Sort, Pagination ---
  const [filters, setFilters] = useState({ classId: "", studyCentre: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'registerNo', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // --- Data Fetching ---
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
        // Add user-facing error message here (e.g., using a toast library)
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Memoized Data Processing for Performance ---

  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    // Apply dropdown filters
    if (filters.classId) {
      filtered = filtered.filter(s => s.class?._id === filters.classId);
    }
    if (filters.studyCentre) {
      filtered = filtered.filter(s => s.branch?._id === filters.studyCentre);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
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
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
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

  // --- Handlers ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return faSort;
    }
    return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
  };
  
  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);

  // --- Column Headers Definition ---
  const columns = [
    { label: "Reg. No", key: "registerNo", class: "w-1/12" },
    { label: "Name", key: "studentName", class: "w-3/12" },
    { label: "Class", key: "class.className", class: "w-2/12" },
    { label: "Study Centre", key: "branch.studyCentreName", class: "w-3/12" },
    { label: "Phone", key: "phone", class: "w-2/12" },
    { label: "DOB", key: "dob", class: "w-1/12" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">All Students</h1>
          <p className="text-slate-500 mt-1">Search, filter, and manage all student records.</p>
        </header>

        {/* --- Controls Toolbar --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative md:col-span-1">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or Reg. No..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                {/* Filters */}
                <select name="studyCentre" value={filters.studyCentre} onChange={handleFilterChange} className="w-full border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    <option value="">All Study Centres</option>
                    {studyCentres.map(c => <option key={c._id} value={c._id}>{c.studyCentreName}</option>)}
                </select>
                <select name="classId" value={filters.classId} onChange={handleFilterChange} className="w-full border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
            </div>
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
           {/* Table Header and Export */}
           <div className="p-4 flex justify-between items-center border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-600">
                    Showing <span className="font-bold text-slate-800">{paginatedStudents.length}</span> of <span className="font-bold text-slate-800">{sortedStudents.length}</span> students
                </p>
                {sortedStudents.length > 0 && (
                    <ReactHTMLTableToExcel
                        id="export-button"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        table="students-table-export" // Important: ID for the hidden table
                        filename="students_export"
                        sheet="students"
                        buttonText="Export to Excel"
                    />
                )}
            </div>
            
            {/* Main Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <TableSkeleton rows={10} cols={6} />
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} scope="col" className={`px-6 py-3 ${col.class}`}>
                                        <div onClick={() => requestSort(col.key)} className="flex items-center gap-2 cursor-pointer select-none">
                                            {col.label}
                                            <FontAwesomeIcon icon={getSortIcon(col.key)} className="text-slate-400" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStudents.length > 0 ? paginatedStudents.map((student) => (
                                <tr key={student._id} onClick={() => navigate(`/profile/${student._id}`)} className="bg-white border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{student.registerNo}</td>
                                    <td className="px-6 py-4">{student.studentName}</td>
                                    <td className="px-6 py-4">{student.class?.className || 'N/A'}</td>
                                    <td className="px-6 py-4">{student.branch?.studyCentreName || 'N/A'}</td>
                                    <td className="px-6 py-4">{student.phone}</td>
                                    <td className="px-6 py-4">{formatDate(student.dobDate, student.dobMonth, student.dobYear)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-10 text-slate-500">
                                        No students found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && !loading && (
                 <div className="p-4 flex justify-between items-center border-t border-slate-200">
                     <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                         Previous
                     </button>
                     <span className="text-sm text-slate-600">
                         Page {currentPage} of {totalPages}
                     </span>
                     <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                         Next
                     </button>
                 </div>
            )}
        </div>

        {/* --- Hidden table for Excel export (contains all filtered data) --- */}
        {sortedStudents.length > 0 && (
             <table id="students-table-export" ref={tableRef} className="hidden">
                 <thead>
                    <tr>
                        <th>REG. NO</th><th>NAME</th><th>FATHER</th><th>HOUSE</th><th>PLACE</th><th>PO</th><th>PINCODE</th>
                        <th>DISTRICT</th><th>STATE</th><th>PHONE</th><th>DOB</th><th>CLASS</th><th>STUDY CENTRE</th><th>CENTRE CODE</th>
                    </tr>
                 </thead>
                 <tbody>
                    {sortedStudents.map((student) => (
                        <tr key={student._id}>
                            <td>{student.registerNo}</td><td>{student.studentName}</td><td>{student.fatherName}</td><td>{student.houseName}</td>
                            <td>{student.place}</td><td>{student.postOffice}</td><td>{student.pinCode}</td><td>{student.district}</td>
                            <td>{student.state}</td><td>{student.phone}</td>
                            <td>{formatDate(student.dobDate, student.dobMonth, student.dobYear)}</td>
                            <td>{student.class?.className}</td><td>{student?.branch?.studyCentreName}</td><td>{student?.branch?.studyCentreCode}</td>
                        </tr>
                    ))}
                 </tbody>
             </table>
        )}

      </div>
    </div>
  );
}

export default AllStudents;