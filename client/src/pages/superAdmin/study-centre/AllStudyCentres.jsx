import {
  faEdit,
  faPlus,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../../../Axios";
import Loading from "../../../components/Loading";

// --- Main Component ---
function AllStudyCentres() {
  const [studyCentres, setStudyCentres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "studyCentreCode",
    direction: "ascending",
  });
  const [isActiveFilter, setIsActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

  const navigation = useNavigate();

  // Fetch data from API
  useEffect(() => {
    const fetchStudyCentres = async () => {
      setIsLoading(true);
      try {
        const { data } = await Axios.get(`/study-centre`);
        setStudyCentres(data.docs || []);
      } catch (error) {
        setStudyCentres([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyCentres();
    window.scrollTo(0, 0);
  }, []);

  // Memoized filtering and sorting for performance
  const filteredAndSortedCentres = useMemo(() => {
    let sortableItems = [...studyCentres];

    // Filter by isActive
    if (isActiveFilter !== "all") {
      sortableItems = sortableItems.filter((c) =>
        isActiveFilter === "active" ? c.isActive : !c.isActive
      );
    }

    // Filter by search term
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (centre) =>
          centre.studyCentreName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          centre.studyCentreCode
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          centre.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort logic
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [studyCentres, searchTerm, sortConfig, isActiveFilter]);

  // Handler for clicking on table headers to sort
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Helper to render sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return faSort;
    }
    return sortConfig.direction === "ascending" ? faSortUp : faSortDown;
  };

  const tableHeaders = [
    { key: "studyCentreName", label: "Study Centre" },
    { key: "studyCentreCode", label: "Code" },
    { key: "phone", label: "Phone", responsive: "lg" },
    { key: "isActive", label: "Active" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* --- Header and Controls --- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Study Centres</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and view all affiliated centers.
            </p>
          </div>
          <Link
            to="/create-study-centre"
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Study Centre
          </Link>
        </header>

        {/* --- Search Bar & Filter --- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 mb-4">
          <input
            type="text"
            placeholder="Search by name, code, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          {/* Filter for isActive */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm font-medium">Filter:</span>
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                  #
                </th>
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    onClick={() =>
                      header.key !== "isActive" && requestSort(header.key)
                    }
                    className={`px-4 py-3 text-sm font-semibold text-slate-600 ${
                      header.key !== "isActive"
                        ? "cursor-pointer hover:bg-slate-100"
                        : ""
                    } ${
                      header.responsive === "md" ? "hidden md:table-cell" : ""
                    } ${
                      header.responsive === "lg" ? "hidden lg:table-cell" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {header.label}
                      {header.key !== "isActive" && (
                        <FontAwesomeIcon
                          icon={getSortIcon(header.key)}
                          className="text-slate-400"
                        />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCentres.length > 0 ? (
                filteredAndSortedCentres.map((centre, i) => (
                  <tr
                    key={centre._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {i + 1}
                    </td>
                    <td
                      onClick={() => navigation(`/study-centre/${centre._id}`)}
                      className="px-4 py-3 text-sm font-medium text-indigo-600 hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {centre.studyCentreName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {centre.studyCentreCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                      {centre.phone}
                    </td>
                    {/* isActive status */}
                    <td className="px-4 py-3 text-sm">
                      {centre.isActive ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-200 text-red-600 font-semibold text-xs">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/edit-branch/${centre._id}`}
                        className="text-slate-500 hover:text-indigo-600 p-2"
                        title="Edit Centre"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length + 2}
                    className="text-center py-16 text-slate-500"
                  >
                    <p className="font-semibold">No Study Centres Found</p>
                    <p className="text-sm mt-1">
                      {searchTerm || isActiveFilter !== "all"
                        ? "Try adjusting your filters or search query."
                        : "There are no centers to display."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AllStudyCentres;
