import axios from 'axios';
import { auth } from '../firebase';

const http = axios.create({
  baseURL: 'http://localhost:4000/api', // adjust as needed
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