"use client";

import axios from "axios";
import type { User } from "@/types";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  },
);

export const feelingAnalyzerAPI = {
  analyzeSymptoms: async (symptoms: string) => {
    const parsedUser = JSON.parse(localStorage.getItem("user") || "{}") as Partial<User>;

    const response = await api.post(
      "/generate",
      {
        content: symptoms,
        timestamp: new Date().toISOString(),
        userId: parsedUser.email ?? "",
      },
      {
        timeout: 60000,
      },
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API Error: ${response.status}`);
    }

    if (!response.data || typeof response.data !== "object") {
      throw new Error("API Error: Invalid response payload");
    }

    return response.data;
  },
};

export default api;
