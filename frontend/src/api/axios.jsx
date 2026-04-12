import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
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
        const refresh = localStorage.getItem("refreshToken");

        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post(
          "http://127.0.0.1:8000/client/refresh/",
          { refresh }
        );

        const newAccess = res.data.accessToken; 

        localStorage.setItem("accessToken", newAccess);

        originalRequest.headers.Auth = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/";

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
export default api;