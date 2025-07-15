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

export default Axios;