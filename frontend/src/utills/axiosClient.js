// axiosClient.js
import axios from "axios";

// Create an Axios instance
 const axiosClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials:true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;