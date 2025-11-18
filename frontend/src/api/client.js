// frontend/src/api/client.js
import axios from "axios";

const apiClient = axios.create({
    baseURL : "http://localhost:3000/api",
    withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;