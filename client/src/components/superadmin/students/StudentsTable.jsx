import {
  faFileExport,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

function StudentsTable({
  loading,
  columns,
  paginatedStudents,
  sortedStudents,
  requestSort,
  sortConfig,
  navigate,
  TableSkeleton,
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "ascending" ? faSortUp : faSortDown;
  };

  // 👉 Export function
  const handleExport = () => {
    if (!sortedStudents || sortedStudents.length === 0) return;

    // 🔹 Export ALL fields of each student
    const exportData = sortedStudents.map((student) => ({
      "REG. NO": student.registerNo || "N/A",
      "NAME": student.studentName || "N/A",
      "FATHER": student.fatherName || "N/A",
      "HOUSE": student.houseName || "N/A",
      "PLACE": student.place || "N/A",
      "PO": student.postOffice || "N/A",
      "PINCODE": student.pinCode || "N/A",
      "DISTRICT": student.district || "N/A",
      "STATE": student.state || "N/A",
      "PHONE": student.phone || "N/A",
      "DOB": student.dateOfBirth || "N/A",
      "CLASS": student.class?.className || "N/A",
      "STUDY CENTRE": student.branch?.studyCentreName || "N/A",
      "CENTRE CODE": student.branch?.studyCentreCode || "N/A",
    }));

    // Create worksheet & workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Convert to Excel file and trigger download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "students.xlsx");
  };


  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-800">
            {paginatedStudents.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-800">
            {sortedStudents.length}
          </span>{" "}
          students
        </p>
        {sortedStudents.length > 0 && (
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700"
            onClick={handleExport}
            type="button"
          >
            <FontAwesomeIcon icon={faFileExport} />
            Export to Excel
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.class}`}
                  >
                    <div
                      onClick={() => requestSort(col.key)}
                      className="flex cursor-pointer select-none items-center gap-2 hover:text-indigo-600"
                    >
                      {col.label}
                      <FontAwesomeIcon
                        icon={getSortIcon(col.key)}
                        className="text-slate-400"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student._id}
                    onClick={() => navigate(`/profile/${student._id}`)}
                    className="group cursor-pointer bg-white transition-colors hover:bg-indigo-50/40"
                  >
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                        {student.registerNo}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                          {student.studentName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-semibold text-slate-800 group-hover:text-indigo-600">
                          {student.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {student.class?.className || "N/A"}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {student.branch?.studyCentreName || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-500"
                  >
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
            {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default StudentsTable;
