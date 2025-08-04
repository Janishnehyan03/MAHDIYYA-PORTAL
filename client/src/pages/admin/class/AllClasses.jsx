import {
  faChalkboardUser,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

function AllClasses() {
  const { authData } = useContext(UserAuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // For demo: fixed 5 class color themes
  const classColors = [
    "from-blue-500 to-blue-400",
    "from-green-500 to-green-400",
    "from-purple-500 to-purple-400",
    "from-pink-500 to-pink-400",
    "from-yellow-500 to-yellow-400",
  ];

  useEffect(() => {
    const getAllClasses = async () => {
      try {
        let { data } = await Axios.get("/class");
        // Only show the first 5 classes as per requirement
        setClasses(data.slice(0, 5));
      } catch (error) {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    getAllClasses();
  }, []);

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 drop-shadow-sm">
            {authData?.branch?.studyCentreName || "Study Centre"}
          </h1>
          <p className="mt-2 text-lg text-gray-600">All Classes</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Link to={`/new-student`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Add New Student
            </button>
          </Link>
          <a
            href="/CMS STUDENT FORM.xlsx"
            download
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg shadow hover:bg-blue-50 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faFileArrowDown} />
            <span>Download Excel Template</span>
          </a>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {!loading &&
            classes.map((item, idx) => (
              <Link
                to={`/all-students/${item._id}`}
                key={item._id || idx}
                className="group focus:outline-none"
                tabIndex={0}
              >
                <div
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-7 flex flex-col items-center text-center transition-all duration-300 h-full group-hover:shadow-2xl group-hover:-translate-y-1 group-focus:shadow-2xl group-focus:-translate-y-1`}
                >
                  <div
                    className={`mb-5 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${classColors[idx % classColors.length]} text-white text-3xl shadow group-hover:scale-105 transform transition`}
                  >
                    <FontAwesomeIcon icon={faChalkboardUser} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {item.className}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View Students & Details
                  </p>
                </div>
              </Link>
            ))}
        </div>

        {/* Empty / Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-400 border-b-2"></div>
            <p className="mt-4 text-lg text-gray-600">Loading Classes...</p>
          </div>
        )}
        {!loading && classes.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-gray-200 mt-8">
            <h3 className="text-xl font-semibold text-gray-700">No Classes Found</h3>
            <p className="mt-2 text-gray-500">
              There are currently no classes to display. Please add a class to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllClasses;