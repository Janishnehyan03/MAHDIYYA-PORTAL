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
      let { data } = await Axios.get(`/study-centre?sort=studyCentreName`);
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
      <div className="">
        {studyCentres.length > 0 ? (
          <table className=" ">
            <thead className="border-b">
              <tr>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Study Centre
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  District
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  State
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Panchayath
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Affiliated Year
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Post Office
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Pin Code
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Place
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Principal
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Principal Contact
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium text-blue-900 px-6 py-4 text-left"
                >
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {studyCentres.map((studyCentre, i) => (
                <tr
                  key={studyCentre._id}
                  className="border-b group-hover:text-white group hover:bg-blue-900  cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-medium text-blue-900">
                    {i + 1}
                  </td>
                  <td
                    onClick={() => handleRowClick(studyCentre._id)}
                    className="px-6 py-4 whitespace-nowrap group-hover:text-white text-semibold font-light text-blue-500"
                  >
                    {studyCentre.studyCentreName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.studyCentreCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.panchayath}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.affiliatedYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.postOffice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.pinCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.place}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.currentPrincipal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    {studyCentre.principalContactNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap group-hover:text-white text-sm font-light text-blue-900">
                    <Link
                      to={`/edit-branch/${studyCentre._id}`}
                      className="hover:text-white"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default AllStudyCentres;
