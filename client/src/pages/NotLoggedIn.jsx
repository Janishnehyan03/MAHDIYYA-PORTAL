import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function NotLoggedIn() {
  return (
    // Main container with a soft off-white background
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      
      {/* Content card with shadow and rounded corners for a modern look */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <FontAwesomeIcon icon={faLock} className="h-20 w-20 text-blue-600" aria-hidden="true" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Authentication Required
        </h1>

        {/* Descriptive Text */}
        <p className="mt-4 text-base text-gray-600">
          You must be logged in to view the content of this page. Please log in to your account to proceed.
        </p>

        {/* Primary Call-to-Action: Login Button */}
        <Link
          to="/login"
          className="mt-8 inline-block w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Login
        </Link>

        
      </div>

    </main>
  );
}

export default NotLoggedIn;