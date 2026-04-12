import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Auth= `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/client/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken  ");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const res = await axios.post(
          "http://127.0.0.1:8000/client/refresh/",
          { refresh: refreshToken }
        );

        const newAccess = res.data.accessToken; 
        localStorage.setItem("accessToken", newAccess);

        originalRequest.headers.Auth = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;