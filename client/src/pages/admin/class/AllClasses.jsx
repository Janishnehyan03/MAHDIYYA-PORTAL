import {
  faChalkboardUser, // A more fitting icon for a class
  faFileArrowDown, // Updated icon for download
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

function AllClasses() {
  const { authData } = useContext(UserAuthContext);
  const [classes, setCLasses] = useState([]);

  useEffect(() => {
    const getAllClasses = async () => {
      try {
        // Mock data for demonstration in case the API call fails or is slow
        // setCLasses([
        //   { _id: '1', className: 'Grade 10 - Science' },
        //   { _id: '2', className: 'Grade 12 - Commerce' },
        //   { _id: '3', className: 'Grade 9 - Arts' },
        //   { _id: '4', className: 'Primary Section - A' },
        //   { _id: '5', className: 'Senior KG' },
        // ]);
        let { data } = await Axios.get("/class");
        setCLasses(data);
      } catch (error) {
        console.log(error);
        // You could set an error state here
      }
    };

    getAllClasses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* === Header Section === */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {authData?.branch.studyCentreName || "Study Centre"}
          </h1>
          <p className="mt-2 text-lg text-gray-600">All Classes</p>
        </div>

        {/* === Actions Bar === */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Link to={`/new-student`}>
            <button className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Add New Student
            </button>
          </Link>
          <a
            href="/CMS STUDENT FORM.xlsx"
            download // Good practice to add the download attribute
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-colors duration-300 ease-in-out"
          >
            <FontAwesomeIcon icon={faFileArrowDown} />
            <span>Download Excel Template</span>
          </a>
        </div>

        {/* === Classes Grid === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classes.map((item, key) => (
            <Link to={`/all-students/${item._id}`} key={key} className="group">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-xl group-hover:-translate-y-1.5">
                <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-5 transition-colors duration-300 group-hover:bg-blue-500 group-hover:text-white">
                  <FontAwesomeIcon icon={faChalkboardUser} size="2x" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {item.className}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View Students & Details
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Handling empty state */}
        {classes.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-gray-200 mt-8">
            <h3 className="text-xl font-semibold text-gray-700">
              No Classes Found
            </h3>
            <p className="mt-2 text-gray-500">
              There are currently no classes to display. Please add a class to
              get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllClasses;
