import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faCalendarDays,
  faFileInvoiceDollar,
  faGraduationCap,
  faReceipt,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "../../Axios";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const statusStyle = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  pending: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function FeeStatus() {
  const [record, setRecord] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    Axios.get("/fee-collection/my-status")
      .then(({ data }) => setRecord(data))
      .catch((e) => {
        setError(e.response?.data?.message || "Unable to load your fee statement.");
        setRecord(null);
      });
  }, []);

  if (record === undefined) {
    return (
      <div className="min-h-full bg-[#f4f7fb] p-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-9 w-64 rounded bg-slate-200" />
          <div className="h-44 rounded-3xl bg-white/70" />
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <main className="min-h-full bg-[#f4f7fb] p-5 md:p-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/80 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FontAwesomeIcon icon={faReceipt} size="lg" />
          </div>
          <h1 className="text-xl font-black text-slate-800">No Fee Statement Available</h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "Your centre's fee statement will appear here once published by the Central Administration."}
          </p>
        </div>
      </main>
    );
  }

  const paid = record.paid || 0;
  const percent = record.totalDue ? Math.min(Math.round((paid / record.totalDue) * 100), 100) : 0;
  const m1m2Count = record.m1m2StudentCount || 0;
  const m3m5Count = record.m3m5StudentCount || 0;
  const cM1M2Rate = record.courseFeeM1M2 || 600;
  const cM3M5Rate = record.courseFeeM3M5 || 700;
  const eM1M2Rate = record.examFeeM1M2 || 150;
  const eM3M5Rate = record.examFeeM3M5 || 200;

  return (
    <main className="min-h-full overflow-hidden bg-[#f4f7fb] p-5 md:p-8 text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/60 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur">
                <FontAwesomeIcon icon={faCalendarDays} /> Academic Year {record.academicYear}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  record.affiliationType === "DEGREE"
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {record.affiliationType === "DEGREE"
                  ? "Degree Tier (Affiliation ₹1,500)"
                  : "M1 & M2 Tier (Affiliation ₹1,000)"}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Fee Statement</h1>
            <p className="mt-1 text-sm text-slate-500">
              {record.studyCentre?.studyCentreName} · Code: <span className="font-bold text-slate-700">{record.studyCentre?.studyCentreCode}</span>
            </p>
          </div>
          <span
            className={`self-start sm:self-auto rounded-full px-3.5 py-1 text-xs font-bold capitalize ring-1 ${
              statusStyle[record.status] || statusStyle.pending
            }`}
          >
            {record.status}
          </span>
        </header>

        {/* Hero Card */}
        <section className="rounded-[30px] border border-white/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-indigo-900/15 md:p-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-200">
                Outstanding Balance
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight">{money(record.outstanding)}</p>
              <p className="mt-2 text-sm text-indigo-100">
                {percent}% of the total assessed fees ({money(paid)} of {money(record.totalDue)}) have been paid.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <div className="mb-2 flex justify-between text-xs font-bold text-indigo-100">
                <span>Paid: {money(paid)}</span>
                <span>Total Due: {money(record.totalDue)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Affiliation Fee */}
          <div className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-4">
              <FontAwesomeIcon icon={faBuildingColumns} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Affiliation Fee</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{money(record.affiliationFee)}</p>
            <p className="mt-1 text-xs text-blue-600 font-semibold">
              {record.affiliationType === "DEGREE" ? "Degree Tier" : "M1 & M2 Tier"}
            </p>
          </div>

          {/* Course Fee */}
          <div className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Fee</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{money(record.courseFeeTotal || 0)}</p>
            <p className="mt-1 text-xs text-slate-500">
              M1-2 (₹{cM1M2Rate}) + M3-5 (₹{cM3M5Rate})
            </p>
          </div>

          {/* Exam Fee */}
          <div className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-4">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Fee</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{money(record.examFeeTotal || 0)}</p>
            <p className="mt-1 text-xs text-slate-500">
              M1-2 (₹{eM1M2Rate}) + M3-5 (₹{eM3M5Rate})
            </p>
          </div>

          {/* Active Students */}
          <div className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
              <FontAwesomeIcon icon={faUserGraduate} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{record.studentCount}</p>
            <p className="mt-1 text-xs text-slate-500">
              M1-2: <span className="font-bold">{m1m2Count}</span> · M3-5: <span className="font-bold">{m3m5Count}</span>
            </p>
          </div>
        </section>

        {/* Itemized Fee Breakdown Table */}
        <section className="rounded-[30px] border border-white/80 bg-white/65 p-6 shadow-[0_18px_60px_rgba(31,38,135,.08)] backdrop-blur-xl">
          <h2 className="text-base font-extrabold text-slate-900 mb-4">
            Fee Assessment Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fee Component</th>
                  <th className="px-4 py-3">Student Count</th>
                  <th className="px-4 py-3">Rate per Student</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    Affiliation Fee ({record.affiliationType === "DEGREE" ? "Degree Tier" : "M1 & M2 Tier"})
                  </td>
                  <td className="px-4 py-3 text-slate-500">—</td>
                  <td className="px-4 py-3 text-slate-500">Base Institutional Fee</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {money(record.affiliationFee)}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Course Fee — Classes M1 &amp; M2</td>
                  <td className="px-4 py-3 text-slate-700 font-bold">{m1m2Count}</td>
                  <td className="px-4 py-3 text-slate-500">₹{cM1M2Rate} per student</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {money(m1m2Count * cM1M2Rate)}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Course Fee — Classes M3 to M5</td>
                  <td className="px-4 py-3 text-slate-700 font-bold">{m3m5Count}</td>
                  <td className="px-4 py-3 text-slate-500">₹{cM3M5Rate} per student</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {money(m3m5Count * cM3M5Rate)}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Exam Fee — Classes M1 &amp; M2</td>
                  <td className="px-4 py-3 text-slate-700 font-bold">{m1m2Count}</td>
                  <td className="px-4 py-3 text-slate-500">₹{eM1M2Rate} per student</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {money(m1m2Count * eM1M2Rate)}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">Exam Fee — Classes M3 to M5</td>
                  <td className="px-4 py-3 text-slate-700 font-bold">{m3m5Count}</td>
                  <td className="px-4 py-3 text-slate-500">₹{eM3M5Rate} per student</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right">
                    {money(m3m5Count * eM3M5Rate)}
                  </td>
                </tr>

                <tr className="bg-indigo-50/60 font-black text-indigo-900 text-base">
                  <td className="px-4 py-3.5" colSpan={3}>
                    Total Fee Payable
                  </td>
                  <td className="px-4 py-3.5 text-right">{money(record.totalDue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Payment History */}
        <section className="rounded-[30px] border border-white/80 bg-white/65 p-6 shadow-[0_18px_60px_rgba(31,38,135,.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Payment History</h2>
              <p className="mt-0.5 text-xs text-slate-500">Payments recorded by the administration.</p>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              Total Paid: {money(paid)}
            </span>
          </div>

          {record.payments?.length ? (
            <div className="divide-y divide-slate-200/70">
              {record.payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between text-sm"
                >
                  <div>
                    <span className="font-bold text-slate-900">{money(payment.amount)}</span>
                    <span className="ml-2 capitalize text-slate-500">
                      {payment.method} · {new Date(payment.paidOn).toLocaleDateString("en-IN")}
                    </span>
                    {payment.reference && (
                      <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        Ref: {payment.reference}
                      </span>
                    )}
                  </div>
                  {payment.notes && <p className="text-xs italic text-slate-500">{payment.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50/80 p-6 text-center text-sm text-slate-500">
              No payments have been recorded yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
