import axios from "axios";
import { getToken } from "../storage/authUserStorage";

export const api = axios.create({
  baseURL: "http://192.168.1.245:3000/api",
});

api.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // console.log(token);
  return config;
});