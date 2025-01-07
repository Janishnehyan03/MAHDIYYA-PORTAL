import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../../Axios";
import { UserAuthContext } from "../../context/userContext";

function AllCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const { authData } = useContext(UserAuthContext);
  const getAllCourses = async () => {
    try {
      let { data } = await Axios.get("/course");
      setCourses(data);
    } catch (error) {
      console.log(error.response);
    }
  };
  const moveToCourse = (e, id) => {
    e.preventDefault();
    navigate(`/course-details/${id}`);
  };
  useEffect(() => {
    getAllCourses();
  }, []);
  return (
    <section className=" w-full bg-gray-100 lg:p-[5rem]">
      <div className="grid lg:mx-autogrid-cols-1 lg:grid-cols-3 gap-x-3">
        {courses.map((course, i) => (
          <div className="bg-gray-900 p-[1rem] relative rounded-t-[20px] rounded-b-[20px] mt-2 mb-2 lg:mb-0">
            <img
              src={`/course/${course?.image}`}
              className="rounded-t-[20px] w-full "
              alt={course.courseTitle}
            />
            {authData && (
              <Link
                to={`/course-students/${course._id}`}
                className="ml-3 mt-3 cursor-pointer hover:text-blue-600 text-green-400"
              >
                view details <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            )}

            <div className="mt-3">
              <h1 className="font-bold mt-5 mb-10 uppercase text-[17px] text-white leading-4 text-center">
                {course.courseTitle}
              </h1>
              <button
                onClick={(e) => moveToCourse(e, course._id)}
                className="w-full absolute bottom-1 left-0 bg-[#0c9d85] text-white font-bold uppercase py-3 rounded-[30px] hover:bg-[#0f604b] "
              >
                apply now
              </button>
             
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AllCourses;
