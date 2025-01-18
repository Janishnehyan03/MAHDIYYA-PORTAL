import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Axios from "../../Axios";
import { toast } from "react-toastify";
import MessageTable from "../../components/MessageTable";
import { faClose, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CreateMessage() {
  const [recipients, setRecipients] = useState([]);
  const [link, setLink] = useState("");
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [forAll, setForAll] = useState(false);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (!recipients.includes(value)) {
      setRecipients([...recipients, value]);
    }
  };

  const removeSelected = (value) => {
    if (recipients.includes(value)) {
      // Remove the selected value
      const updatedValues = recipients.filter((item) => item !== value);
      setRecipients(updatedValues);
    }
  };
  const handleSetAll = () => {
    setForAll(!forAll);
    if (!forAll) {
      setRecipients(users.map((user) => user._id));
    } else {
      setRecipients([]);
    }
  };
  const filteredUsers = users.filter((user) => recipients.includes(user._id));

  const getMessages = async () => {
    Axios.get("/messages")
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => console.error(err));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    Axios.post("/messages/add", {
      link,
      recipients,
      title,
    })
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          toast.success("message created", {
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
          });
          setLink("");
          setRecipients(null);
          setTitle("");
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error(err.response.data);
        setLoading(false);
        toast.error("something went wrong", {
          autoClose: 3000,
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };
  const getUsers = () => {
    Axios.get("/auth/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    getUsers();
    getMessages();
  }, []);
  return (
    <div className="px-4 py-6 bg-gray-900">
      <form className="bg-gray-800 shadow-lg rounded-lg max-w-2xl mb-2 mx-auto px-8 pt-6 pb-8">
        {/* Title Field */}
        <div className="mb-6">
          <label
            className="block text-gray-300 text-sm font-medium mb-2"
            htmlFor="title"
          >
            Title
          </label>
          <input
            className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 text-gray-300 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="title"
            placeholder="Enter message title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            required
          />
        </div>

        {/* Checkbox */}
        <div className="mb-6 flex items-center">
          <label className="block text-sm font-medium text-gray-300 mr-4">
            Message To All Study Centres
          </label>
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring focus:ring-blue-500"
            onClick={() => handleSetAll()}
          />
        </div>

        {/* Recipient Selector */}
        {!forAll && (
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-300 mb-2"
              htmlFor="recipient"
            >
              Select a Recipient
            </label>
            <select
              id="recipient"
              onChange={(e) => handleSelectChange(e)}
              className="bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            >
              <option hidden>Choose one</option>
              {users
                .sort((a, b) => (a.username > b.username ? 1 : -1))
                .map((user, key) => (
                  <option key={key} value={user._id}>
                    {user?.branch?.studyCentreName}, {user.username}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Link Field */}
        <div className="mb-6">
          <label
            className="block text-gray-300 text-sm font-medium mb-2"
            htmlFor="link"
          >
            Link
          </label>
          <input
            className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 text-gray-300 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="link"
            placeholder="Enter link here"
            onChange={(e) => setLink(e.target.value)}
            value={link}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between mb-6">
          {loading ? (
            <button
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-70 cursor-not-allowed"
              disabled
            >
              Processing...
            </button>
          ) : (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="submit"
              onClick={(e) => handleSubmit(e)}
            >
              Send
            </button>
          )}
        </div>

        {/* Selected Recipients */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Selected Recipients
          </label>
          {forAll ? (
            <h1 className="font-semibold text-red-500 uppercase">
              Message will be delivered to all
            </h1>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredUsers.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-700 text-gray-300 rounded-lg p-3 shadow-md flex flex-col items-center justify-between"
                >
                  <span className="text-center font-medium">
                    {item?.branch?.studyCentreName}, {item.username}
                  </span>
                  <span
                    className="text-red-500 hover:underline cursor-pointer mt-2"
                    onClick={() => removeSelected(item._id)}
                  >
                    Remove
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Message Table */}
      <MessageTable messages={messages} getMessages={getMessages} />
    </div>

  );
}

export default CreateMessage;
