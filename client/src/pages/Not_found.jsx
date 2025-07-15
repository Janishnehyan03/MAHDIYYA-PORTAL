import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative text-center">
        {/* Background "404" text */}
        <h1
          className="absolute -top-20 left-1/2 -translate-x-1/2 text-[15rem] sm:text-[20rem] font-black text-gray-200 -z-10"
          aria-hidden="true"
        >
          404
        </h1>

        <div className="z-10">
          <p className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Oops! Page Not Found
          </p>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Sorry, we couldn’t find the page you’re looking for. It might have
            been moved or deleted.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Go back home
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-900 hover:underline">
              Contact support <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NotFound;