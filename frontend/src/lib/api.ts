import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const saved = localStorage.getItem("cleaning_auth");

    if (saved && config.headers) {
      try {
        const parsed = JSON.parse(saved);
        const token = parsed.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
