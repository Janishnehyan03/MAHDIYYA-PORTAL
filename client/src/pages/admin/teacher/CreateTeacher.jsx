import React from "react";
import { useState } from "react";
import Axios from "../../../Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserAuthContext } from "../../../context/userContext";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function CreateTeacher() {
  const navigate = useNavigate();
  const { authData } = useContext(UserAuthContext);
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const initialState = {
    email: "",
    phone: "",
    teacherName: "",
    branch: "",
    subjects: [],
    gender: "",
    mahdiyyaTeacher: false,
  };
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleSubjects = (item) => {
    let array = formData.subjects;

    if (!formData.subjects.includes(item)) {
      array.push(item);
      setFormData({ ...formData, subjects: array });
      let result = subjects.filter((o) =>
        formData.subjects.some((id) => o._id === id)
      );
      setSelectedSubjects(result);
    }
  };
  function removeSubject(value) {
    var i = formData.subjects.indexOf(value);
    while (i < formData.subjects.length) {
      if (formData.subjects[i] === value) {
        formData.subjects.splice(i, 1);
        let result = subjects.filter((o) =>
          formData.subjects.some((id) => o._id === id)
        );
        setSelectedSubjects(result);
      } else {
        ++i;
      }
    }
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onChangeTeacherType = (type) => {
    setFormData((prevState) => ({
      ...prevState,
      mahdiyyaTeacher: type,
    }));
  };

  
  const getSubjects = async () => {
    try {
      let { data } = await Axios.get("/subject");
      setSubjects(data);
    } catch (error) {
      console.log(error.response);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormData({ ...formData, branch: authData?.branch?._id });
    try {
      let res = await Axios.post("/teacher", {
        ...formData,
        branch: authData.branch._id,
      });
      if (res.status === 200) {
        setLoading(false);
        setFormData(initialState);
        toast.success("Teacher Added Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
      }
      navigate("/all-teachers");
    } catch (error) {
      setErrors(error.response.data);
      setLoading(false);
      toast.error("Something went wrong", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };
  useEffect(() => {
    getSubjects();
  }, []);
  return (
    <div className="w-2/4 mx-auto">
    <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="max-w-screen-xl mx-auto">
        <h3 className="text-4xl font-bold text-violet-500 uppercase my-4">
          Create Teacher
        </h3>
  
        <form className="lg:grid lg:grid-cols-1 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label
                className="block text-sm font-bold mb-2 text-gray-300"
                htmlFor="username"
              >
                Teacher's Username
              </label>
              <input
                className="focus:ring-violet-500 focus:border-violet-500 shadow appearance-none border border-gray-600 rounded w-full py-4 px-3 text-gray-100 bg-gray-700 leading-tight focus:outline-none"
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => onChange(e)}
                placeholder="USERNAME"
                name="teacherName"
              />
              <span className="text-red-500">{errors?.teacherName}</span>
            </div>
          </div>
  
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="email">
                Email
              </label>
              <input
                className="focus:ring-violet-500 focus:border-violet-500 shadow appearance-none border border-gray-600 rounded w-full py-4 px-3 text-gray-100 bg-gray-700 leading-tight focus:outline-none"
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => onChange(e)}
                placeholder="EMAIL"
                name="email"
              />
              <span className="text-red-500">{errors?.email}</span>
            </div>
          </div>
  
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="focus:ring-violet-500 focus:border-violet-500 shadow appearance-none border border-gray-600 rounded w-full py-4 px-3 text-gray-100 bg-gray-700 leading-tight focus:outline-none"
                id="phone"
                type="text"
                required
                value={formData.phone}
                onChange={(e) => onChange(e)}
                placeholder="Phone No:"
                name="phone"
              />
              <span className="text-red-500">{errors?.phone}</span>
            </div>
          </div>
  
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="gender">
                Gender
              </label>
              <select
                className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-3"
                name="gender"
                onChange={(e) => onChange(e)}
                id="gender"
              >
                <option hidden>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <span className="text-red-500">{errors?.gender}</span>
            </div>
          </div>
  
          <div className="px-4 sm:px-0 mt-4">
            <label className="block text-sm font-bold mb-2 text-gray-300">Mahdiyya Teacher</label>
            <input
              type="radio"
              id="teacher"
              name="teacher"
              onChange={() => onChangeTeacherType(true)}
              className="focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
  
          <div className="px-4 sm:px-0 mt-4">
            <label className="block text-sm font-bold mb-2 text-gray-300">
              Non Mahdiyya Teacher
            </label>
            <input
              type="radio"
              id="non-teacher"
              name="teacher"
              onChange={() => onChangeTeacherType(false)}
              className="focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
  
          {formData.mahdiyyaTeacher && (
            <>
              <div className="lg:col-span-1 mt-4">
                <div className="px-4 sm:px-0">
                  <label className="block text-sm font-bold mb-2 text-gray-300">
                    Subjects
                  </label>
                  <select
                    className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-3"
                    onChange={(e) => handleSubjects(e.target.value)}
                  >
                    <option hidden>Select subjects</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject._id}>
                        {subject.subjectName} {subject.subjectCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
  
              <div className="lg:col-span-1 mt-4">
                <div className="px-4 sm:px-0">
                  <label className="block text-sm font-bold mb-2 text-gray-300">
                    Selected Subjects
                  </label>
                  {selectedSubjects.map((item, key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center bg-violet-500 px-3 py-2 rounded-md mb-2 text-gray-100"
                    >
                      <h6>{item.subjectName} {item.subjectCode}</h6>
                      <FontAwesomeIcon
                        onClick={() => removeSubject(item._id)}
                        icon={faTrash}
                        className="hover:text-red-400 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
  
          <div className="lg:col-span-1 mt-4">
            <div className="px-4 sm:px-0">
              {!loading ? (
                <button
                  onClick={(e) => handleSubmit(e)}
                  className="w-full lg:w-1/2 bg-violet-600 hover:bg-violet-700 text-gray-100 font-bold py-4 px-4 rounded uppercase focus:outline-none"
                >
                  Submit
                </button>
              ) : (
                <h1 className="text-gray-100 text-center w-full lg:w-1/2 bg-violet-600 font-bold py-4 px-4 rounded uppercase">
                  Processing...
                </h1>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  </div>
  
  );
}

export default CreateTeacher;
