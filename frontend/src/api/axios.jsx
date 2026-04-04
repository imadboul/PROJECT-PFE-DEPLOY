// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      const res = await axios.post("http://127.0.0.1:8000/client/refresh/", {
        refresh: refresh,
      });

      localStorage.setItem("access", res.data.access);

      originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
export default api;