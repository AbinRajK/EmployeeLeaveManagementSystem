import axios from "axios";

// Dynamically check if the user is running the app locally or on GitHub Pages
const isProduction = window.location.hostname !== 'localhost';

const API_URL = isProduction
  ? 'https://employeeleavemanagementsystembackend.onrender.com' // Your live Render API
  : 'http://localhost:5000/api';                                  // Your local development API

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;