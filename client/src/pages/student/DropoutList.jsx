import { useEffect, useState } from "react";
import Axios from "../../Axios";
import{toast} from "react-toastify";

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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white py-10">
      <div className="max-w-5xl mx-auto p-8 bg-white/90 rounded-2xl shadow-2xl border border-slate-100 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-red-700 flex items-center gap-3">
              <span className="inline-block bg-red-100 text-red-600 rounded-full px-4 py-1 text-base font-bold shadow">
                Dropout Students
              </span>
              <span className="text-base text-slate-400 font-medium">
                ({dropouts.length})
              </span>
            </h2>
            <p className="text-slate-500 mt-1">Manage and recover students who have dropped out.</p>
          </div>
          <button
            onClick={handleRecover}
            disabled={selected.length === 0}
            className={`transition px-6 py-2 rounded-md font-bold shadow-lg ${
              selected.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Recover
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400 mb-4"></div>
            <span className="text-lg text-blue-500 font-semibold">Loading dropouts...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8 font-semibold bg-red-50 rounded-lg">{error}</div>
        ) : dropouts.length === 0 ? (
          <div className="text-center text-slate-500 py-12 text-lg bg-slate-50 rounded-xl shadow">
            No dropout students found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow">
            <table className="min-w-full bg-white text-sm divide-y divide-slate-100">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                <tr>
                  <th className="px-4 py-3 text-slate-600 font-bold text-center">
                    <input
                      type="checkbox"
                      checked={selected.length === dropouts.length && dropouts.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="accent-blue-600 w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-center">#</th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-left">Name</th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-left">Student ID</th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-left">Class</th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-left">Center</th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-left">Reason</th>
                  <th className="px-4 py-3 text-slate-600 font-bold text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dropouts.map((student, idx) => (
                  <tr key={student._id || idx} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(student._id)}
                        onChange={e => handleSelect(student._id, e.target.checked)}
                        className="accent-blue-600 w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{student.studentName || student.name}</td>
                    <td className="px-4 py-3 text-slate-700">{student.registerNo || student.studentId}</td>
                    <td className="px-4 py-3 text-slate-600">{student.class?.className || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{student.branch?.studyCentreName || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{student.reason || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">
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
        )}
      </div>
    </div>
  );
}

export default DropoutList;