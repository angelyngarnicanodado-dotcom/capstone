import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://capstone-08sz.onrender.com',
  withCredentials: true
});

export default axiosInstance;
