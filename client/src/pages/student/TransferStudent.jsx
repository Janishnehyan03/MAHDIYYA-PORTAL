import { faRightLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../Axios";

const TransferStudent = () => {
  const [student, setStudent] = useState(null);
  const [studyCentres, setStudyCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [loading, setLoading] = useState(false);

  const { studentId } = useParams(); // Replace with dynamic ID from route or context

  // Fetch student details
  useEffect(() => {
    Axios.get(`/student/${studentId}`).then((res) => {
      setStudent(res.data);
    });

    // Fetch all study centres
    Axios.get("/study-centre").then((res) => {
      setStudyCentres(res.data.docs);
    });
  }, [studentId]);

  const handleTransfer = async () => {
    if (!selectedCentre || !transferReason) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      await Axios.patch(`/student/${studentId}`, {
        branch: selectedCentre,
        transferReason,
        transferredFrom: student.branch._id, // Add transferredFrom field
      });
      toast.success("Student transferred successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to transfer student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Hero Header */}
        <header className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <FontAwesomeIcon icon={faRightLeft} className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Student Transfer
              </h1>
              <p className="mt-1 text-slate-300">
                Manage student relocation between study centres.
              </p>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">

        {student ? (
          <div className="space-y-10">
            {/* Student Details Card - Improved layout for scannability */}
            <div className="border border-slate-200 rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold text-slate-700 mb-6 border-b border-slate-200 pb-4">
                Student Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 text-sm">
                {/* A better pattern for key-value pairs */}
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium">Name</p>
                  <p className="text-slate-800 font-semibold">
                    {student.studentName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium">Register No</p>
                  <p className="text-slate-800">{student.registerNo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium">Class</p>
                  <p className="text-slate-800">{student.class.className}</p>
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                  <p className="text-slate-500 font-medium">
                    Current Study Centre
                  </p>
                  <p className="text-slate-800">
                    {student.branch?.studyCentreName}
                  </p>
                </div>
                {student.transferredFrom && (
                  <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
                    <p className="text-slate-500 font-medium">
                      Previously Transferred From
                    </p>
                    <p className="text-slate-800">
                      {student.transferredFrom?.studyCentreName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Form Section */}
            <div className="space-y-6">
              {/* Study Centre Selection with custom arrow */}
              <div>
                <label
                  htmlFor="study-centre"
                  className="block text-sm font-medium leading-6 text-slate-900"
                >
                  Select New Study Centre
                </label>
                <div className="relative mt-2">
                  <select
                    id="study-centre"
                    className="block w-full appearance-none rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition"
                    value={selectedCentre}
                    onChange={(e) => setSelectedCentre(e.target.value)}
                  >
                    <option value="">Select a centre...</option>
                    {studyCentres
                      .sort((a, b) =>
                        a.studyCentreName.localeCompare(b.studyCentreName)
                      )
                      .map((centre) => (
                        <option key={centre._id} value={centre._id}>
                          {centre.studyCentreName}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Transfer Reason */}
              <div>
                <label
                  htmlFor="transfer-reason"
                  className="block text-sm font-medium leading-6 text-slate-900"
                >
                  Transfer Reason
                </label>
                <div className="mt-2">
                  <textarea
                    id="transfer-reason"
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition"
                    rows={4}
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Provide a clear and concise reason for the transfer..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button with modern styling */}
            <div className="pt-6 border-t border-slate-200">
              <button
                onClick={handleTransfer}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || !selectedCentre}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                      ></path>
                    </svg>
                    Processing Transfer...
                  </>
                ) : (
                  "Confirm and Transfer Student"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <svg
              className="animate-spin h-8 w-8 text-indigo-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V8h8a8 8 0 01-8 8v-8H4z"
              ></path>
            </svg>
            <p className="text-slate-500">Loading student details...</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TransferStudent;
