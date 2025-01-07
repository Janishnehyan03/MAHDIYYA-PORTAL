import {
  faBook,
  faBuilding,
  faChalkboardTeacher,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function Counter() {
  return (
    <div className="py-5 lg:ml-[10%]">
      <main className="h-full overflow-y-auto">
        <div className="container  mx-auto grid">
          {/* Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            {/* Card */}
            <div className="flex items-center p-4 bg-gray-900 rounded-lg shadow-xs dark:bg-gray-800">
              <div className="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
              </div>
              <div>
                <p className="mb-2 uppercase font-bold text-sm text-white dark:text-gray-400">
                  teachers
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  300+
                </p>
              </div>
            </div>
            {/* Card */}
            <div className="flex items-center p-4 bg-gray-900 rounded-lg shadow-xs dark:bg-gray-800">
              <div className="p-3 mr-4 text-green-500 bg-blue-600 rounded-full dark:text-green-100 dark:bg-blue-600">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <div>
                <p className="mb-2 text-sm uppercase font-bold text-white dark:text-gray-400">
                  Students
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  5000+
                </p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-900 rounded-lg shadow-xs dark:bg-gray-800">
              <div className="py-3 px-4 mr-4 text-green-500 bg-blue-600 rounded-full dark:text-green-100 dark:bg-blue-600">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <div>
                <p className="mb-2 text-sm uppercase font-bold text-white dark:text-gray-400">
                  Study Centres
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  60+
                </p>
              </div>
            </div>
            {/* Card */}
            <div className="flex items-center p-4 bg-gray-900 rounded-lg shadow-xs dark:bg-gray-800">
              <div className="px-4 py-3 mr-4 text-white bg-blue-600 rounded-full dark:text-white dark:bg-blue-600">
                <FontAwesomeIcon icon={faBook} />
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-white dark:text-gray-400">
                  Courses
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  15+
                </p>
              </div>
            </div>
            {/* Card */}
           
          </div>
        </div>
      </main>
    </div>
  );
}

export default Counter;
