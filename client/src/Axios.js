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
  const encodedName = encodeURIComponent(fileName);
  const baseURL = Axios.defaults.baseURL || "/api";
  try {
    if (baseURL.startsWith("http")) {
      const url = new URL(baseURL);
      return `${url.origin}/api/uploads/file/${encodedName}`;
    }
  } catch (e) {
    console.error(e);
  }
  return `/api/uploads/file/${encodedName}`;
};

export default Axios;