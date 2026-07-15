import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightDots, faDownload } from "@fortawesome/free-solid-svg-icons";

function BulkPromoteModal({
  isOpen,
  setIsOpen,
  filteredStudents,
  classes,
  currentClassId,
  fetchStudents,
  filters,
  studyCentres,
}) {
  const [targetClass, setTargetClass] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Find class names for display and backup file naming
  const currentClassObj = classes.find((c) => c._id === currentClassId);
  const currentClassName = currentClassObj ? currentClassObj.className : "Current Class";

  const selectedCentreObj = studyCentres.find((sc) => sc._id === filters.studyCentre);
  const centreNameStr = selectedCentreObj ? selectedCentreObj.studyCentreName.replace(/[^a-zA-Z0-9]/g, "_") : "";

  const handleClose = () => {
    setIsOpen(false);
    setDownloaded(false);
    setTargetClass("");
  };

  const downloadJSON = () => {
    // Structure student collection cleanly
    const backupData = filteredStudents.map((s) => ({
      registerNo: s.registerNo,
      studentName: s.studentName,
      fatherName: s.fatherName,
      house: s.house,
      place: s.place,
      postOffice: s.postOffice,
      pinCode: s.pinCode,
      district: s.district,
      state: s.state,
      phone: s.phone,
      dateOfBirth: s.dateOfBirth,
      studyCentre: s.branch?.studyCentreName || "",
      studyCentreCode: s.branch?.studyCentreCode || "",
      class: s.class?.className || "",
      imageUrl: s.imageUrl || "",
      academicYear: s.academicYear || "",
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    const filename = `backup_class_${currentClassName.replace(/[^a-zA-Z0-9]/g, "_")}_${
      centreNameStr ? centreNameStr + "_" : ""
    }students.json`;
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    toast.success("JSON backup downloaded successfully!");
  };

  const downloadCSV = () => {
    const headers = [
      "Register No",
      "Student Name",
      "Father Name",
      "House",
      "Place",
      "Post Office",
      "Pincode",
      "District",
      "State",
      "Phone",
      "DOB",
      "Study Centre",
      "Centre Code",
      "Class",
    ];

    const rows = filteredStudents.map((s) => [
      s.registerNo || "",
      s.studentName || "",
      s.fatherName || "",
      s.house || "",
      s.place || "",
      s.postOffice || "",
      s.pinCode || "",
      s.district || "",
      s.state || "",
      s.phone || "",
      s.dateOfBirth || "",
      s.branch?.studyCentreName || "",
      s.branch?.studyCentreCode || "",
      s.class?.className || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    const filename = `backup_class_${currentClassName.replace(/[^a-zA-Z0-9]/g, "_")}_${
      centreNameStr ? centreNameStr + "_" : ""
    }students.csv`;
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloaded(true);
    toast.success("CSV backup downloaded successfully!");
  };

  const handlePromote = async () => {
    if (!targetClass) {
      toast.warning("Please select a target class.");
      return;
    }
    if (!downloaded) {
      toast.warning("Please download a backup first.");
      return;
    }

    setPromoting(true);
    try {
      const studentIds = filteredStudents.map((s) => s._id);
      await Axios.post("/student/promote", {
        studentIds,
        classId: targetClass,
      });
      toast.success("Entire class promoted successfully!");
      fetchStudents();
      handleClose();
    } catch (error) {
      console.error("Failed to promote students:", error);
      toast.error("Failed to promote students. Please try again.");
    } finally {
      setPromoting(false);
    }
  };

  // Filter out current class from selection list
  const promotionClasses = classes.filter((c) => c._id !== currentClassId);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Background backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transition-all transform">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowUpRightDots} />
              Bulk Promote Class
            </Dialog.Title>
            <p className="text-indigo-100 text-xs mt-1">
              Promote students from <span className="font-semibold">{currentClassName}</span>
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Summary */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-600">
              <p>
                You are about to promote{" "}
                <span className="font-semibold text-slate-800 text-base">{filteredStudents.length}</span>{" "}
                students matching your current filter.
              </p>
              {centreNameStr && (
                <p className="mt-1 text-xs text-indigo-600 font-medium">
                  Filtered by Study Centre: {selectedCentreObj?.studyCentreName}
                </p>
              )}
            </div>

            {/* Target Class Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Select Target Class (Promote To)
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">-- Choose Target Class --</option>
                {promotionClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Warning Alert */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                ⚠️ Data Protection Required
              </p>
              <p className="text-amber-700">
                You must download a backup of the students in the current class before you can change their class. This ensures you have a record of their previous status.
              </p>
            </div>

            {/* Backup Download Actions */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                1. Download Backup
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={downloadJSON}
                  disabled={filteredStudents.length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-slate-400" />
                  Backup as JSON
                </button>
                <button
                  type="button"
                  onClick={downloadCSV}
                  disabled={filteredStudents.length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-slate-400" />
                  Backup as CSV
                </button>
              </div>
            </div>

            {/* Promotion Confirmation Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                2. Execute Promotion
              </span>
              <button
                type="button"
                onClick={handlePromote}
                disabled={promoting || !targetClass || !downloaded || filteredStudents.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {promoting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Promoting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faArrowUpRightDots} />
                    Promote {filteredStudents.length} Students
                  </>
                )}
              </button>
              {!downloaded && targetClass && (
                <p className="text-[10px] text-center text-rose-500 font-medium animate-pulse">
                  Please download a backup file first to unlock the promote action.
                </p>
              )}
            </div>
          </div>

          {/* Footer cancel */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end">
            <button
              onClick={handleClose}
              disabled={promoting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default BulkPromoteModal;
