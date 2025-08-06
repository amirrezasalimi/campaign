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
    // with addToast
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error:", error.response.data);
      // You can add a toast notification here if needed
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API Error: No response received", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
