import { faMagnifyingGlass, faTrash, faArrowUpRightDots } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const selectClass =
  "rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

function StudentsToolbar({
  studyCentres,
  classes,
  filters,
  searchTerm,
  setSearchTerm,
  handleFilterChange,
  setCurrentPage,
  setIsDeleteModalOpen,
  setIsPromoteModalOpen,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="relative min-w-[220px] flex-1">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by Name or Reg. No..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>
      <select
        name="studyCentre"
        value={filters.studyCentre}
        onChange={handleFilterChange}
        className={selectClass}
      >
        <option value="">All Study Centres</option>
        {studyCentres.map((c) => (
          <option key={c._id} value={c._id}>
            {c.studyCentreName}
          </option>
        ))}
      </select>
      <select
        name="classId"
        value={filters.classId}
        onChange={handleFilterChange}
        className={selectClass}
      >
        <option value="">All Classes</option>
        {classes.map((c) => (
          <option key={c._id} value={c._id}>
            {c.className}
          </option>
        ))}
      </select>
      {/* Bulk Delete Button */}
      {filters.classId && (
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
        >
          <FontAwesomeIcon icon={faTrash} />
          Bulk Delete Class
        </button>
      )}
      {/* Bulk Promote Button */}
      {filters.classId && (
        <button
          onClick={() => setIsPromoteModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
        >
          <FontAwesomeIcon icon={faArrowUpRightDots} />
          Bulk Promote Class
        </button>
      )}
    </div>
  );
}

export default StudentsToolbar;
