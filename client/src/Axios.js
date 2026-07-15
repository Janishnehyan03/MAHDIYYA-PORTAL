import axios from "axios";

const Axios = axios.create({
  // baseURL: "http://localhost:5003/api", // Change this to your server's base URL
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  },
  withCredentials: true,
});

export const getUploadsUrl = (fileName) => {
  if (!fileName) return "";
  const baseURL = Axios.defaults.baseURL || "http://localhost:5003/api";
  try {
    if (baseURL.startsWith("http")) {
      const url = new URL(baseURL);
      return `${url.origin}/uploads/${fileName}`;
    }
  } catch (e) {
    console.error(e);
  }
  return `/uploads/${fileName}`;
};

export default Axios;