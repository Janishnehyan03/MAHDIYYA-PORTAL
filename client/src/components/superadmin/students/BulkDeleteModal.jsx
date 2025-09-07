import { Dialog } from "@headlessui/react";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

function BulkDeleteModal({
  isOpen,
  setIsOpen,
  downloaded,
  setDownloaded,
  filteredStudents,
  handleBulkDelete,
  deleting,
  filters,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        setDownloaded(false);
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-bold text-slate-800">
            Bulk Delete - Export Data First
          </Dialog.Title>
          <p className="mt-2 text-slate-600">
            You are about to delete{" "}
            <span className="font-semibold">{filteredStudents.length}</span>{" "}
            students from this class.
          </p>
          <p className="mt-1 text-red-600 text-sm font-medium">
            ⚠️ Please download/export the data before deleting. This action
            cannot be undone!
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
              onClick={() => {
                document.getElementById("export-before-delete").click();
                setTimeout(() => setDownloaded(true), 350);
              }}
              type="button"
            >
              Download Data (Excel)
            </button>
            <ReactHTMLTableToExcel
              id="export-before-delete"
              className="hidden"
              table="students-table-export"
              filename={`class_${filters.classId}_students`}
              sheet="students"
              buttonText="Download Data (Excel)"
            />
            {downloaded && (
              <button
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
                onClick={handleBulkDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete All"}
              </button>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setIsOpen(false);
                setDownloaded(false);
              }}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default BulkDeleteModal;