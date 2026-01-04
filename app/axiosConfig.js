import axios from 'axios';
import * as SecureStore from "expo-secure-store";


const axiosInstance = axios.create({
  //baseURL: process.env.EXPO_PUBLIC_API_ENDPOINT,
  baseURL: process.env.EXPO_PUBLIC_API_LOCAL_ENDPOINT,
  withCredentials: false,
  timeout: 80000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;