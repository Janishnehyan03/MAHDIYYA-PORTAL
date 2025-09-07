import {
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
      <div className="p-4 flex justify-between items-center border-b border-slate-200">
        <p className="text-sm font-semibold text-slate-600">
          Showing{" "}
          <span className="font-bold text-slate-800">
            {paginatedStudents.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-800">
            {sortedStudents.length}
          </span>
        </p>
        {sortedStudents.length > 0 && (
          <button
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            onClick={handleExport}
            type="button"
          >
            Export to Excel
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-3 ${col.class}`}
                  >
                    <div
                      onClick={() => requestSort(col.key)}
                      className="flex items-center gap-2 cursor-pointer select-none"
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
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student._id}
                    onClick={() => navigate(`/profile/${student._id}`)}
                    className="bg-white border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {student.registerNo}
                    </td>
                    <td className="px-6 py-4">{student.studentName}</td>
                    <td className="px-6 py-4">
                      {student.class?.className || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {student.branch?.studyCentreName || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-10 text-slate-500"
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
        <div className="p-4 flex justify-between items-center border-t border-slate-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default StudentsTable;
