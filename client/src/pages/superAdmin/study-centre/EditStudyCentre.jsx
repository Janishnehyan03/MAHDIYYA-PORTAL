import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";

// Update requirements based on your backend model's required fields.
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

  // Set required based on model: true = required, false = optional
  const fields = [
    {
      label: "Study Centre Name",
      name: "studyCentreName",
      type: "text",
      required: true,
    },
    {
      label: "Study Centre Code",
      name: "studyCentreCode",
      type: "text",
      required: true,
    },
    {
      label: "Panchayath",
      name: "panchayath",
      type: "text",
      required: false,
    },
    {
      label: "Affiliated Year",
      name: "affiliatedYear",
      type: "text",
      required: false,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
    },
    {
      label: "Phone Number",
      name: "phone",
      type: "text",
      required: false,
    },
    {
      label: "Place",
      name: "place",
      type: "text",
      required: false,
    },
    {
      label: "Post Office",
      name: "postOffice",
      type: "text",
      required: false,
    },
    {
      label: "Pin Code",
      name: "pinCode",
      type: "text",
      required: false,
    },
    {
      label: "State",
      name: "state",
      type: "text",
      required: false,
    },
    {
      label: "District",
      name: "district",
      type: "select",
      required: false,
      options: DISTRICT,
    },
    {
      label: "Principal's Name",
      name: "currentPrincipal",
      type: "text",
      required: false,
    },
    {
      label: "Principal Contact Number",
      name: "principalContactNumber",
      type: "text",
      required: false,
    },
    {
      label: "Admin Username",
      name: "username",
      type: "text",
      required: false,
    },
    {
      label: "Admin Password",
      name: "password",
      type: "text",
      required: false,
    },
  ];

  return (
    <section className="mt-8 p-6 max-w-3xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">
        Edit Branch
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {fields.map((field) =>
          field.type === "select" ? (
            <div key={field.name}>
              <label className="block font-semibold mb-1" htmlFor={field.name}>
                {field.label}
                {errors[field.name] && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors[field.name]}
                  </span>
                )}
              </label>
              <select
                id={field.name}
                name={field.name}
                value={inputData[field.name] || ""}
                onChange={onChange}
                required={field.required}
                className="block w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-300 bg-gray-50"
              >
                <option value="" hidden>
                  Select {field.label}
                </option>
                {field.options &&
                  field.options.map((opt, idx) => (
                    <option value={opt} key={idx}>
                      {opt}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div key={field.name}>
              <label className="block font-semibold mb-1" htmlFor={field.name}>
                {field.label}
                {errors[field.name] && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors[field.name]}
                  </span>
                )}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={inputData[field.name] || ""}
                onChange={onChange}
                required={field.required}
                className="block w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-300 bg-gray-50"
                placeholder={field.label}
              />
            </div>
          )
        )}
        {/* isActive Switch */}
        <div className="flex items-center mt-1">
          <label htmlFor="isActive" className="mr-3 font-semibold">
            Active Status:
          </label>
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={!!inputData.isActive}
            onChange={onChange}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm">
            {inputData.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-semibold py-2 rounded mt-2 transition"
          >
            {loading ? "Processing..." : "Edit"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditStudyCentre;