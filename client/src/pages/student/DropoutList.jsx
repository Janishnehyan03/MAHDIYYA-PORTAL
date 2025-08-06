import { useEffect, useState } from "react";
import Axios from "../../Axios";

function DropoutList() {
  const [dropouts, setDropouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Axios.get("/student/list/dropout")
      .then((res) => {
        setDropouts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch dropout list.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-2xl md:text-3xl font-extrabold text-red-700 mb-8 flex items-center gap-3">
        <span className="inline-block bg-red-100 text-red-600 rounded-full px-4 py-1 text-base font-bold">
          Dropout Students
        </span>
        <span className="text-base text-slate-400 font-medium">
          ({dropouts.length})
        </span>
      </h2>

      {loading ? (
        <div className="w-full flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-red-400"></div>
          <span className="ml-4 text-lg text-slate-500">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8 font-semibold">{error}</div>
      ) : dropouts.length === 0 ? (
        <div className="text-center text-slate-500 py-12 text-lg">
          No dropout students found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full bg-white text-sm divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
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
                <tr key={student._id || idx} className="hover:bg-slate-50 transition">
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
  );
}

export default DropoutList;