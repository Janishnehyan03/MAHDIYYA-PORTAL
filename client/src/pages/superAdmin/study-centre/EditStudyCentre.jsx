import { faPenToSquare, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";

const inputClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

function EditStudyCentre() {
  const initialState = {
    studyCentreName: "",
    studyCentreCode: "",
    panchayath: "",
    affiliatedYear: "",
    email: "",
    phone: "",
    place: "",
    postOffice: "",
    pinCode: "",
    district: "",
    state: "",
    currentPrincipal: "",
    principalContactNumber: "",
    username: "",
    password: "",
    isActive: true,
  };
  const [inputData, setInputData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await Axios.get(`/study-centre/${id}`);
        setInputData(data?.data ?? data);
      } catch (err) {
        toast.error("Failed to fetch initial data", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
      }
    };
    if (id) fetchData();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.patch(`/study-centre/${id}`, inputData);
      if (res.status === 200) {
        toast.success("Branch Edited Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
        navigate("/study-centres");
      }
    } catch (error) {
      toast.error("Something went wrong", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
      setErrors(error?.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Study Centre Name", name: "studyCentreName", type: "text", required: true },
    { label: "Study Centre Code", name: "studyCentreCode", type: "text", required: true },
    { label: "Panchayath", name: "panchayath", type: "text" },
    { label: "Affiliated Year", name: "affiliatedYear", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone Number", name: "phone", type: "text" },
    { label: "Place", name: "place", type: "text" },
    { label: "Post Office", name: "postOffice", type: "text" },
    { label: "Pin Code", name: "pinCode", type: "text" },
    { label: "State", name: "state", type: "text" },
    { label: "District", name: "district", type: "select", options: DISTRICT },
    { label: "Principal's Name", name: "currentPrincipal", type: "text" },
    { label: "Principal Contact Number", name: "principalContactNumber", type: "text" },
    { label: "Admin Username", name: "username", type: "text" },
    { label: "Admin Password", name: "password", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* --- Hero Header --- */}
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
              <FontAwesomeIcon icon={faPenToSquare} className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Edit Study Centre
              </h1>
              <p className="mt-1 text-slate-300">
                {inputData.studyCentreName || "Update centre information."}
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-0.5 text-rose-500">*</span>
                  )}
                  {errors[field.name] && (
                    <span className="ml-1 text-xs font-medium text-rose-500">
                      {errors[field.name]}
                    </span>
                  )}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={inputData[field.name] || ""}
                    onChange={onChange}
                    required={field.required}
                    className={inputClass}
                  >
                    <option value="" hidden>
                      Select {field.label}
                    </option>
                    {field.options?.map((opt, idx) => (
                      <option value={opt} key={idx}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={inputData[field.name] || ""}
                    onChange={onChange}
                    required={field.required}
                    className={inputClass}
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Active toggle */}
          <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Active Status
              </p>
              <p className="text-xs text-slate-500">
                {inputData.isActive
                  ? "This centre is currently active."
                  : "This centre is currently inactive."}
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={!!inputData.isActive}
                onChange={onChange}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FontAwesomeIcon
                icon={loading ? faSpinner : faPenToSquare}
                spin={loading}
              />
              {loading ? "Processing..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudyCentre;
