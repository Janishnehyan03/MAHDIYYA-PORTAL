import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../Axios";
import SelectedBranch from "./SelectedBranch";
import StudentDetails from "./StudentDetails";
import VerifyDetails from "./VerifyDetails";
import { getConfigurations } from "../../context/configurationPage";

function NewAdmission() {
  const [configurations, setConfigurations] = useState({ newAdmission: true });

  const initialState = {
    studentName: "",
    fatherName: "",
    houseName: "",
    dateOfBirth: "",
    place: "",
    postOffice: "",
    district: "",
    state: "",
    pinCode: "",
    phone: "",
    branch: "",
    class: "",
    academicYear: "",
  };

  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(initialState);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [goNext, setGoNext] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedClass, setSelectedClass] = useState("");
  const navigate = useNavigate();
  let currentYear = new Date().getFullYear().toString();
  let nextYear = (new Date().getFullYear() + 1).toString();

  const validate = (values) => {
    let errors = {};
    if (!values.studentName) {
      errors.studentName = "Student Name is required";
    }
    if (!values.fatherName) {
      errors.fatherName = "Father Name is required";
    }

    if (!values.dateOfBirth) {
      errors.dobDate = "DOB is required";
    }

    if (!values.district) {
      errors.district = "District is required";
    }
    if (!values.postOffice) {
      errors.postOffice = "Post Office is required";
    }
    if (!values.phone) {
      errors.phone = "Phone Number is required";
    }
    if (!values.place) {
      errors.place = "Place is required";
    }
    if (!values.state) {
      errors.state = "State is required";
    }
    if (!values.pinCode) {
      errors.pinCode = "Pin Code is required";
    }
    if (!values.houseName) {
      errors.houseName = "House Name is required";
    }
    return errors;
  };

  const onChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  const nextPage = (e) => {
    e.preventDefault();
    setGoNext(true);
    setFormErrors(validate(formData));
  };
  const prevPage = (e) => {
    e.preventDefault();
    setPage(page - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await Axios.post("/student/register", {
        ...formData,
        academicYear: currentYear + "-" + nextYear,
      });
      if (res.status === 200) {
        setFormData(initialState);
        toast.success("Student Added Successfully", {
          autoClose: 2000,
          position: toast.POSITION.TOP_CENTER,
        });
        // if (selectedClass === "MAHDIYYAH THIRD YEAR") {
        //   navigate("/MAHDIYYAH-third-year");
        // } else {
        //   navigate("/admission-created");
        // }
        navigate("/admission-created");
      }
    } catch (error) {
      setErrors(error.response.data);
      toast.error("Something went wrong", {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
      console.log(error.response);
    }
  };

  useEffect(() => {
    getConfigurations().then((data) => {
      setConfigurations(data);
    });

    if (Object.keys(formErrors).length === 0 && goNext) {
      setPage(page + 1);
    }
  }, [formErrors]);

  if (!configurations?.newAdmission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100">
        <h1 className="text-4xl font-bold text-red-600">Admission closed</h1>
      </div>
    );
  }

  switch (page) {
    case 1:
      return (
        <StudentDetails
          formData={formData}
          onChange={onChange}
          nextPage={nextPage}
          formErrors={formErrors}
        />
      );
    case 2:
      return (
        <SelectedBranch
          formData={formData}
          onChange={onChange}
          nextPage={nextPage}
          prevPage={prevPage}
          setFormData={setFormData}
          setImageUploaded={setImageUploaded}
          imageUploaded={imageUploaded}
          setSelectedClass={setSelectedClass}
        />
      );
    case 3:
      return (
        <VerifyDetails
          formData={formData}
          prevPage={prevPage}
          handleSubmit={handleSubmit}
          errors={errors}
          selectedClass={selectedClass}
        />
      );
  }
}

export default NewAdmission;
