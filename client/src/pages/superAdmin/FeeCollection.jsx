import React, { useCallback, useEffect, useMemo, useState } from "react";
import Axios from "../../Axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendDown,
  faArrowTrendUp,
  faBuildingColumns,
  faCalendarDays,
  faDownload,
  faFileInvoiceDollar,
  faGraduationCap,
  faIndianRupeeSign,
  faPlus,
  faReceipt,
  faRotate,
  faSearch,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const statusStyle = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  pending: "bg-rose-50 text-rose-700 ring-rose-200",
};

const Status = ({ value }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${
      statusStyle[value] || statusStyle.pending
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {value || "pending"}
  </span>
);

export default function FeeCollection() {
  const [year, setYear] = useState("");
  const [rate, setRate] = useState({
    affiliationFeeM1M2: "1000",
    affiliationFeeDegree: "1500",
    courseFeeM1M2: "600",
    courseFeeM3M5: "700",
    examFeeM1M2: "150",
    examFeeM3M5: "200",
  });
  const [data, setData] = useState({ rates: [], collections: [] });
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: response } = await Axios.get(
        `/fee-collection${year ? `?academicYear=${encodeURIComponent(year)}` : ""}`
      );
      setData(response);
      if (response.rates && response.rates.length > 0 && !year) {
        const latestRate = response.rates[0];
        setYear(latestRate.academicYear || "");
        setRate({
          affiliationFeeM1M2: String(latestRate.affiliationFeeM1M2 ?? 1000),
          affiliationFeeDegree: String(latestRate.affiliationFeeDegree ?? 1500),
          courseFeeM1M2: String(latestRate.courseFeeM1M2 ?? 600),
          courseFeeM3M5: String(latestRate.courseFeeM3M5 ?? 700),
          examFeeM1M2: String(latestRate.examFeeM1M2 ?? 150),
          examFeeM3M5: String(latestRate.examFeeM3M5 ?? 200),
        });
      }
    } catch (e) {
      setError(e.response?.data?.message || "We couldn't load the fee ledger. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    return data.collections.reduce(
      (result, row) => {
        const paid = row.payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
        return {
          due: result.due + (row.totalDue || 0),
          paid: result.paid + paid,
          affiliation: result.affiliation + (row.affiliationFee || 0),
          course: result.course + (row.courseFeeTotal || 0),
          exam: result.exam + (row.examFeeTotal || 0),
          students: result.students + (row.studentCount || 0),
        };
      },
      { due: 0, paid: 0, affiliation: 0, course: 0, exam: 0, students: 0 }
    );
  }, [data]);

  const statusCounts = useMemo(() => {
    return data.collections.reduce(
      (acc, row) => {
        acc.all++;
        const paid = row.payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
        const status =
          row.totalDue > 0 && paid >= row.totalDue
            ? "paid"
            : paid > 0
            ? "partial"
            : row.status || "pending";
        if (status === "paid") acc.paid++;
        else if (status === "partial") acc.partial++;
        else acc.pending++;
        return acc;
      },
      { all: 0, pending: 0, partial: 0, paid: 0 }
    );
  }, [data.collections]);

  const filteredCollections = useMemo(() => {
    return data.collections.filter((row) => {
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchName = row.studyCentre?.studyCentreName?.toLowerCase().includes(term);
        const matchCode = row.studyCentre?.studyCentreCode?.toLowerCase().includes(term);
        if (!matchName && !matchCode) return false;
      }
      if (statusFilter !== "all") {
        const paid = row.payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
        const effectiveStatus =
          row.totalDue > 0 && paid >= row.totalDue
            ? "paid"
            : paid > 0
            ? "partial"
            : row.status || "pending";
        if (effectiveStatus !== statusFilter) return false;
      }
      if (tierFilter !== "all") {
        if (row.affiliationType !== tierFilter) return false;
      }
      return true;
    });
  }, [data.collections, search, statusFilter, tierFilter]);

  const exportCSV = () => {
    if (!filteredCollections.length) return;
    const headers = [
      "Study Centre",
      "Centre Code",
      "Tier",
      "Students Count",
      "Affiliation Fee (Rs)",
      "Course Fee (Rs)",
      "Exam Fee (Rs)",
      "Total Due (Rs)",
      "Paid (Rs)",
      "Outstanding (Rs)",
      "Status",
    ];
    const rows = filteredCollections.map((row) => {
      const paid = row.payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const outstanding = Math.max((row.totalDue || 0) - paid, 0);
      return [
        `"${row.studyCentre?.studyCentreName || ""}"`,
        `"${row.studyCentre?.studyCentreCode || ""}"`,
        row.affiliationType === "DEGREE" ? "Degree Tier" : "M1 & M2 Tier",
        row.studentCount || 0,
        row.affiliationFee || 0,
        row.courseFeeTotal || 0,
        row.examFeeTotal || 0,
        row.totalDue || 0,
        paid,
        outstanding,
        row.status || "pending",
      ];
    });
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fee_Ledger_${year || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveRate = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\d{4}-\d{2,4}$/.test(year.trim())) {
      return setError("Enter a valid academic year, for example 2026-27.");
    }
    const aff1 = Number(rate.affiliationFeeM1M2);
    const aff2 = Number(rate.affiliationFeeDegree);
    const c1 = Number(rate.courseFeeM1M2);
    const c2 = Number(rate.courseFeeM3M5);
    const e1 = Number(rate.examFeeM1M2);
    const e2 = Number(rate.examFeeM3M5);

    if (
      isNaN(aff1) || aff1 < 0 ||
      isNaN(aff2) || aff2 < 0 ||
      isNaN(c1) || c1 < 0 ||
      isNaN(c2) || c2 < 0 ||
      isNaN(e1) || e1 < 0 ||
      isNaN(e2) || e2 < 0
    ) {
      return setError("Enter all fee amounts as zero or a positive number.");
    }

    setSaving(true);
    try {
      await Axios.post("/fee-collection/rates", {
        academicYear: year.trim(),
        affiliationFeeM1M2: aff1,
        affiliationFeeDegree: aff2,
        courseFeeM1M2: c1,
        courseFeeM3M5: c2,
        examFeeM1M2: e1,
        examFeeM3M5: e2,
      });
      await Axios.post("/fee-collection/calculate", { academicYear: year.trim() });
      toast.success("Fee schedule published and ledger calculated for all centres");
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message || "The fee schedule could not be published. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const savePayment = async (event) => {
    event.preventDefault();
    const amount = Number(payment.form.amount);
    if (!amount || amount <= 0) {
      return setPayment({ ...payment, error: "Enter a payment amount greater than zero." });
    }
    setPayment({ ...payment, saving: true, error: "" });
    try {
      await Axios.post(`/fee-collection/${payment._id}/payments`, { ...payment.form, amount });
      toast.success("Payment recorded successfully");
      setPayment(null);
      await load();
    } catch (e) {
      setPayment({
        ...payment,
        saving: false,
        error: e.response?.data?.message || "Payment could not be recorded. Please try again.",
      });
    }
  };

  const updateRate = (key, value) => setRate((current) => ({ ...current, [key]: value }));

  return (
    <div className="min-h-full overflow-hidden bg-[#f4f7fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-[1550px] p-5 md:p-8 xl:p-10">
        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/60 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.15)]" />
              Finance Workspace
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Fee Collection</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Configure and calculate Affiliation Fees, Course Fees, and Exam Fees across all active study centres.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/65 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faRotate} spin={loading} /> Refresh Ledger
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-800 shadow-sm"
          >
            <span className="mt-0.5 font-black text-rose-600">!</span>
            <div>
              <p className="font-bold">Attention</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Rate publisher card */}
        <section className="mb-8 rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_18px_60px_rgba(31,38,135,.08)] backdrop-blur-xl md:p-8">
          {/* Top Header & Session Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/70">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                <FontAwesomeIcon icon={faCalendarDays} size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Fee Schedule &amp; Rate Configurator
                  </h2>
                  {year && (
                    <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      Active: {year}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Configure institutional baseline and per-student rates by class tier to recalculate all study centre accounts.
                </p>
              </div>
            </div>

            {/* Academic Session Selector & Publish Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Year:</span>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025-26"
                  className="w-24 text-sm font-black text-slate-800 outline-none bg-transparent"
                />
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  {["2025-26", "2026-27"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setYear(preset)}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                        year === preset
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                form="fee-rates-form"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FontAwesomeIcon icon={saving ? faRotate : faPlus} spin={saving} />
                {saving ? "Calculating Ledger…" : "Publish & Calculate"}
              </button>
            </div>
          </div>

          <form id="fee-rates-form" onSubmit={saveRate} className="pt-6">
            {/* Desktop Fee Matrix Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Fee Category</th>
                    <th className="py-3.5 px-4">Billing Scope</th>
                    <th className="py-3.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-blue-700 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        M1 &amp; M2 Classes (CMS)
                      </div>
                    </th>
                    <th className="py-3.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200/60 px-3 py-1 text-purple-700 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        M3 to M5 Classes (Degree)
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 text-sm">
                  {/* Row 1: Affiliation Fee */}
                  <tr className="transition hover:bg-slate-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FontAwesomeIcon icon={faBuildingColumns} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800">Affiliation Fee</p>
                          <p className="text-xs text-slate-400">Baseline registration fee charged once per centre</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        Per Centre
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="mx-auto flex max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                        <span className="mr-1.5 text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={rate.affiliationFeeM1M2}
                          onChange={(e) => updateRate("affiliationFeeM1M2", e.target.value)}
                          placeholder="1000"
                          className="w-full text-center text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="mx-auto flex max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                        <span className="mr-1.5 text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={rate.affiliationFeeDegree}
                          onChange={(e) => updateRate("affiliationFeeDegree", e.target.value)}
                          placeholder="1500"
                          className="w-full text-center text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Course Fee */}
                  <tr className="transition hover:bg-slate-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <FontAwesomeIcon icon={faGraduationCap} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800">Course Fee</p>
                          <p className="text-xs text-slate-400">Annual curriculum tuition assessed for active students</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Per Student
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="mx-auto flex max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                        <span className="mr-1.5 text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={rate.courseFeeM1M2}
                          onChange={(e) => updateRate("courseFeeM1M2", e.target.value)}
                          placeholder="600"
                          className="w-full text-center text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="mx-auto flex max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                        <span className="mr-1.5 text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={rate.courseFeeM3M5}
                          onChange={(e) => updateRate("courseFeeM3M5", e.target.value)}
                          placeholder="700"
                          className="w-full text-center text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Row 3: Exam Fee */}
                  <tr className="transition hover:bg-slate-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                          <FontAwesomeIcon icon={faFileInvoiceDollar} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800">Exam Fee</p>
                          <p className="text-xs text-slate-400">Central board examination &amp; grading fee</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                        Per Student
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="mx-auto flex max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                        <span className="mr-1.5 text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={rate.examFeeM1M2}
                          onChange={(e) => updateRate("examFeeM1M2", e.target.value)}
                          placeholder="150"
                          className="w-full text-center text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="mx-auto flex max-w-[180px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                        <span className="mr-1.5 text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={rate.examFeeM3M5}
                          onChange={(e) => updateRate("examFeeM3M5", e.target.value)}
                          placeholder="200"
                          className="w-full text-center text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Row 4: Summary / Live Calculation Preview */}
                  <tr className="bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 font-black">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2 text-indigo-900">
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Combined Student Liability
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-indigo-600">
                      Course + Exam
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="text-base font-black text-indigo-700">
                        ₹{(Number(rate.courseFeeM1M2) || 0) + (Number(rate.examFeeM1M2) || 0)}
                      </span>
                      <span className="ml-1 text-[11px] font-semibold text-slate-400">/ student</span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="text-base font-black text-purple-700">
                        ₹{(Number(rate.courseFeeM3M5) || 0) + (Number(rate.examFeeM3M5) || 0)}
                      </span>
                      <span className="ml-1 text-[11px] font-semibold text-slate-400">/ student</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Layout (< 768px) */}
            <div className="md:hidden space-y-4">
              {/* M1 & M2 Tier Card */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/30 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <h3 className="font-extrabold text-sm text-blue-900">M1 &amp; M2 Classes (CMS)</h3>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700">Junior Tier</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Affiliation (Centre)</span>
                    <div className="flex w-32 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-xs text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={rate.affiliationFeeM1M2}
                        onChange={(e) => updateRate("affiliationFeeM1M2", e.target.value)}
                        className="w-full text-right text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Course Fee / Student</span>
                    <div className="flex w-32 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-xs text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={rate.courseFeeM1M2}
                        onChange={(e) => updateRate("courseFeeM1M2", e.target.value)}
                        className="w-full text-right text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Exam Fee / Student</span>
                    <div className="flex w-32 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-xs text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={rate.examFeeM1M2}
                        onChange={(e) => updateRate("examFeeM1M2", e.target.value)}
                        className="w-full text-right text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* M3 to M5 Tier Card */}
              <div className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600" />
                    <h3 className="font-extrabold text-sm text-purple-900">M3 to M5 Classes (Degree)</h3>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700">Senior Tier</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Affiliation (Centre)</span>
                    <div className="flex w-32 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-xs text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={rate.affiliationFeeDegree}
                        onChange={(e) => updateRate("affiliationFeeDegree", e.target.value)}
                        className="w-full text-right text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Course Fee / Student</span>
                    <div className="flex w-32 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-xs text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={rate.courseFeeM3M5}
                        onChange={(e) => updateRate("courseFeeM3M5", e.target.value)}
                        className="w-full text-right text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Exam Fee / Student</span>
                    <div className="flex w-32 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-xs text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={rate.examFeeM3M5}
                        onChange={(e) => updateRate("examFeeM3M5", e.target.value)}
                        className="w-full text-right text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Helper */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                  i
                </span>
                <span>
                  Total Due = Affiliation Fee + (Students × Course Fee) + (Students × Exam Fee)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setRate({
                      affiliationFeeM1M2: "1000",
                      affiliationFeeDegree: "1500",
                      courseFeeM1M2: "600",
                      courseFeeM3M5: "700",
                      examFeeM1M2: "150",
                      examFeeM3M5: "200",
                    })
                  }
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  Reset Standard Defaults
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="sm:hidden inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-indigo-600/25"
                >
                  <FontAwesomeIcon icon={saving ? faRotate : faPlus} spin={saving} />
                  {saving ? "Publishing…" : "Publish Schedule"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Global Summary Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Assessed Dues */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-5 shadow-[0_12px_40px_rgba(31,38,135,.07)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                <FontAwesomeIcon icon={faIndianRupeeSign} />
              </div>
              <span className="rounded-full bg-indigo-50/80 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                {data.collections.length} Centres
              </span>
            </div>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">Total Assessed Dues</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{money(totals.due)}</p>
            <p className="mt-1.5 text-xs text-slate-500">Total institutional receivables</p>
          </div>

          {/* Card 2: Total Collected */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-5 shadow-[0_12px_40px_rgba(31,38,135,.07)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                <FontAwesomeIcon icon={faArrowTrendUp} />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                {totals.due ? Math.round((totals.paid / totals.due) * 100) : 0}% Collected
              </span>
            </div>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">Total Collected</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-emerald-600">{money(totals.paid)}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${totals.due ? Math.min(Math.round((totals.paid / totals.due) * 100), 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Card 3: Total Outstanding */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-5 shadow-[0_12px_40px_rgba(31,38,135,.07)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                <FontAwesomeIcon icon={faArrowTrendDown} />
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                Balance Pending
              </span>
            </div>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">Outstanding Balance</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-amber-600">{money(totals.due - totals.paid)}</p>
            <p className="mt-1.5 text-xs text-slate-500">Amount to be collected</p>
          </div>

          {/* Card 4: Enrolled Students */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 p-5 shadow-[0_12px_40px_rgba(31,38,135,.07)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                <FontAwesomeIcon icon={faUserGraduate} />
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                Active Enrolment
              </span>
            </div>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">Enrolled Students</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{totals.students}</p>
            <p className="mt-1.5 text-[11px] text-slate-500 truncate">
              Affiliation: {money(totals.affiliation)} · Course: {money(totals.course)} · Exam: {money(totals.exam)}
            </p>
          </div>
        </section>

        {/* Ledger Section */}
        <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/70 shadow-[0_18px_60px_rgba(31,38,135,.08)] backdrop-blur-xl">
          {/* Header & Controls */}
          <div className="border-b border-slate-200/70 p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Study Centre Ledger</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Track payments, outstanding balances, and fee components for each institution.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {year && (
                  <span className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
                    Session: {year}
                  </span>
                )}
                <button
                  type="button"
                  onClick={exportCSV}
                  disabled={!filteredCollections.length}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
                  title="Export current view to CSV"
                >
                  <FontAwesomeIcon icon={faDownload} /> Export CSV
                </button>
              </div>
            </div>

            {/* Status Tabs & Filters Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl w-fit">
                {[
                  { id: "all", label: "All Centres", count: statusCounts.all },
                  { id: "pending", label: "Pending", count: statusCounts.pending, color: "text-rose-700" },
                  { id: "partial", label: "Partial", count: statusCounts.partial, color: "text-amber-700" },
                  { id: "paid", label: "Paid", count: statusCounts.paid, color: "text-emerald-700" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      statusFilter === tab.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        statusFilter === tab.id ? "bg-slate-100 text-slate-800" : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tier Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400"
                >
                  <option value="all">All Tiers</option>
                  <option value="DEGREE">Degree Tier Centres</option>
                  <option value="M1_M2">M1 &amp; M2 Tier Centres</option>
                </select>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Search centre name or code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56 sm:w-64 rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-semibold outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100/80" />
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <FontAwesomeIcon icon={faReceipt} size="lg" />
              </div>
              <h3 className="font-bold text-slate-800">No centres found</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {search || statusFilter !== "all" || tierFilter !== "all"
                  ? "No study centres match your active filters. Try resetting the filters."
                  : "Publish a schedule for an academic year to generate the centre ledger."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th className="px-6 py-3.5">Study Centre</th>
                    <th className="px-4 py-3.5">Tier &amp; Students</th>
                    <th className="px-4 py-3.5">Assessed Due</th>
                    <th className="px-4 py-3.5">Paid</th>
                    <th className="px-4 py-3.5">Outstanding</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {filteredCollections.map((row) => {
                    const paid = row.payments?.reduce((sum, item) => sum + item.amount, 0) || 0;
                    const outstanding = Math.max(row.totalDue - paid, 0);
                    const isDegree = row.affiliationType === "DEGREE";

                    return (
                      <tr key={row._id} className="transition hover:bg-indigo-50/30">
                        {/* 1. Study Centre */}
                        <td className="px-6 py-4">
                          <Link
                            to={`/fee-collection/centre/${row.studyCentre?._id}`}
                            className="group flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-indigo-600 group-hover:text-white">
                              <FontAwesomeIcon icon={faBuildingColumns} />
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-slate-900 transition group-hover:text-indigo-600 line-clamp-1">
                                {row.studyCentre?.studyCentreName || "Unknown centre"}
                              </p>
                              <p className="text-xs font-semibold text-slate-400">
                                {row.studyCentre?.studyCentreCode || "No code"}
                              </p>
                            </div>
                          </Link>
                        </td>

                        {/* 2. Tier & Students */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              isDegree
                                ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                                : "bg-blue-50 text-blue-700 border border-blue-200/60"
                            }`}
                          >
                            {isDegree ? "Degree Tier" : "M1-M2 Tier"}
                          </span>
                          <p className="mt-1 text-xs font-bold text-slate-800">
                            {row.studentCount} {row.studentCount === 1 ? "student" : "students"}
                          </p>
                        </td>

                        {/* 3. Assessed Due & Breakdown */}
                        <td className="px-4 py-4">
                          <p className="text-sm font-black text-slate-900">{money(row.totalDue)}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Affiliation: {money(row.affiliationFee)}
                            {(row.courseFeeTotal > 0 || row.examFeeTotal > 0) && (
                              <span> · Course: {money(row.courseFeeTotal)} · Exam: {money(row.examFeeTotal)}</span>
                            )}
                          </p>
                        </td>

                        {/* 4. Paid */}
                        <td className="px-4 py-4">
                          <p className="text-sm font-black text-emerald-600">{money(paid)}</p>
                          <p className="text-[11px] text-slate-400">
                            {row.payments?.length
                              ? `${row.payments.length} instalment${row.payments.length === 1 ? "" : "s"}`
                              : "No payments"}
                          </p>
                        </td>

                        {/* 5. Outstanding */}
                        <td className="px-4 py-4">
                          {outstanding === 0 ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                              ✓ Cleared
                            </span>
                          ) : (
                            <span className="text-sm font-black text-amber-600">
                              {money(outstanding)}
                            </span>
                          )}
                        </td>

                        {/* 6. Status */}
                        <td className="px-4 py-4">
                          <Status value={row.status} />
                        </td>

                        {/* 7. Action */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setPayment({
                                  _id: row._id,
                                  studyCentreName: row.studyCentre?.studyCentreName,
                                  totalDue: row.totalDue,
                                  paid,
                                  form: { amount: "", method: "bank", reference: "", notes: "" },
                                  error: "",
                                })
                              }
                              className="whitespace-nowrap rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                            >
                              Record Payment
                            </button>
                            <Link
                              to={`/fee-collection/centre/${row.studyCentre?._id}`}
                              className="whitespace-nowrap rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                            >
                              Details →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Record Payment Modal */}
      {payment && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <form
            onSubmit={savePayment}
            className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Ledger Entry</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Record Payment</h2>
                <p className="mt-1 text-xs text-slate-500 font-semibold">{payment.studyCentreName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPayment(null)}
                className="rounded-xl p-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-indigo-50/70 p-3 text-xs flex justify-between font-bold text-indigo-900">
              <span>Total Due: {money(payment.totalDue)}</span>
              <span>Paid: {money(payment.paid)}</span>
              <span className="text-amber-700">Balance: {money(payment.totalDue - payment.paid)}</span>
            </div>

            {payment.error && (
              <div role="alert" className="mb-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                {payment.error}
              </div>
            )}

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount (₹)
              <input
                autoFocus
                required
                type="number"
                min="1"
                max={Math.max(payment.totalDue - payment.paid, 1)}
                value={payment.form.amount}
                onChange={(e) => setPayment({ ...payment, form: { ...payment.form, amount: e.target.value } })}
                placeholder="Enter amount"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Method
                <select
                  value={payment.form.method}
                  onChange={(e) => setPayment({ ...payment, form: { ...payment.form, method: e.target.value } })}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-indigo-400"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reference
                <input
                  value={payment.form.reference}
                  onChange={(e) => setPayment({ ...payment, form: { ...payment.form, reference: e.target.value } })}
                  placeholder="Txn ID / Ref"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Notes
              <textarea
                rows="3"
                value={payment.form.notes}
                onChange={(e) => setPayment({ ...payment, form: { ...payment.form, notes: e.target.value } })}
                placeholder="Add audit note..."
                className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPayment(null)}
                className="rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={payment.saving}
                className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-60"
              >
                {payment.saving ? "Saving…" : "Save Payment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
