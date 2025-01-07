import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Axios from "../../../Axios";
import Loading from "../../../components/Loading";

function AllStudyCentres() {
  const [studyCentres, setStudyCentres] = useState([]);
  const { pathname } = useLocation();

  const getAllStudyCentres = async () => {
    try {
      let { data } = await Axios.get(`/study-centre?sort=studyCentreCode`);
      setStudyCentres(data.docs);
    } catch (error) {
      console.log(error);
    }
  };

  const navigation = useNavigate();
  const handleRowClick = (centerId) => {
    navigation(`/study-centre/${centerId}`);
  };
  useEffect(() => {
    getAllStudyCentres();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        {studyCentres.length > 0 ? (
          <table className="w-full bg-gray-900 text-left border-collapse">
            <thead className="bg-gray-800">
              <tr>
                {[
                  "#",
                  "Study Centre",
                  "Code",
                  "Phone",
                  "District",
                  "State",
                  "Panchayath",
                  "Affiliated Year",
                  "Email",
                  "Post Office",
                  "Pin Code",
                  "Place",
                  "Principal",
                  "Principal Contact",
                  "Edit",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-sm font-semibold text-gray-300 px-4 py-2"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studyCentres.map((studyCentre, i) => (
                <tr
                  key={studyCentre._id}
                  className="group hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2 text-sm text-gray-300">{i + 1}</td>
                  <td
                    onClick={() => handleRowClick(studyCentre._id)}
                    className="px-4 py-2 text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
                  >
                    {studyCentre.studyCentreName}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.studyCentreCode}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.phone}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.district}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.state}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.panchayath}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.affiliatedYear}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.email}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.postOffice}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.pinCode}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.place}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.currentPrincipal}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-300">
                    {studyCentre.principalContactNumber}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <Link
                      to={`/edit-branch/${studyCentre._id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center py-20">
            <Loading />
          </div>
        )}
      </div>
    </>
  );
}

export default AllStudyCentres;
