import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function StudentsToolbar({
  studyCentres,
  classes,
  filters,
  searchTerm,
  setSearchTerm,
  handleFilterChange,
  setCurrentPage,
  setIsDeleteModalOpen,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
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
      <select
        name="studyCentre"
        value={filters.studyCentre}
        onChange={handleFilterChange}
        className="border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
        className="border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
        >
          Bulk Delete Class
        </button>
      )}
    </div>
  );
}

export default StudentsToolbar;
