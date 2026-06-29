import {
  faChalkboardUser,
  faPhone,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../../Axios";

function StudyCentreTeachers() {
  const { id } = useParams();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBranchTeaches = async () => {
      setLoading(true);
      try {
        let { data } = await Axios.get("/teacher?branch=" + id);
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getBranchTeaches();
  }, [id]);

  const branchName = teachers[0]?.branch?.studyCentreName;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Hero */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <FontAwesomeIcon
                icon={faChalkboardUser}
                className="text-2xl text-white"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Teachers
              </h1>
              <p className="mt-1 text-slate-300">
                {branchName || "Study centre faculty"}
              </p>
            </div>
          </div>
        </header>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading teachers…</div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center">
              <FontAwesomeIcon
                icon={faUser}
                className="mb-3 text-3xl text-slate-300"
              />
              <p className="font-semibold text-slate-700">No Teachers Found</p>
              <p className="mt-1 text-sm text-slate-500">
                This study centre has no teachers yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Teacher
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Branch
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((teacher, index) => (
                    <tr
                      key={teacher._id || index}
                      className="transition-colors hover:bg-indigo-50/40"
                    >
                      <td className="px-5 py-3.5 text-sm text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                            {teacher.teacherName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">
                            {teacher.teacherName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {teacher.branch?.studyCentreName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faPhone}
                            className="text-slate-400"
                          />
                          {teacher.branch?.phone || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyCentreTeachers;
