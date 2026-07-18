import { useRef, useState } from "react";
import { Upload, FileCheck2, Loader2, XCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import Axios from "../../../Axios";

// Columns expected by the bulk-import backend (must match parseExcelFile in studentController)
const SAMPLE_HEADERS = [
  "REG. NO",
  "NAME",
  "FATHER",
  "HOUSE",
  "PLACE",
  "PO",
  "PINCODE",
  "DISTRICT",
  "STATE",
  "PHONE",
  "DOB",
  "CLASS",
  "STUDY CENTRE",
  "CENTRE CODE",
];

const SAMPLE_ROW = {
  "REG. NO": "1001",
  NAME: "Student Name",
  FATHER: "Father Name",
  HOUSE: "House Name",
  PLACE: "Place",
  PO: "Post Office",
  PINCODE: "670001",
  DISTRICT: "District",
  STATE: "State",
  PHONE: "9000000000",
  DOB: "01-01-2010",
  CLASS: "Class Name",
  "STUDY CENTRE": "Study Centre Name",
  "CENTRE CODE": "101",
};

function BulkImportStudents({ classId, onSuccess }) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [importedRows, setImportedRows] = useState([]);
  const [showImported, setShowImported] = useState(false);
  const fileInputRef = useRef();

  const resetFile = () => {
    fileInputRef.current.value = "";
    setImportedRows([]);
    setShowImported(false);
  };

  const handleDownloadSample = () => {
    const worksheet = XLSX.utils.json_to_sheet([SAMPLE_ROW], {
      header: SAMPLE_HEADERS,
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "student_bulk_import_sample.xlsx");
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setImportedRows([]);
    setShowImported(false);

    const file = fileInputRef.current.files[0];
    if (!file) {
      setError("Please select an Excel (.xlsx) file.");
      return;
    }
    if (!classId) {
      setError("Please select a class before importing.");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Change below: Expecting backend to return imported data as { imported: [...] }
      const res = await Axios.post(`/student/bulk-import/${classId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // If your backend response is different, adjust accordingly.
      // Try to get the "imported" data, fallback to empty array.
      const imported = res.data?.imported || [];
      setImportedRows(imported);
      setShowImported(true);

      setSuccessMsg(`✅ Imported ${imported.length || "all"} students successfully.`);
      onSuccess && onSuccess();
      resetFile();
    } catch (err) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to import students. Please check your file and try again.");
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleImport} className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Hidden File Input */}
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          className="hidden"
          disabled={importing}
          onChange={() => {
            setError("");
            setSuccessMsg("");
            setImportedRows([]);
            setShowImported(false);
          }}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-100 transition disabled:opacity-50"
          disabled={importing}
        >
          <Upload size={16} /> {fileInputRef.current?.files[0]?.name || "Choose File"}
        </button>

        {/* Import Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-2"
          disabled={importing || !classId || !fileInputRef.current?.files[0]}
        >
          {importing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Importing...
            </>
          ) : (
            <>
              <FileCheck2 size={16} /> Import
            </>
          )}
        </button>

        {/* Download Sample Button */}
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-3 py-2 border border-emerald-300 text-emerald-700 rounded-md text-sm hover:bg-emerald-50 transition"
        >
          <Download size={16} /> Download Sample
        </button>
      </form>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <XCircle size={16} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 mt-2 text-green-700 text-sm">
          <FileCheck2 size={16} /> {successMsg}
        </div>
      )}

      {/* View imported data table */}
      {showImported && importedRows.length > 0 && (
        <div className="mt-4 border rounded-lg bg-green-50 border-green-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-green-700">
              Uploaded Students ({importedRows.length})
            </span>
            <button
              className="text-xs text-slate-500 hover:underline"
              onClick={() => setShowImported(false)}
            >
              Hide List
            </button>
          </div>
          <div className="overflow-x-auto max-h-72">
            <table className="min-w-[600px] w-full text-xs border border-slate-200 rounded">
              <thead>
                <tr className="bg-green-100 text-green-900">
                  <th className="px-2 py-1 border-b">Reg. No</th>
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Father</th>
                  <th className="px-2 py-1 border-b">House</th>
                  <th className="px-2 py-1 border-b">Place</th>
                  <th className="px-2 py-1 border-b">Centre Code</th>
                </tr>
              </thead>
              <tbody>
                {importedRows.map((row, idx) => (
                  <tr key={idx} className="even:bg-green-50">
                    <td className="px-2 py-1">{row.registerNo || "-"}</td>
                    <td className="px-2 py-1">{row.name || "-"}</td>
                    <td className="px-2 py-1">{row.fatherName || "-"}</td>
                    <td className="px-2 py-1">{row.house || "-"}</td>
                    <td className="px-2 py-1">{row.place || "-"}</td>
                    <td className="px-2 py-1">{row.studyCentreCode || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Show button to view last uploaded data if hidden */}
      {!showImported && importedRows.length > 0 && (
        <div className="mt-2">
          <button
            className="text-xs text-green-800 underline"
            onClick={() => setShowImported(true)}
          >
            Show Last Uploaded Data ({importedRows.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default BulkImportStudents;