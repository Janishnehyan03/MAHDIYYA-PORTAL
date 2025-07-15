import {
  faFileLines,
  faPlus,
  faSpinner,
  faExclamationTriangle,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "../../../Axios";
import { UserAuthContext } from "../../../context/userContext";

// --- Reusable Components ---

// A clean, reusable card for navigation actions
const ActionCard = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="group block bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300"
  >
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        <FontAwesomeIcon icon={icon} size="lg" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </Link>
);

// Loading spinner component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center text-center py-20">
    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
    <p className="mt-4 text-lg text-gray-600">Loading Configuration...</p>
  </div>
);

// Error message component
const ErrorState = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md text-center">
    <div className="flex justify-center">
      <div className="flex-shrink-0">
        <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

// Access denied component
const AccessDeniedState = () => (
    <div className="text-center py-20">
        <FontAwesomeIcon icon={faLock} size="3x" className="text-gray-400" />
        <h3 className="mt-4 text-2xl font-semibold text-gray-800">Access Denied</h3>
        <p className="mt-2 text-gray-500">You do not have permission to view this page.</p>
    </div>
)


// --- Main MarkEntry Component ---

function MarkEntry() {
  const [configuration, setConfiguration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authData } = useContext(UserAuthContext);

  useEffect(() => {
    const getConfigurations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await Axios.get("/configurations");
        setConfiguration(response.data);
      } catch (err) {
        console.error(err.response || err);
        setError("Failed to load page configuration. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (authData?.role === "admin") {
        getConfigurations();
    } else {
        setIsLoading(false); // No need to load if not an admin
    }
  }, [authData]);

  if (isLoading) {
    return (
        <main className="bg-gray-100 min-h-screen p-8">
            <LoadingState />
        </main>
    );
  }
  
  if (authData?.role !== 'admin') {
    return (
        <main className="bg-gray-100 min-h-screen p-8">
            <AccessDeniedState />
        </main>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mark Entry</h1>
          <p className="mt-1 text-md text-gray-600">
            Manage formative and summative assessment marks.
          </p>
        </div>

        {error && <ErrorState message={error} />}

        {configuration && (
          <div className="space-y-10">
            {/* Formative Assessment Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                Formative Assessment (FA)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                  to="/view-cce-mark"
                  icon={faFileLines}
                  title="View FA Marks"
                  description="Review existing formative assessment scores."
                />
                {configuration?.faSubmission && (
                  <ActionCard
                    to="/add-cce-mark"
                    icon={faPlus}
                    title="Add FA Marks"
                    description="Enter new scores for formative assessments."
                  />
                )}
              </div>
            </div>

            {/* Summative Assessment Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                Summative Assessment (SA)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                  to="/result-view"
                  icon={faFileLines}
                  title="View SA Marks"
                  description="Review final summative assessment results."
                />
                {configuration?.saSubmission && (
                  <ActionCard
                    to="/add-result"
                    icon={faPlus}
                    title="Add SA Marks"
                    description="Enter new scores for summative assessments."
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MarkEntry;