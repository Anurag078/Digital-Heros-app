import axios from "axios";
import { getToken } from "../utils/auth";

const API = axios.create({
    baseURL: "http://localhost:5000/api/v1",
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

export default API;