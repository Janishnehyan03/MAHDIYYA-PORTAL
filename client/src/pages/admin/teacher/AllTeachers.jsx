import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSearch, faSort, faSortUp, faSortDown, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

// --- Reusable Components for a Cleaner UI ---

// A more visually appealing skeleton loader that mimics the table structure
const TableSkeleton = () => (
  <div className="p-6">
    <div className="animate-pulse">
      {/* Skeleton Header */}
      <div className="h-8 bg-slate-200 rounded-md w-1/3 mb-4"></div>
      <div className="h-10 bg-slate-200 rounded-md w-full mb-6"></div>
      {/* Skeleton Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
          <div className="h-6 w-8 bg-slate-200 rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);

// A reusable status badge
const StatusBadge = ({ isTrue, text }) => (
  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
    isTrue 
      ? 'bg-green-100 text-green-800' 
      : 'bg-slate-100 text-slate-600'
  }`}>
    {text}
  </span>
);

// An empty state component for when there's no data
const EmptyState = ({ message, onClearFilters }) => (
    <div className="text-center py-16 px-6">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No teachers found</h3>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
                Clear all filters
            </button>
        </div>
    </div>
);


// --- Main Component ---

function AllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authData } = useContext(UserAuthContext);
  
  // States for new features
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ gender: 'all', mahdiyyaTeacher: 'all' });
  const [sortConfig, setSortConfig] = useState({ key: 'teacherName', direction: 'ascending' });

  // Fetch initial data
  useEffect(() => {
    const getTeachers = async () => {
      setLoading(true);
      try {
        const { data } = await Axios.get(`/teacher?studyCentre=${authData?.branch._id}`);
        setTeachers(data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authData?.branch?._id) {
        getTeachers();
    }
  }, [authData]);
  
  // Memoized calculation for filtering, searching, and sorting
  const processedTeachers = useMemo(() => {
    let computableTeachers = [...teachers];

    // 1. Apply Filters
    computableTeachers = computableTeachers.filter(teacher => {
        const genderMatch = filters.gender === 'all' || teacher.gender.toLowerCase() === filters.gender;
        const mahdiyyaMatch = filters.mahdiyyaTeacher === 'all' || String(teacher.mahdiyyaTeacher) === filters.mahdiyyaTeacher;
        return genderMatch && mahdiyyaMatch;
    });

    // 2. Apply Search
    if (searchTerm) {
        computableTeachers = computableTeachers.filter(teacher => 
            teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // 3. Apply Sorting
    computableTeachers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return computableTeachers;
  }, [teachers, searchTerm, filters, sortConfig]);

  // Handler for sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
      if (sortConfig.key !== key) return faSort;
      return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
  };

  const clearAll = () => {
      setSearchTerm("");
      setFilters({ gender: 'all', mahdiyyaTeacher: 'all' });
      setSortConfig({ key: 'teacherName', direction: 'ascending' });
  };
  
  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">All Teachers</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage teacher profiles, details, and assignments.
            </p>
          </div>
          <Link
            to="/create-teacher"
            className="inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Add Teacher
          </Link>
        </div>

        {/* Toolbar for Search and Filters */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200 bg-slate-50">
          <div className="relative md:col-span-1">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
             <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})} className="w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <select value={filters.mahdiyyaTeacher} onChange={e => setFilters({...filters, mahdiyyaTeacher: e.target.value})} className="w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="all">All Types</option>
                <option value="true">Mahdiyya Teacher</option>
                <option value="false">Regular Teacher</option>
            </select>
          </div>
        </div>
        
        {/* Table Area */}
        <div className="overflow-x-auto">
            {processedTeachers.length > 0 ? (
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {/* Interactive Table Headers for Sorting */}
                            <th className="p-4 font-semibold text-slate-600 cursor-pointer" onClick={() => requestSort('teacherName')}>
                                Name <FontAwesomeIcon icon={getSortIcon('teacherName')} className="ml-2" />
                            </th>
                            <th className="p-4 font-semibold text-slate-600 cursor-pointer" onClick={() => requestSort('email')}>
                                Contact <FontAwesomeIcon icon={getSortIcon('email')} className="ml-2" />
                            </th>
                            <th className="p-4 font-semibold text-slate-600">Gender</th>
                            <th className="p-4 font-semibold text-slate-600">Mahdiyya Teacher</th>
                            <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {processedTeachers.map((teacher) => (
                        <tr key={teacher._id} className="hover:bg-slate-50">
                            <td className="p-4">
                                <Link to={`/teacher/${teacher._id}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                                        {teacher.teacherName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 group-hover:text-blue-600">{teacher.teacherName}</p>
                                        <p className="text-xs text-slate-500">{teacher.registerNo || 'No Reg. No.'}</p>
                                    </div>
                                </Link>
                            </td>
                            <td className="p-4 text-slate-600">
                                <div>
                                    <p>{teacher.email}</p>
                                    <p className="text-xs">{teacher.phone}</p>
                                </div>
                            </td>
                            <td className="p-4 text-slate-600 capitalize">{teacher.gender}</td>
                            <td className="p-4">
                                <StatusBadge isTrue={teacher.mahdiyyaTeacher} text={teacher.mahdiyyaTeacher ? "Yes" : "No"} />
                            </td>
                            <td className="p-4 text-center">
                                <Link to={`/edit-teacher/${teacher._id}`} className="text-slate-500 hover:text-blue-600 p-2">
                                    <FontAwesomeIcon icon={faEdit} />
                                </Link>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <EmptyState 
                    message="No teachers match your current search and filter criteria."
                    onClearFilters={clearAll}
                />
            )}
        </div>
      </div>
    </div>
  );
}

export default AllTeachers;