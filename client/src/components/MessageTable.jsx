import React, { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEye,
  faChevronDown,
  faChevronUp,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../pages/ConfirmationModal";

function MessageTable({ messages, getMessages }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const handleExpandRow = (rowIndex) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await Axios.delete(`/messages/${messageToDelete._id}`);

      toast.success("Message deleted successfully!");
      getMessages(); // Refresh the list from the parent
    } catch (error) {
      console.log(error.response);
      toast.error(
        error.response?.data?.message || "Could not delete the message."
      );
    } finally {
      setIsModalOpen(false);
      setMessageToDelete(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white text-center p-10 rounded-lg shadow-md">
        <FontAwesomeIcon
          icon={faInbox}
          className="text-4xl text-gray-300 mb-4"
        />
        <h3 className="text-xl font-semibold text-gray-700">
          No Messages Found
        </h3>
        <p className="text-gray-500 mt-2">
          There are currently no messages to display.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  #
                </th>
                <th scope="col" className="px-6 py-3">
                  Title
                </th>
                <th scope="col" className="px-6 py-3">
                  Recipients
                </th>
                <th scope="col" className="px-6 py-3">
                  Link
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <React.Fragment key={message._id}>
                  <tr className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {message.title}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleExpandRow(index)}
                        className="flex items-center gap-2 text-blue-600 font-semibold"
                      >
                        {message.recipients.length} Recipients
                        <FontAwesomeIcon
                          icon={
                            expandedRow === index ? faChevronUp : faChevronDown
                          }
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={message.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline inline-flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faEye} /> View Link
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteClick(message)}
                        className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                        aria-label="Delete message"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row for Recipients */}
                  {expandedRow === index && (
                    <tr className="bg-blue-50">
                      <td colSpan="5" className="p-4">
                        <h4 className="font-bold text-gray-700 mb-2 ml-2">
                          Recipients:
                        </h4>
                        <div className="flex flex-wrap gap-2 p-2">
                          {message.recipients.map((recipient, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full"
                            >
                              {recipient.user.username}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
      >
        Are you sure you want to permanently delete this message? This action
        cannot be undone.
      </ConfirmationModal>
    </>
  );
}

export default MessageTable;
