import axios from "axios";
import { auth } from "../firebase";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // adjust as needed
  withCredentials: true, // if using cookies/session
});

http.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
