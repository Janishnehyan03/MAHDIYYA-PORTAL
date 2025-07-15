import React, { useEffect, useState } from "react";
import Axios from "../../Axios";
import { toast } from "react-toastify";
import MessageTable from "../../components/MessageTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function CreateMessage() {
  const [recipients, setRecipients] = useState([]);
  const [link, setLink] = useState("");
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [forAll, setForAll] = useState(false);

  // --- Data Fetching ---
  const getMessages = async () => {
    try {
      const res = await Axios.get("/messages");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch messages.");
    }
  };

  const getUsers = async () => {
    try {
      const res = await Axios.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users.");
    }
  };

  useEffect(() => {
    getUsers();
    getMessages();
  }, []);

  // --- Handlers ---
  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (value && !recipients.includes(value)) {
      setRecipients([...recipients, value]);
    }
  };

  const removeRecipient = (idToRemove) => {
    setRecipients(recipients.filter((id) => id !== idToRemove));
  };

  const handleSetAll = () => {
    const isSelectingAll = !forAll;
    setForAll(isSelectingAll);
    if (isSelectingAll) {
      setRecipients(users.map((user) => user._id));
    } else {
      setRecipients([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forAll && recipients.length === 0) {
      toast.warn("Please select at least one recipient.");
      return;
    }
    setLoading(true);
    try {
      const res = await Axios.post("/messages/add", { link, recipients, title });
      if (res.status === 200) {
        toast.success("Message created successfully!");
        // Reset form
        setTitle("");
        setLink("");
        setRecipients([]);
        setForAll(false);
        // Refresh the message list without a full page reload
        await getMessages();
      }
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => recipients.includes(user._id));

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-xl p-6 sm:p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            Compose New Message
          </h2>

          {/* Title Field */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-600 text-sm font-semibold mb-2">
              Title
            </label>
            <input
              id="title"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter message title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>

          {/* Link Field */}
          <div className="mb-6">
            <label htmlFor="link" className="block text-gray-600 text-sm font-semibold mb-2">
              Link
            </label>
            <input
              id="link"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="https://example.com/document.pdf"
              onChange={(e) => setLink(e.target.value)}
              value={link}
              required
            />
          </div>
          
          {/* Checkbox for All */}
          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="sendToAll"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={forAll}
              onChange={handleSetAll}
            />
            <label htmlFor="sendToAll" className="text-sm font-medium text-gray-700">
              Send to All Study Centres
            </label>
          </div>

          {/* Recipient Selector */}
          {!forAll && (
            <div className="mb-6">
              <label htmlFor="recipient" className="block text-gray-600 text-sm font-semibold mb-2">
                Select Recipients
              </label>
              <select
                id="recipient"
                onChange={handleSelectChange}
                value="" // Keep it empty to allow re-selection
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>
                  -- Choose a recipient to add --
                </option>
                {users
                  .filter(user => !recipients.includes(user._id)) // Hide already selected users
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user?.branch?.studyCentreName}, {user.username}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Selected Recipients Display */}
          <div className="mb-6">
            <label className="block text-gray-600 text-sm font-semibold mb-2">
              Selected ({recipients.length})
            </label>
            {forAll ? (
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg text-center font-medium">
                Message will be delivered to all study centres.
              </div>
            ) : (
              <div className="p-3 border border-gray-200 rounded-lg min-h-[6rem] flex flex-wrap gap-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      <span>{item?.branch?.studyCentreName}, {item.username}</span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(item._id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 self-center mx-auto">No recipients selected.</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Send Message"}
            </button>
          </div>
        </form>

        {/* Message Table (Assuming it's styled separately) */}
        <MessageTable messages={messages} getMessages={getMessages} />
      </div>
    </div>
  );
}

export default CreateMessage;