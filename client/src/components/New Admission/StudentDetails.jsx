import { DISTRICT } from "../../Consts";

function StudentDetails({ onChange, formData, nextPage, formErrors }) {
  const forms = [
    {
      labelName: "Student Name",
      type: "text",
      name: "studentName",
      placeholder: "Enter Name",
      required: true,
      value: formData.studentName,
      error: formErrors.studentName,
    },
    {
      labelName: "House Name",
      type: "text",
      name: "houseName",
      placeholder: "Enter House Name",
      required: true,
      value: formData.houseName,
      error: formErrors.houseName,
    },
    {
      labelName: "Father Name",
      type: "text",
      name: "fatherName",
      placeholder: "Enter Father's Name",
      required: true,
      value: formData.fatherName,
      error: formErrors.fatherName,
    },
    {
      labelName: "Date Of Birth (DD-MM-YYYY)",
      type: "text",
      name: "dateOfBirth",
      placeholder: "DD-MM-YYYY",
      required: true,
      value: formData.dateOfBirth,
      error: formErrors.dateOfBirth,
    },

    {
      labelName: "Phone Number",
      type: "number",
      name: "phone",
      placeholder: "Enter Phone Number",
      required: true,
      value: formData.phone,
      error: formErrors.phone,
    },

    {
      labelName: "Place",
      type: "text",
      name: "place",
      placeholder: "Enter Place",
      required: true,
      value: formData.place,
      error: formErrors.place,
    },
    {
      labelName: "Post Office",
      type: "text",
      name: "postOffice",
      placeholder: "Enter Post Office",
      required: true,
      value: formData.postOffice,
      error: formErrors.postOffice,
    },
    {
      labelName: "Pin Code",
      type: "number",
      name: "pinCode",
      placeholder: "Enter Your Pincode",
      required: true,
      value: formData.pinCode,
      error: formErrors.pinCode,
    },
    {
      labelName: "State",
      type: "text",
      name: "state",
      placeholder: "Enter Your State",
      required: true,
      value: formData.state,
      error: formErrors.state,
    },
  ];

  return (
    <section className="bg-gray-900 p-6">
      <div className="max-w-screen-xl mx-auto">
        <h3 className="text-4xl text-center font-bold text-[#eeeeee] uppercase my-4">
          Admission SECTION
        </h3>
        <div className="flex items-center flex-col justify-center">
          <img src="/logo.png" className="h-20" alt="" />
          <div className="flex space-x-3">
            <p>CPET DARUL HUDA</p>
            <p>cpetdhiu.in</p>
            <p>+91 9746229547</p>
          </div>
        </div>

        <form className="lg:grid lg:grid-cols-2 lg:gap-8">
          {forms.map((form, key) => (
            <div key={key} className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2 text-[#eeeeee]"
                  htmlFor="username"
                >
                  {form.labelName}
                </label>
                <input
                  className="focus:ring-indigo-500 focus:border-indigo-500 appearance-none border rounded w-full py-4 px-3  leading-tight focus:outline-none  uppercase"
                  type={form.type}
                  onChange={(e) => onChange(e)}
                  required={form.required}
                  placeholder={form.placeholder}
                  name={form.name}
                  value={form.value}
                />
                <div className="text-red-500 font-sm">{form.error}</div>
              </div>
            </div>
          ))}

          <div className="lg:col-span-1">
            <label className="block  text-sm font-bold mb-2 text-[#eeeeee]" htmlFor="username">
              District
            </label>
            <select
              name="district"
              onChange={(e) => onChange(e)}
              className="bg-gray-900 border border-gray-300 text-[#eeeeee] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full py-4 "
            >
              <option hidden>Select YOUR DISTRICT </option>
              {DISTRICT.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <div className="text-red-500 font-sm">{formErrors?.district}</div>
          </div>

          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <button
                onClick={(e) => nextPage(e)}
                className="w-full mt-3 lg:mt-7 bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-4 px-4 rounded focus:outline-none  uppercase"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default StudentDetails;
