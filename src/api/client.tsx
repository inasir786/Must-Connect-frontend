import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from cookie to every request
client.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AFTER
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if user is NOT already on login page
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      Cookies.remove("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;