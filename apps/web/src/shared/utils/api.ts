import axios from "axios";
import { API_URL } from "../constants/common";
import { addToast } from "@heroui/react";
// axios interceptor
const API = axios.create({
  baseURL: API_URL,
});
// add interceptor to handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    addToast({
      title: "Error",
      description: errorMessage,
      variant: "solid",
      color: "danger",
    });
    return Promise.reject(error);
  }
);

export default API;
