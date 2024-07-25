import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  const handleSubjects = (item) => {
    if (!formData.subjects?.includes(item)) {
      setFormData((prevState) => ({
        subjects: [...prevState.subjects, item],
      }));
    }
  };

  function removeSubject(value) {
    const array = formData.subjects;
    var i = formData.subjects?.indexOf(value);
    if (i !== -1) {
      array.splice(i, 1);
      setFormData((prevState) => ({
        subjects: array,
      }));
    }
  }

  const getSubjects = async () => {
    try {
      let { data } = await Axios.get("/subject");
      setSubjects(data);
    } catch (error) {
      console.log(error.response);
    }
  };

  const getTeacher = async () => {
    try {
      let { data } = await Axios.get("/teacher/" + id);
      setFormData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res = await Axios.patch("/teacher/" + id, formData);
      if (res.status === 200) {
        setLoading(false);
        toast.success("Teacher edited Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
        navigate("/all-teachers");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
      console.log(error.response);
    }
  };
  let SelectedSubjects = subjects.filter((itemA) => {
    return formData.subjects?.find((itemB) => {
      return itemA._id === itemB;
    });
  });

  useEffect(() => {
    getSubjects();
    getTeacher();
  }, []);
  return (
    <div className="w-3/4 ml-6">
      <section className="bg-white p-6">
        <div className="max-w-screen-xl mx-auto">
          <h3 className="text-4xl font-bold text-sky-900 uppercase my-4">
            Edit Teacher
          </h3>

          <form className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  TEACHER NAME
                </label>
                <input
                  className="focus:ring-indigo-500 focus:border-indigo-500 shadow appearance-none border rounded w-full py-4 px-3  leading-tight focus:outline-none focus:shadow-outline uppercase"
                  id=""
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => onChange(e)}
                  placeholder="teacher's name"
                  name="teacherName"
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  EMAIL
                </label>
                <input
                  className="focus:ring-indigo-500 focus:border-indigo-500 shadow appearance-none border rounded w-full py-4 px-3  leading-tight focus:outline-none focus:shadow-outline uppercase"
                  id="username"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => onChange(e)}
                  placeholder="EMAIL"
                  name="email"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="px-4 sm:px-0">
                <label
                  className="block  text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Phone Number
                </label>
                <input
                  className="focus:ring-indigo-500 focus:border-indigo-500 shadow appearance-none border rounded w-full py-4 px-3  leading-tight focus:outline-none focus:shadow-outline uppercase"
                  id="username"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => onChange(e)}
                  placeholder="Phone No:"
                  name="phone"
                />
              </div>
            </div>
            <div className="px-4 sm:px-0 mt-4">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="mahdiyyaTeacher"
              >
                Mahdiyya Teacher
              </label>
              <input
                type="checkbox"
                id="mahdiyyaTeacher"
                name="mahdiyyaTeacher"
                onChange={(e) => onChange(e)}
                className="bg-gray-50 border border-gray-300 text-sky-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              />
            </div>

            {formData?.mahdiyyaTeacher && (
              <div className="lg:col-span-1">
                <div className="px-4 sm:px-0">
                  <label className="block  text-sm font-bold mb-2">
                    Subjects
                  </label>{" "}
                  <select
                    className="bg-gray-50 border border-gray-300 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    onChange={(e) => handleSubjects(e.target.value)}
                  >
                    <option hidden>select subjects </option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject._id}>
                        {subject.subjectName}
                        {subject.subjectCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData?.mahdiyyaTeacher && (
              <div className="lg:col-span-1 mt-4">
                <div className="px-4 sm:px-0">
                  <label className="block  text-sm font-bold mb-2">
                    Selected Subjects
                  </label>
                  {SelectedSubjects.map((item, key) => (
                    <div className="flex justify-between mx-2 text-center cursor-pointer bg-sky-900 px-2 my-2  text-white py-1">
                      <h1 key={key}>
                        {item.subjectName} {item.subjectCode}
                      </h1>
                      <FontAwesomeIcon
                        onClick={() => removeSubject(item._id)}
                        icon={faTrash}
                        color="white"
                      />
                    </div>
                  ))}
                  <br />
                </div>
              </div>
            )}
          </form>
          <div className="lg:col-span-1 mt-4">
            <div className="px-4 sm:px-0  grid lg:grid-cols-2 gap-2">
              {!loading ? (
                <>
                  <button
                    onClick={(e) => handleSubmit(e)}
                    className="w-full  bg-sky-900 hover:bg-sky-900 text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase"
                  >
                    Submit
                  </button>
                  <button
                    onClick={(e) => navigate(-1)}
                    className="w-full  bg-sky-500 hover:bg-sky-700 text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <h1 className="text-white text-center w-full lg:w-1/2 bg-sky-600 hover:bg-sky-700  font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline uppercase">
                  Processing..
                </h1>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EditTeacher;
