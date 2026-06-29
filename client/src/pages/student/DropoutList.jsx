import { faRotateLeft, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Axios from "../../Axios";
import { toast } from "react-toastify";

function DropoutList() {
  const [dropouts, setDropouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);

  const fetchDropouts = () => {
    setLoading(true);
    Axios.get("/student/list/dropout")
      .then((res) => {
        setDropouts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch dropout list.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDropouts();
  }, []);

  const handleSelect = (id, checked) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelected(checked ? dropouts.map((s) => s._id) : []);
  };

  const handleRecover = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one student to recover.");
      return;
    }
    if (!window.confirm("Recover selected students?")) return;
    const recoverPromise = Axios.post("/student/recover", { studentIds: selected })
      .then(() => {
        fetchDropouts();
        setSelected([]);
      });
    toast.promise(
      recoverPromise,
      {
        loading: "Recovering students...",
        success: "Selected students have been recovered!",
        error: "Failed to recover students.",
      },
      {
        style: {
          minWidth: "250px",
          fontSize: "16px",
        },
        success: {
          duration: 4000,
          icon: "✅"
        },
        error: {
          duration: 4000,
          icon: "❌"
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Hero Header */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
                <FontAwesomeIcon icon={faUserSlash} className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Dropout Students
                  <span className="rounded-full bg-white/10 px-3 py-1 text-base font-semibold text-slate-200 ring-1 ring-inset ring-white/20">
                    {dropouts.length}
                  </span>
                </h2>
                <p className="mt-1 text-slate-300">
                  Manage and recover students who have dropped out.
                </p>
              </div>
            </div>
            <button
              onClick={handleRecover}
              disabled={selected.length === 0}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-lg transition ${
                selected.length === 0
                  ? "cursor-not-allowed bg-white/10 text-slate-400 ring-1 ring-inset ring-white/15"
                  : "bg-emerald-500 text-white shadow-emerald-900/30 hover:bg-emerald-600"
              }`}
            >
              <FontAwesomeIcon icon={faRotateLeft} />
              Recover {selected.length > 0 && `(${selected.length})`}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-24 shadow-sm">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-indigo-400"></div>
            <span className="text-lg font-semibold text-indigo-500">
              Loading dropouts...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 py-8 text-center font-semibold text-rose-600">
            {error}
          </div>
        ) : dropouts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-2xl text-slate-400">
              <FontAwesomeIcon icon={faUserSlash} />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              No dropout students found.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selected.length === dropouts.length &&
                          dropouts.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    {["#", "Name", "Student ID", "Class", "Center", "Reason", "Date"].map(
                      (h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                            i === 0 ? "text-center" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dropouts.map((student, idx) => (
                    <tr
                      key={student._id || idx}
                      className="transition-colors hover:bg-indigo-50/40"
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(student._id)}
                          onChange={(e) =>
                            handleSelect(student._id, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {student.studentName || student.name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                          {student.registerNo || student.studentId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {student.class?.className || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {student.branch?.studyCentreName || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {student.reason || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {student.date
                          ? new Date(student.date).toLocaleDateString()
                          : student.updatedAt
                          ? new Date(student.updatedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DropoutList;