import axios from "axios";
import Cookies from "js-cookie";
import React from 'react';
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    const status = error.response?.status;
    const isAuthError = status === 401 || status === 403;
    if (isAuthError && typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      Cookies.remove("access_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default client;