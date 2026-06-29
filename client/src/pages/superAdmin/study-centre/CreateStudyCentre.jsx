import {
  faBuilding,
  faKey,
  faLocationDot,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";

const inputClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

// --- Reusable field ---
const Field = ({ label, error, required, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
  </div>
);

// --- Section wrapper ---
const Section = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
    <h2 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-slate-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm text-white">
        <FontAwesomeIcon icon={icon} />
      </span>
      {title}
    </h2>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  </div>
);

function CreateStudyCentre() {
  const initialState = {
    studyCentreName: "",
    place: "",
    postOffice: "",
    district: "",
    state: "",
    pinCode: "",
    phone: "",
    branchImg: "",
    password: "",
    username: "",
    studyCentreCode: "",
    panchayath: "",
    affiliatedYear: "",
    email: "",
  };
  const [inputData, setInputData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res = await Axios.post("/study-centre", inputData);
      if (res.data) {
        setLoading(false);
        setInputData(initialState);
        setErrors({});
        toast.success("Study Centre Added Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message
          ? error.response.data.message
          : "Something went wrong",
        { autoClose: 3000, position: toast.POSITION.TOP_CENTER }
      );
      setErrors(error.response?.data || {});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* --- Hero Header --- */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <FontAwesomeIcon icon={faBuilding} className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Create Study Centre
              </h1>
              <p className="mt-1 text-slate-300">
                Register a new affiliated centre and its admin account.
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Centre Information */}
          <Section title="Centre Information" icon={faBuilding}>
            <Field label="Study Centre Name" error={errors.studyCentreName} required>
              <input
                className={inputClass}
                type="text"
                name="studyCentreName"
                value={inputData.studyCentreName}
                onChange={onChange}
                placeholder="e.g., Al Madeena Centre"
                required
              />
            </Field>
            <Field label="Study Centre Code" error={errors.studyCentreCode} required>
              <input
                className={inputClass}
                type="text"
                name="studyCentreCode"
                value={inputData.studyCentreCode}
                onChange={onChange}
                placeholder="e.g., MC-101"
                required
              />
            </Field>
            <Field label="Panchayath" error={errors.panchayath} required>
              <input
                className={inputClass}
                type="text"
                name="panchayath"
                value={inputData.panchayath}
                onChange={onChange}
                placeholder="Panchayath"
                required
              />
            </Field>
            <Field label="Affiliated Year" error={errors.affiliatedYear} required>
              <input
                className={inputClass}
                type="text"
                name="affiliatedYear"
                value={inputData.affiliatedYear}
                onChange={onChange}
                placeholder="e.g., 2024"
                required
              />
            </Field>
            <Field label="Email" error={errors.email} required>
              <input
                className={inputClass}
                type="email"
                name="email"
                value={inputData.email}
                onChange={onChange}
                placeholder="centre@example.com"
                required
              />
            </Field>
            <Field label="Phone Number" error={errors.phone} required>
              <input
                className={inputClass}
                type="text"
                name="phone"
                value={inputData.phone}
                onChange={onChange}
                placeholder="Phone number"
                required
              />
            </Field>
          </Section>

          {/* Location */}
          <Section title="Location Details" icon={faLocationDot}>
            <Field label="Place" error={errors.place} required>
              <input
                className={inputClass}
                type="text"
                name="place"
                value={inputData.place}
                onChange={onChange}
                placeholder="Place"
                required
              />
            </Field>
            <Field label="District" error={errors.district} required>
              <select
                name="district"
                onChange={onChange}
                value={inputData.district}
                className={inputClass}
                required
              >
                <option value="" hidden>
                  Select your district
                </option>
                {DISTRICT.map((district, index) => (
                  <option key={index} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Post Office" error={errors.postOffice} required>
              <input
                className={inputClass}
                type="text"
                name="postOffice"
                value={inputData.postOffice}
                onChange={onChange}
                placeholder="Post Office"
                required
              />
            </Field>
            <Field label="Pin Code" error={errors.pinCode} required>
              <input
                className={inputClass}
                type="text"
                name="pinCode"
                value={inputData.pinCode}
                onChange={onChange}
                placeholder="Pin Code"
                required
              />
            </Field>
            <Field label="State" error={errors.state} required>
              <input
                className={inputClass}
                type="text"
                name="state"
                value={inputData.state}
                onChange={onChange}
                placeholder="State"
                required
              />
            </Field>
          </Section>

          {/* Admin Credentials */}
          <Section title="Admin Credentials" icon={faKey}>
            <Field label="Admin Username" error={errors.username} required>
              <input
                className={inputClass}
                type="text"
                name="username"
                value={inputData.username}
                onChange={onChange}
                placeholder="Admin username"
                required
              />
            </Field>
            <Field label="Admin Password" error={errors.password} required>
              <input
                className={inputClass}
                type="text"
                name="password"
                value={inputData.password}
                onChange={onChange}
                placeholder="Admin password"
                required
              />
            </Field>
          </Section>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faPlus} spin={loading} />
              {loading ? "Processing..." : "Create Study Centre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStudyCentre;
