import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../Axios";
import moment from "moment";
import { ClassContext } from "../../context/classContext";
import { ExamContext } from "../../context/examContext";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function TimetableForm({ onSubmitSuccess, editingHallTicket }) {
  const { classes, getClasses } = useContext(ClassContext);
  const { exams, getExams } = useContext(ExamContext);
  const [exam, setExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const handleRemoveRow = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const [subjects, setSubjects] = useState([]);
  const [inputs, setInputs] = useState([
    { subjectId: null, time: null, date: null },
  ]);

  useEffect(() => {
    getExams(true);
    getClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getSubjects();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (editingHallTicket) {
      setExam(editingHallTicket.exam._id);
      setSelectedClass(editingHallTicket.class._id);
      setInputs(
        editingHallTicket.subjects.map((subject) => ({
          subjectId: subject.subjectId._id,
          time: subject.time,
          date: moment(subject.date).format("YYYY-MM-DD"),
        }))
      );
    } else {
      resetForm();
    }
  }, [editingHallTicket]);

  const getSubjects = async () => {
    try {
      let { data } = await Axios.get(`/subject?class=${selectedClass}`);
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to fetch subjects", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const submitHallTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        subjects: inputs,
        exam,
        class: selectedClass,
      };
      let res;
      if (editingHallTicket) {
        res = await Axios.patch(
          `/hall-ticket/${editingHallTicket._id}`,
          payload
        );
      } else {
        res = await Axios.post("/hall-ticket", payload);
      }
      if (res.status === 200) {
        toast.success(
          `Hall Ticket ${
            editingHallTicket ? "Updated" : "Created"
          } Successfully`,
          {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          }
        );
        resetForm();
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting hall ticket:", error);
      toast.error("Something went wrong", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const handleAddRow = () => {
    setInputs([...inputs, { subjectId: "", time: "", date: "" }]);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newInputs = [...inputs];
    newInputs[index][name] = value;
    setInputs(newInputs);
  };

  const resetForm = () => {
    setExam("");
    setSelectedClass("");
    setInputs([{ subjectId: null, time: null, date: null }]);
  };

  return (
    <form className="mx-auto mt-4 w-1/2" onSubmit={submitHallTicket}>
      <h1 className="text-2xl font-bold mb-4">
        {editingHallTicket ? "Edit" : "Create"} Exam Time Table
      </h1>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Exam</label>
        <select
          className="bg-gray-900 border border-gray-300 text-sm rounded-lg w-full p-2"
          onChange={(e) => setExam(e.target.value)}
          value={exam}
          required
        >
          <option value="" hidden>
            Select Exam
          </option>
          {exams.map((examItem) => (
            <option key={examItem._id} value={examItem._id}>
              {examItem.examName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Class</label>
        <select
          className="bg-gray-900 border border-gray-300 text-sm rounded-lg w-full p-2"
          onChange={(e) => setSelectedClass(e.target.value)}
          value={selectedClass}
          required
        >
          <option value="" hidden>
            Select Class
          </option>
          {classes.map((classItem) => (
            <option key={classItem._id} value={classItem._id}>
              {classItem.className}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Subjects</label>
        {inputs.map((inputItem, key) => (
          <div key={key} className="flex space-x-2 mb-2">
            <select
              className="bg-gray-900 border border-gray-300 text-sm rounded-lg w-full p-2"
              name="subjectId"
              onChange={(event) => handleInputChange(key, event)}
              value={inputItem.subjectId}
              required
            >
              <option value="" hidden>
                Select Subject
              </option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.subjectCode} - {subject.subjectName}
                </option>
              ))}
            </select>
            <input
              className="bg-gray-900 border border-gray-300 text-sm rounded-lg w-full p-2"
              name="time"
              type="time"
              onChange={(event) => handleInputChange(key, event)}
              value={inputItem.time}
              required
            />
            <input
              className="bg-gray-900 border border-gray-300 text-sm rounded-lg w-full p-2"
              name="date"
              type="date"
              onChange={(event) => handleInputChange(key, event)}
              value={inputItem.date}
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveRow(key)}
              className="bg-red-500 text-white px-2 py-1 rounded-lg"
              disabled={inputs.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleAddRow}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Subject
        </button>
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          {editingHallTicket ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
}

function TimeTables() {
  const [hallTickets, setHallTickets] = useState([]);
  const [editingHallTicket, setEditingHallTicket] = useState(null);

  useEffect(() => {
    getHallTickets();
  }, []);

  const getHallTickets = async () => {
    try {
      let { data } = await Axios.get("/hall-ticket");
      setHallTickets(data);
    } catch (error) {
      console.error("Error fetching hall tickets:", error);
      toast.error("Failed to fetch hall tickets", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const deleteHallTicket = async (itemId) => {
    try {
      if (window.confirm("Do you want to delete this item?")) {
        let res = await Axios.delete(`/hall-ticket/${itemId}`);
        if (res.status === 200) {
          toast.success("Deleted successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
          getHallTickets();
        }
      }
    } catch (error) {
      console.error("Error deleting hall ticket:", error);
      toast.error("Error Occurred", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (hallTicket) => {
    setEditingHallTicket(hallTicket);
  };

  const handleSubmitSuccess = () => {
    getHallTickets();
    setEditingHallTicket(null);
  };

  return (
    <div className="mt-4">
      <TimetableForm
        onSubmitSuccess={handleSubmitSuccess}
        editingHallTicket={editingHallTicket}
      />
      <HallTicketTable
        hallTickets={hallTickets}
        onDelete={deleteHallTicket}
        onEdit={handleEdit}
      />
    </div>
  );
}

function HallTicketTable({ hallTickets, onDelete, onEdit }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {hallTickets.map((hallTicket) => (
        <div
          key={hallTicket._id}
          className="relative bg-gray-900 shadow-md rounded-lg p-6 border border-gray-300 transition-transform transform hover:scale-105"
        >
          {/* Exam and Class Name */}
          <div className="mb-4 mt-10">
            <h2 className="text-xl font-bold text-gray-800">
              {hallTicket.exam.examName}
            </h2>
            <p className="text-white italic">{hallTicket.class.className}</p>
          </div>

          {/* Subjects */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Subjects:</h3>
            {hallTicket.subjects.map((subject, key) => (
              <div
                key={key}
                className="bg-gray-200 rounded-lg p-3 mb-2 transition duration-200 hover:bg-gray-300"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 text-sm font-bold">
                    {subject.subjectId.subjectName}
                  </p>
                  <p className="text-xs">
                    {subject.time}, {moment(subject.date).format("DD-MM-YYYY")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Edit and Delete Buttons */}
          <div className="absolute top-4 right-4 space-x-2 flex justify-between">
            <button
              className="bg-gray-600 text-white  p-2 rounded-lg hover:bg-gray-700 transition transform hover:scale-105"
              onClick={() => onEdit(hallTicket)}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              className="bg-red-700 text-white p-2 rounded-lg hover:bg-red-500 transition transform hover:scale-105"
              onClick={() => onDelete(hallTicket._id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimeTables;
