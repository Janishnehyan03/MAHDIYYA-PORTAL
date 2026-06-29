import {
  faBuilding,
  faCircleCheck,
  faCircleXmark,
  faEdit,
  faLayerGroup,
  faMagnifyingGlass,
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

  // Summary counts for the header stats
  const counts = useMemo(() => {
    const total = studyCentres.length;
    const active = studyCentres.filter((c) => c.isActive).length;
    return { total, active, inactive: total - active };
  }, [studyCentres]);

  // Memoized filtering and sorting for performance
  const filteredAndSortedCentres = useMemo(() => {
    let sortableItems = [...studyCentres];

    if (isActiveFilter !== "all") {
      sortableItems = sortableItems.filter((c) =>
        isActiveFilter === "active" ? c.isActive : !c.isActive
      );
    }

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

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "ascending" ? faSortUp : faSortDown;
  };

  const tableHeaders = [
    { key: "studyCentreName", label: "Study Centre" },
    { key: "studyCentreCode", label: "Code" },
    { key: "phone", label: "Phone", responsive: "lg" },
    { key: "isActive", label: "Status" },
  ];

  const stats = [
    { label: "Total Centres", value: counts.total, icon: faLayerGroup },
    { label: "Active", value: counts.active, icon: faCircleCheck },
    { label: "Inactive", value: counts.inactive, icon: faCircleXmark },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* --- Hero Header --- */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
                <FontAwesomeIcon icon={faBuilding} className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Study Centres
                </h1>
                <p className="mt-1 text-slate-300">
                  Manage and view all affiliated centres.
                </p>
              </div>
            </div>
            <Link
              to="/create-study-centre"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-600 hover:to-purple-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Study Centre
            </Link>
          </div>

          {/* Stats */}
          <div className="relative mt-8 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                  <FontAwesomeIcon icon={s.icon} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </header>

        {/* --- Search Bar & Filter --- */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, code, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm font-medium text-slate-500">Filter</span>
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">All</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* --- Table Section --- */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <Loading />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>
                    {tableHeaders.map((header) => (
                      <th
                        key={header.key}
                        onClick={() =>
                          header.key !== "isActive" && requestSort(header.key)
                        }
                        className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                          header.key !== "isActive"
                            ? "cursor-pointer select-none hover:text-indigo-600"
                            : ""
                        } ${header.responsive === "lg" ? "hidden lg:table-cell" : ""}`}
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
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedCentres.length > 0 ? (
                    filteredAndSortedCentres.map((centre, i) => (
                      <tr
                        key={centre._id}
                        className="group transition-colors hover:bg-indigo-50/40"
                      >
                        <td className="px-5 py-3.5 text-sm text-slate-400">
                          {i + 1}
                        </td>
                        <td
                          onClick={() =>
                            navigation(`/study-centre/${centre._id}`)
                          }
                          className="cursor-pointer px-5 py-3.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                              {centre.studyCentreName?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                                {centre.studyCentreName}
                              </p>
                              {centre.district && (
                                <p className="truncate text-xs text-slate-400">
                                  {centre.district}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                            {centre.studyCentreCode}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3.5 text-sm text-slate-600 lg:table-cell">
                          {centre.phone || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {centre.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/edit-branch/${centre._id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
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
                        className="py-16 text-center text-slate-500"
                      >
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="mb-3 text-3xl text-slate-300"
                        />
                        <p className="font-semibold text-slate-700">
                          No Study Centres Found
                        </p>
                        <p className="mt-1 text-sm">
                          {searchTerm || isActiveFilter !== "all"
                            ? "Try adjusting your filters or search query."
                            : "There are no centres to display."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllStudyCentres;
