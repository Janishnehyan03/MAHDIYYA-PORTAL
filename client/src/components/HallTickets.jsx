import React, { useEffect, useState } from "react";
import moment from "moment";
import Axios from "../Axios";
import { toast } from "react-toastify";

function HallTickets() {
  const [hallTickets, setHallTickets] = useState([]);
  const [exam, setExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [inputs, setInputs] = useState([
    { subjectId: null, time: null, date: null },
  ]);
  const [exams, setExams] = useState([]);

  const handleAddRow = () => {
    setInputs([...inputs, { subjectId: "", time: "", date: "" }]);
  };
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newInputs = [...inputs];
    newInputs[index][name] = value;
    setInputs(newInputs);
  };
  const submitHallTicket = async (e) => {
    e.preventDefault();
    try {
      let res = await Axios.post("/hall-ticket", {
        subjects: inputs,
        exam,
        class: selectedClass,
      });
      if (res.status === 200) {
        toast.success("Hall Ticket Created Successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        window.location.reload();
      }
    } catch (error) {
      console.log(error.response);
      toast.error("Something went wrong", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };
  const getHallTickets = async () => {
    try {
      let { data } = await Axios.get("/hall-ticket");
      setHallTickets(data);
    } catch (error) {
      console.error("Error fetching hall tickets:", error);
    }
  };

  const deleteHallTicket = async (itemId) => {
    try {
      if (window.confirm("Do you want to delete this hall ticket?")) {
        let res = await Axios.delete(`/hall-ticket/${itemId}`);
        if (res.status === 200) {
          toast.success("Hall ticket deleted successfully!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      toast.error("Error occurred while deleting hall ticket", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };
  const getExams = async () => {
    try {
      let { data } = await Axios.get("/exam");
      setExams(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getClasses = async () => {
    try {
      let { data } = await Axios.get("/class");
      setClasses(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getSubjects = async () => {
    try {
      let { data } = await Axios.get("/subject?class=" + selectedClass);
      setSubjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getExams();
    getClasses();
    getHallTickets();
  }, []);

  useEffect(() => {
    selectedClass && getSubjects();
  }, [selectedClass]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-center my-4 text-3xl font-semibold text-gray-700 mb-4">
          Hall Tickets
        </h2>
        <form className="mx-auto mt-4 w-1/2">
          <h1 className="text-3xl font-bold">Create Exam Time Table </h1>
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label
                className="block  text-sm font-bold mb-2 text-[#eeeeee]"
                htmlFor="username"
              >
                Exam
              </label>

              <select
                className="bg-gray-900 border border-gray-300 text-sky-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                name="gender"
                id=""
                onChange={(e) => setExam(e.target.value)}
              >
                <option hidden>Select Exam </option>
                {exams.map((exam, key) => (
                  <option value={exam._id}>{exam.examName} </option>
                ))}
              </select>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label
                className="block  text-sm font-bold mb-2 text-[#eeeeee]"
                htmlFor="username"
              >
                Class
              </label>

              <select
                className="bg-gray-900 border border-gray-300 text-sky-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                name="class"
                id=""
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option hidden>Select Class </option>
                {classes.map((classItem, key) => (
                  <option value={classItem._id}>{classItem.className} </option>
                ))}
              </select>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="px-4 sm:px-0">
              <label
                className="block  text-sm font-bold mb-2 text-[#eeeeee]"
                htmlFor="username"
              >
                Subjects
              </label>
              {inputs.map((inputItem, key) => (
                <div className="flex items-center">
                  <select
                    className="bg-gray-900 border border-gray-300 text-sky-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                    id="username"
                    type="text"
                    required
                    name="subjectId"
                    onChange={(event) => handleInputChange(key, event)}
                  >
                    <option hidden>Select Subjects </option>

                    {subjects.map((subject, key) => (
                      <option key={key} value={subject._id}>
                        {subject.subjectCode} - {subject.subjectName}
                      </option>
                    ))}
                  </select>
                  <input
                    className="focus:ring-indigo-500 mx-2 focus:border-indigo-500 shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline uppercase"
                    id="username"
                    type="text"
                    required
                    placeholder="hh:mm"
                    name="time"
                    onChange={(event) => handleInputChange(key, event)}
                  />
                  <input
                    className="focus:ring-indigo-500 focus:border-indigo-500 shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline uppercase"
                    id="username"
                    type="text"
                    required
                    placeholder="DD-MM-YYYY"
                    name="date"
                    onChange={(event) => handleInputChange(key, event)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={(e) => handleAddRow(e)}
              className="text-white mt-3 bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              add subject
            </button>
            <button
              type="submit"
              onClick={(e) => submitHallTicket(e)}
              className="text-white mt-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="bg-gray-900 shadow-md rounded-lg p-4">
          {hallTickets.length > 0 ? (
            hallTickets.map((hallTicket) => (
              <div
                key={hallTicket._id}
                className="mb-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    {hallTicket?.exam?.examName}
                  </h3>
                  <button
                    onClick={() => deleteHallTicket(hallTicket._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-white mt-2">
                  {hallTicket?.class?.className}
                </p>
                <div className="mt-2">
                  {hallTicket?.subjects.map((subject, key) => (
                    <div key={key} className="text-gray-700">
                      <span className="font-semibold">
                        {subject?.subjectId?.subjectName}
                      </span>{" "}
                      -{" "}
                      <span className="text-sm text-white">
                        {subject?.subjectId?.subjectCode}
                      </span>
                      <span className="text-sm text-white ml-4">
                        ({moment(subject?.date).format("MMM DD, YYYY")}){" "}
                        {subject?.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">No hall tickets available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HallTickets;
