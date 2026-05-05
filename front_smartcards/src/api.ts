import axios from "axios";
import { logout } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 6000000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // try refresh
      return api
        .post("/auth/refresh")
        .then((res) => {
          const token = res.data.access_token;
          if (token) {
            localStorage.setItem("token", token);
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          }
          logout();
          return Promise.reject(err);
        })
        .catch(() => {
          logout();
          return Promise.reject(err);
        });
    }
    if (err.response?.status === 401) logout();
    return Promise.reject(err);
  },
);

export default api;
