import {
  faDownload,
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import Axios from "../../../Axios";

// --- Reusable UI Components (with additions) ---

const TableSkeleton = () => (
  <div className="animate-pulse p-4">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 py-3 border-b border-slate-100"
      >
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
        <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ message, onClear }) => (
  <div className="text-center py-16 px-6">
    <svg
      className="mx-auto h-12 w-12 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <h3 className="mt-2 text-sm font-semibold text-slate-900">
      No Results Found
    </h3>
    <p className="mt-1 text-sm text-slate-500">{message}</p>
    <div className="mt-6">
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-semibold text-blue-600 hover:text-blue-500"
      >
        Clear all filters
      </button>
    </div>
  </div>
);

const StatusBadge = ({ isTrue }) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      isTrue ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
    }`}
  >
    {isTrue ? "Yes" : "No"}
  </span>
);

const FilterTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-slate-500/20"
    >
      <span className="sr-only">Remove</span>
      <svg
        viewBox="0 0 14 14"
        className="h-3.5 w-3.5 stroke-slate-600/50 group-hover:stroke-slate-600/75"
      >
        <path d="M4 4l6 6m0-6l-6 6" />
      </svg>
    </button>
  </span>
);

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm text-slate-600 bg-white border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
      >
        Previous
      </button>
      <span className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm text-slate-600 bg-white border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
      >
        Next
      </button>
    </div>
  );
};

// --- Main Component: AllMahdiyyaTeachers ---

function AllMahdiyyaTeachers() {
  const [loading, setLoading] = useState(true);
  const [allTeachers, setAllTeachers] = useState([]);
  const [studyCentres, setStudyCentres] = useState([]);

  const [filters, setFilters] = useState({ studyCentre: "", gender: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "teacherName",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch initial data
  useEffect(() => {
    const getInitialData = async () => {
      setLoading(true);
      try {
        const [centresRes, teachersRes] = await Promise.all([
          Axios.get("/study-centre?sort=studyCentreName"),
          Axios.get("/teacher?mahdiyyaTeacher=true&limit=1000"), // Fetch all Mahdiyya teachers at once
        ]);
        setStudyCentres(centresRes.data.docs);
        setAllTeachers(teachersRes.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    getInitialData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Memoized processing for filtering and searching
  const filteredTeachers = useMemo(() => {
    return allTeachers
      .filter((teacher) => {
        const centreMatch =
          !filters.studyCentre || teacher.branch?._id === filters.studyCentre;
        const genderMatch =
          filters.gender === "all" ||
          teacher.gender.toLowerCase() === filters.gender;
        return centreMatch && genderMatch;
      })
      .filter(
        (teacher) =>
          !searchTerm ||
          teacher.teacherName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.phone.includes(searchTerm)
      );
  }, [allTeachers, filters, searchTerm]);

  // Memoized processing for sorting and pagination
  const processedTeachers = useMemo(() => {
    const sorted = [...filteredTeachers].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, sortConfig, currentPage, itemsPerPage]);

  // --- Handlers ---
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "ascending" ? faSortUp : faSortDown;
  };

  const clearAllFilters = () => {
    setFilters({ studyCentre: "", gender: "all" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleExportToCSV = () => {
    // Exports all FILTERED data, not just the paginated slice
    const headers = ["#", "Name", "Email", "Phone", "Gender", "Study Centre"];
    const rows = filteredTeachers.map((teacher, index) => [
      index + 1,
      `"${teacher.teacherName}"`,
      `"${teacher.email}"`,
      `"${teacher.phone}"`,
      `"${teacher.gender}"`,
      `"${teacher.branch?.studyCentreName || "N/A"}"`,
      `"${new Date(teacher.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "mahdiyya_teachers_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">
            Mahdiyya Teachers Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter, and export a list of all Mahdiyya-qualified teachers.
          </p>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-slate-200 bg-slate-50/75">
          <select
            value={filters.studyCentre}
            onChange={(e) => handleFilterChange("studyCentre", e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">All Study Centres</option>
            {studyCentres.map((item) => (
              <option key={item._id} value={item._id}>
                {item.studyCentreName}
              </option>
            ))}
          </select>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <div className="relative lg:col-span-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search report..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Active Filters Bar */}
        {(filters.studyCentre || filters.gender !== "all") && (
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">
              Active Filters:
            </span>
            {filters.studyCentre && (
              <FilterTag
                label={`Centre: ${
                  studyCentres.find((c) => c._id === filters.studyCentre)
                    ?.studyCentreName
                }`}
                onRemove={() => handleFilterChange("studyCentre", "")}
              />
            )}
            {filters.gender !== "all" && (
              <FilterTag
                label={`Gender: ${
                  filters.gender.charAt(0).toUpperCase() +
                  filters.gender.slice(1)
                }`}
                onRemove={() => handleFilterChange("gender", "all")}
              />
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : processedTeachers.length > 0 ? (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 w-12 font-semibold text-slate-600">#</th>
                  <th
                    className="p-4 font-semibold text-slate-600 cursor-pointer"
                    onClick={() => requestSort("teacherName")}
                  >
                    Name{" "}
                    <FontAwesomeIcon
                      icon={getSortIcon("teacherName")}
                      className="ml-1 opacity-60"
                    />
                  </th>
                  <th className="p-4 font-semibold text-slate-600">Contact</th>
                  <th
                    className="p-4 font-semibold text-slate-600 cursor-pointer"
                    onClick={() => requestSort("branch.studyCentreName")}
                  >
                    Study Centre{" "}
                    <FontAwesomeIcon
                      icon={getSortIcon("branch.studyCentreName")}
                      className="ml-1 opacity-60"
                    />
                  </th>
                  <th className="p-4 font-semibold text-slate-600">
                    Teacher Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedTeachers.map((teacher, index) => (
                  <tr key={teacher._id} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg">
                          {teacher.teacherName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {teacher.teacherName}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {teacher.gender}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>
                        <p>{teacher.email}</p>
                        <p className="text-xs">{teacher.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {teacher.branch?.studyCentreName || "N/A"}
                    </td>
                    <td className="p-4">
                      <StatusBadge isTrue={teacher.mahdiyyaTeacher} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              message="No teachers match your current filters. Try adjusting your search or filter criteria."
              onClear={clearAllFilters}
            />
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm bg-white border-slate-300 rounded-md"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTeachers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          <button
            onClick={handleExportToCSV}
            disabled={filteredTeachers.length === 0}
            className="inline-flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faDownload} /> Export{" "}
            {filteredTeachers.length} rows
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllMahdiyyaTeachers;
