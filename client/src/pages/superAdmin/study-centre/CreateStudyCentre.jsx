import React, { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { DISTRICT } from "../../../Consts";

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
        toast.success("Study Centre Added Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error.response.data);
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Something went wrong",
        {
          autoClose: 3000,
          position: toast.POSITION.TOP_CENTER,
        }
      );
      setErrors(error.response.data);
    }
  };

  return (
    <div className="w-full ml-6">
      <section className=" p-6 text-blue-800">
        <div className="max-w-screen-xl mx-auto">
          <h3 className="text-4xl font-bold  uppercase my-4">
            Create Study Center
          </h3>

          <form className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Study Center Name
                  {errors.studyCentreName && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.studyCentreName}
                    </h1>
                  )}
                </label>

                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  onChange={(e) => onChange(e)}
                  required
                  placeholder="Study Center Name"
                  name="studyCentreName"
                  value={inputData.studyCentreName}
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Study Center Code
                  {errors.studyCentreCode && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.studyCentreCode}
                    </h1>
                  )}
                </label>

                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  onChange={(e) => onChange(e)}
                  required
                  placeholder="Study Center Code"
                  name="studyCentreCode"
                  value={inputData.studyCentreCode}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2  "
                  htmlFor="username"
                >
                  Panchayath
                  {errors.panchayath && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.panchayath}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.panchayath}
                  onChange={(e) => onChange(e)}
                  placeholder="Panchayath"
                  name="panchayath"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Affiliated Year
                  {errors.affiliatedYear && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.affiliatedYear}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.affiliatedYear}
                  onChange={(e) => onChange(e)}
                  placeholder="Affiliated Year"
                  name="affiliatedYear"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Email
                  {errors.email && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.email}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.email}
                  onChange={(e) => onChange(e)}
                  placeholder="Email"
                  name="email"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Phone Number
                  {errors.phone && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.phone}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="username"
                  type="text"
                  required
                  value={inputData.phone}
                  onChange={(e) => onChange(e)}
                  placeholder="Phone No :"
                  name="phone"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Place
                  {errors.place && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.place}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  required
                  value={inputData.place}
                  onChange={(e) => onChange(e)}
                  placeholder="Place"
                  name="place"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <label
                className="block  text-sm font-bold mb-2 "
                htmlFor="username"
              >
                District
                {errors.district && (
                  <h1 className="text-red-500 font-sm text-center">
                    {errors.district}
                  </h1>
                )}
              </label>

              <select
                name="district"
                onChange={(e) => onChange(e)}
                id=""
                value={inputData.district}
                className="border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              >
                <option hidden>Select YOUR DISTRICT </option>
                {DISTRICT.map((district, index) => (
                  <>
                    <option key={index} value={district}>
                      {district}
                    </option>
                  </>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Post Office
                  {errors.postOffice && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.postOffice}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  required
                  value={inputData.postOffice}
                  onChange={(e) => onChange(e)}
                  placeholder="Post Office"
                  name="postOffice"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Pin Code
                  {errors.pinCode && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.pinCode}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  value={inputData.pinCode}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Pin Code"
                  name="pinCode"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  State
                  {errors.state && (
                    <h1 className="text-red-500 font-sm text-center">
                      {errors.state}
                    </h1>
                  )}
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  value={inputData.state}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="State"
                  name="state"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Admin Username
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  value={inputData.username}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Admin Username"
                  name="username"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 "
                  htmlFor="username"
                >
                  Admin Password
                </label>
                <input
                  className="block p-4 pl-10 w-full text-sm  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  value={inputData.password}
                  required
                  onChange={(e) => onChange(e)}
                  placeholder="Admin Password"
                  name="password"
                />
              </div>
            </div>
          </form>
          <div className="lg:col-span-1 mt-4">
            <div className="px-4 sm:px-0">
              {loading ? (
                <h1 className="text-white text-center w-full lg:w-1/2 bg-[#003865]  font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase">
                  Processing..
                </h1>
              ) : (
                <button
                  onClick={(e) => handleSubmit(e)}
                  className="w-full lg:w-1/2 bg-[#003865] hover:bg-[#231955] text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CreateStudyCentre;
