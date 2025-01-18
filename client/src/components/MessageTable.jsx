import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../Axios";

function MessageTable({ messages, getMessages }) {
  const [showMore, setShowMore] = useState(null);
  const handleExpandRow = (rowIndex) => {
    setShowMore(showMore === rowIndex ? null : rowIndex);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    try {
      if (window.confirm("are you sure")) {
        let res = await Axios.post(`/messages/delete?id=${id}`);
        toast.success("deleted successfully", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        getMessages();
      }
    } catch (error) {
      console.log(error.response);
      toast.error("error occured", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  return (
    <table className="w-full mx-auto text-center bg-gray-800 shadow-lg rounded-lg text-gray-100">
    <thead className="bg-gray-700">
      <tr>
        <th className="px-4 py-3 text-sm font-semibold uppercase">#</th>
        <th className="px-4 py-3 text-sm font-semibold uppercase">Title</th>
        <th className="px-4 py-3 text-sm font-semibold uppercase">Recipients</th>
        <th className="px-4 py-3 text-sm font-semibold uppercase">Link</th>
        <th className="px-4 py-3 text-sm font-semibold uppercase">Actions</th>
      </tr>
    </thead>
    <tbody>
      {messages.map((message, index) => (
        <tr
          key={message._id}
          className="hover:bg-gray-700 transition-colors duration-200"
        >
          <td className="px-4 py-3 border-t border-gray-700">{index + 1}</td>
          <td className="px-4 py-3 border-t border-gray-700">{message.title}</td>
          <td className="px-4 py-3 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-2">
              {message?.recipients?.map((item, idx) => (
                <p
                  key={idx}
                  className="bg-gray-600 text-center px-2 py-1 rounded-md text-sm"
                >
                  {item.user.username}
                </p>
              ))}
            </div>
          </td>
          <td className="px-4 py-3 border-t border-gray-700">
            <a
              href={message.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 px-3 py-1 uppercase hover:underline"
            >
              View
            </a>
          </td>
          <td className="px-4 py-3 border-t border-gray-700">
            <button
              onClick={(e) => handleDelete(e, message._id)}
              className="text-red-500 bg-gray-600 px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  
  );
}

export default MessageTable;
