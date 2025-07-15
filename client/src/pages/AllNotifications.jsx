import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faBell, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Axios from "../Axios";
import ConfirmationModal from "./ConfirmationModal.jsx"; // Adjust path if needed

function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const getAllNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await Axios.get("/notification");
      setNotifications(data.docs);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllNotifications();
  }, []);

  // Step 1: Prepare for deletion by opening the modal
  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setIsModalOpen(true);
  };

  // Step 2: Handle the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    try {
      // Assuming your API uses DELETE method for deletion
      await Axios.delete(`/notification/${notificationToDelete._id}`);
      toast.success("Notification deleted successfully!");
      // Refresh list without a full page reload
      setNotifications(notifications.filter(n => n._id !== notificationToDelete._id));
    } catch (error) {
      console.log(error);
      toast.error("Could not delete the notification.");
    } finally {
      setIsModalOpen(false);
      setNotificationToDelete(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 col-span-full">Loading notifications...</p>;
    }
    if (notifications.length === 0) {
      return (
        <div className="text-center text-gray-500 col-span-full bg-white p-10 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-700">No Notifications Found</h3>
          <p className="mt-2">There are currently no notifications to display.</p>
        </div>
      );
    }
    return notifications.map((notification) => (
      <div
        key={notification._id}
        className="bg-white shadow-lg rounded-xl p-5 flex items-center justify-between gap-4 transition-all hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <FontAwesomeIcon icon={faBell} size="lg" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{notification?.title}</p>
            <a
              href={notification?.url}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Details <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
            </a>
          </div>
        </div>
        <button
          onClick={() => handleDeleteClick(notification)}
          className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
          aria-label="Delete notification"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ));
  };

  return (
    <>
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            All Notifications
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderContent()}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
      >
        Are you sure you want to delete this notification? This action cannot be undone.
      </ConfirmationModal>
    </>
  );
}

export default AllNotifications;