import {
  faBookReader,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../../Axios";

function StudyCentreView() {
  const { centreId } = useParams();
  const [studyCentre, setStudyCentre] = useState(null);

  useEffect(() => {
    const getStudyCentre = async () => {
      try {
        let { data } = await Axios.get(`/study-centre/details/${centreId}`);
        console.log(data);  
        setStudyCentre(data);
      } catch (error) {
        console.log(error.response);
      }
    };
    getStudyCentre();
  }, [centreId]);

  return (
    <div>
      <h1 className="text-center font-bold text-3xl mb-3 p-8 text-white bg-gray-900">
        {studyCentre?.studyCentreName}
      </h1>

      {/* Study Centre Profile */}
      <div className="px-4 py-8 m-auto mt-5">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold text-lg">
              <p>Principal: {studyCentre?.currentPrincipal}</p>
              <p>Email: {studyCentre?.email}</p>
              <p>Phone: {studyCentre?.phone}</p>
              <p>District: {studyCentre?.district}</p>
              <p>State: {studyCentre?.state}</p>
              <p>Place: {studyCentre?.place}</p>
              <p>Affiliated Year: {studyCentre?.affiliatedYear}</p>
              <p>Post Office: {studyCentre?.postOffice}</p>
              <p>Pin Code: {studyCentre?.pinCode}</p>
            </div>

            {/* Image or Cover */}
            <div>
              {studyCentre?.imageCover && (
                <img
                  src={studyCentre.imageCover}
                  alt="Study Centre Cover"
                  className="w-48 h-48 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Google Maps Link */}
          {studyCentre?.googleMapUrl && (
            <a
              href={studyCentre.googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 mt-4 block"
            >
              View on Google Maps
            </a>
          )}
        </div>
      </div>

      {/* Student and Teacher Count */}
      <div className="px-4 py-8 m-auto mt-5 grid grid-cols-1 lg:grid-cols-4">
        <div className="w-full p-2 cursor-pointer">
          <div className="py-4 overflow-hidden bg-gray-800 rounded-xl group duration-300 shadow-2xl">
            <div className="flex">
              <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                <FontAwesomeIcon icon={faBookReader} color="white" />
              </div>
            </div>
            <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
              Students
            </h1>
            <p className="text-center text-white">{studyCentre?.studentCount}</p>
          </div>
        </div>

        <div className="w-full p-2 cursor-pointer">
          <div className="py-4 overflow-hidden bg-gray-800 rounded-xl group duration-300 shadow-2xl">
            <div className="flex">
              <div className="px-4 py-4 bg-gray-300 group-hover:bg-gray-900 rounded-xl bg-opacity-30 mx-auto text-2xl">
                <FontAwesomeIcon icon={faChalkboardTeacher} color="white" />
              </div>
            </div>
            <h1 className="text-xl text-center font-bold group-hover:text-gray-400 text-white mt-4">
              Teachers
            </h1>
            <p className="text-center text-white">{studyCentre?.teacherCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyCentreView;
