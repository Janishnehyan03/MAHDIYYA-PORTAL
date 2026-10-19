import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBuildingColumns,
  faCalendarDays,
  faFileInvoiceDollar,
  faGraduationCap,
  faPlus,
  faReceipt,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "../../Axios";
import { toast } from "react-toastify";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const statusStyle = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  pending: "bg-rose-50 text-rose-700 ring-rose-200",
};

const Status = ({ value }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusStyle[value] || statusStyle.pending}`}>
    {value || "pending"}
  </span>
);

export default function FeeCentreDetails() {
  const { centreId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [paymentModal, setPaymentModal] = useState(null);

  const loadData = () => {
    Axios.get(`/fee-collection/centre/${centreId}`)
      .then(({ data: response }) => setData(response))
      .catch((e) => setError(e.response?.data?.message || "Unable to load this centre's fee details."));
  };

  useEffect(() => {
    loadData();
  }, [centreId]);

  const totals = useMemo(
    () =>
      (data?.statements || []).reduce(
        (result, item) => ({
          due: result.due + (item.totalDue || 0),
          paid: result.paid + (item.paid || 0),
        }),
        { due: 0, paid: 0 }
      ),
    [data]
  );

  const savePayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentModal.form.amount);
    if (!amount || amount <= 0) {
      return setPaymentModal({ ...paymentModal, error: "Enter a payment amount greater than zero." });
    }
    setPaymentModal({ ...paymentModal, saving: true, error: "" });
    try {
      await Axios.post(`/fee-collection/${paymentModal.statementId}/payments`, {
        ...paymentModal.form,
        amount,
      });
      toast.success("Payment recorded successfully");
      setPaymentModal(null);
      loadData();
    } catch (err) {
      setPaymentModal({
        ...paymentModal,
        saving: false,
        error: err.response?.data?.message || "Failed to record payment.",
      });
    }
  };

  if (error) {
    return (
      <main className="min-h-full bg-[#f4f7fb] p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h1 className="font-bold">Unable to load fee details</h1>
          <p className="mt-1 text-sm">{error}</p>
          <Link to="/fee-collection" className="mt-4 inline-block font-bold text-indigo-700">
            ← Back to fee collection
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-full bg-[#f4f7fb] p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="h-40 rounded-3xl bg-white/70" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full overflow-hidden bg-[#f4f7fb] p-5 md:p-8 xl:p-10 text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Link
          to="/fee-collection"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to fee collection
        </Link>

        {/* Centre Profile Card */}
        <section className="rounded-[28px] border border-white/80 bg-white/65 p-6 shadow-[0_18px_60px_rgba(31,38,135,.09)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <FontAwesomeIcon icon={faBuildingColumns} size="lg" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Study Centre Fee Profile
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight">
                  {data.studyCentre?.studyCentreName}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Code: <span className="font-bold text-slate-700">{data.studyCentre?.studyCentreCode}</span> ·{" "}
                  {data.studyCentre?.district || "District not set"}{" "}
                  {data.studyCentre?.state ? `, ${data.studyCentre.state}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center md:text-right">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Dues</p>
                <p className="mt-1 text-xl font-black">{money(totals.due)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Collected</p>
                <p className="mt-1 text-xl font-black text-emerald-600">{money(totals.paid)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outstanding</p>
                <p className="mt-1 text-xl font-black text-amber-600">{money(totals.due - totals.paid)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Statements */}
        <div className="mt-7 space-y-6">
          {data.statements.map((statement) => {
            const m1m2Count = statement.m1m2StudentCount || 0;
            const m3m5Count = statement.m3m5StudentCount || 0;
            const cM1M2Rate = statement.courseFeeM1M2 || 600;
            const cM3M5Rate = statement.courseFeeM3M5 || 700;
            const eM1M2Rate = statement.examFeeM1M2 || 150;
            const eM3M5Rate = statement.examFeeM3M5 || 200;

            return (
              <section
                key={statement._id}
                className="overflow-hidden rounded-[28px] border border-white/80 bg-white/65 shadow-[0_18px_60px_rgba(31,38,135,.08)] backdrop-blur-xl"
              >
                {/* Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-slate-200/70 p-5 md:flex-row md:items-center md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <FontAwesomeIcon icon={faCalendarDays} />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-lg text-slate-900">
                        Academic Year {statement.academicYear}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Calculated {new Date(statement.calculatedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Status value={statement.status} />
                    {statement.outstanding > 0 && (
                      <button
                        onClick={() =>
                          setPaymentModal({
                            statementId: statement._id,
                            academicYear: statement.academicYear,
                            outstanding: statement.outstanding,
                            form: { amount: "", method: "bank", reference: "", notes: "" },
                            error: "",
                          })
                        }
                        className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-1.5" /> Record Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 md:p-6">
                  {/* Active Students */}
                  <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-indigo-500" /> Active Students
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900">{statement.studentCount}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      M1 &amp; M2: <span className="font-bold">{m1m2Count}</span> · M3 to M5: <span className="font-bold">{m3m5Count}</span>
                    </p>
                  </div>

                  {/* Affiliation Fee */}
                  <div className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                      <FontAwesomeIcon icon={faBuildingColumns} /> Affiliation Fee
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900">{money(statement.affiliationFee)}</p>
                    <p className="mt-1 text-xs text-blue-600 font-semibold">
                      {statement.affiliationType === "DEGREE" ? "Degree Tier (₹1,500)" : "M1 & M2 Tier (₹1,000)"}
                    </p>
                  </div>

                  {/* Course Fee */}
                  <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                      <FontAwesomeIcon icon={faGraduationCap} /> Course Fee Total
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900">{money(statement.courseFeeTotal || 0)}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      M1-2 (₹{cM1M2Rate}) + M3-5 (₹{cM3M5Rate})
                    </p>
                  </div>

                  {/* Exam Fee */}
                  <div className="rounded-2xl border border-purple-200/70 bg-purple-50/40 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} /> Exam Fee Total
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900">{money(statement.examFeeTotal || 0)}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      M1-2 (₹{eM1M2Rate}) + M3-5 (₹{eM3M5Rate})
                    </p>
                  </div>
                </div>

                {/* Itemized Assessment Table */}
                <div className="px-5 md:px-6 pb-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Fee Breakdown &amp; Calculation
                    </h3>
                    <div className="divide-y divide-slate-200/80 text-sm">
                      <div className="flex justify-between py-2 text-slate-700">
                        <span>
                          Affiliation Fee ({statement.affiliationType === "DEGREE" ? "Degree Tier" : "M1 & M2 Tier"})
                        </span>
                        <span className="font-bold text-slate-900">{money(statement.affiliationFee)}</span>
                      </div>
                      <div className="flex justify-between py-2 text-slate-700">
                        <span>
                          Course Fee — M1 &amp; M2 ({m1m2Count} student{m1m2Count === 1 ? "" : "s"} × ₹{cM1M2Rate})
                        </span>
                        <span className="font-bold text-slate-900">{money(m1m2Count * cM1M2Rate)}</span>
                      </div>
                      <div className="flex justify-between py-2 text-slate-700">
                        <span>
                          Course Fee — M3 to M5 ({m3m5Count} student{m3m5Count === 1 ? "" : "s"} × ₹{cM3M5Rate})
                        </span>
                        <span className="font-bold text-slate-900">{money(m3m5Count * cM3M5Rate)}</span>
                      </div>
                      <div className="flex justify-between py-2 text-slate-700">
                        <span>
                          Exam Fee — M1 &amp; M2 ({m1m2Count} student{m1m2Count === 1 ? "" : "s"} × ₹{eM1M2Rate})
                        </span>
                        <span className="font-bold text-slate-900">{money(m1m2Count * eM1M2Rate)}</span>
                      </div>
                      <div className="flex justify-between py-2 text-slate-700">
                        <span>
                          Exam Fee — M3 to M5 ({m3m5Count} student{m3m5Count === 1 ? "" : "s"} × ₹{eM3M5Rate})
                        </span>
                        <span className="font-bold text-slate-900">{money(m3m5Count * eM3M5Rate)}</span>
                      </div>
                      <div className="flex justify-between py-2.5 text-base font-black text-indigo-700 border-t-2 border-slate-300">
                        <span>Total Due</span>
                        <span>{money(statement.totalDue)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="border-t border-slate-200/70 p-5 md:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="text-slate-400" />
                    <h3 className="text-sm font-extrabold text-slate-900">Payment History</h3>
                    <span className="ml-auto text-sm font-bold text-emerald-600">
                      Total Paid: {money(statement.paid)}
                    </span>
                  </div>

                  {statement.payments && statement.payments.length ? (
                    <div className="divide-y divide-slate-200/70">
                      {statement.payments.map((p) => (
                        <div
                          key={p._id}
                          className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{money(p.amount)}</span>
                            <span className="ml-2 capitalize text-slate-500">
                              {p.method} · {new Date(p.paidOn).toLocaleDateString("en-IN")}
                            </span>
                            {p.reference && (
                              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                Ref: {p.reference}
                              </span>
                            )}
                          </div>
                          {p.notes && <span className="text-xs italic text-slate-500">{p.notes}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No payments recorded for this academic year.</p>
                  )}

                  <div className="mt-4 flex justify-between border-t border-slate-200/70 pt-4 text-sm">
                    <span className="font-bold text-slate-600">Outstanding Balance</span>
                    <strong className="text-lg font-black text-amber-600">{money(statement.outstanding)}</strong>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <form
            onSubmit={savePayment}
            className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Fee Entry</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Record Payment</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Academic Year: {paymentModal.academicYear}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="rounded-xl p-2 text-xl leading-none text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800 flex justify-between">
              <span>Outstanding: {money(paymentModal.outstanding)}</span>
            </div>

            {paymentModal.error && (
              <div role="alert" className="mb-4 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
                {paymentModal.error}
              </div>
            )}

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount (₹)
              <input
                autoFocus
                required
                type="number"
                min="1"
                max={paymentModal.outstanding}
                value={paymentModal.form.amount}
                onChange={(e) =>
                  setPaymentModal({
                    ...paymentModal,
                    form: { ...paymentModal.form, amount: e.target.value },
                  })
                }
                placeholder="Enter payment amount"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Method
                <select
                  value={paymentModal.form.method}
                  onChange={(e) =>
                    setPaymentModal({
                      ...paymentModal,
                      form: { ...paymentModal.form, method: e.target.value },
                    })
                  }
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
                  value={paymentModal.form.reference}
                  onChange={(e) =>
                    setPaymentModal({
                      ...paymentModal,
                      form: { ...paymentModal.form, reference: e.target.value },
                    })
                  }
                  placeholder="Txn ID / Ref"
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Notes
              <textarea
                rows="3"
                value={paymentModal.form.notes}
                onChange={(e) =>
                  setPaymentModal({
                    ...paymentModal,
                    form: { ...paymentModal.form, notes: e.target.value },
                  })
                }
                placeholder="Audit notes or remarks..."
                className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={paymentModal.saving}
                className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-60"
              >
                {paymentModal.saving ? "Saving…" : "Save Payment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
