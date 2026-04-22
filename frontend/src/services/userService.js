import API from "./api";
import { getToken } from "../utils/auth";

export const getAllUsers = () => 
    API.get("/admin/users", { headers: { Authorization: getToken() } });

export const updateUser = (id, data) => 
    API.put(`/admin/users/${id}`, data, { headers: { Authorization: getToken() } });

export const getSystemAnalytics = () =>
    API.get("/admin/analytics", { headers: { Authorization: getToken() } });

// Score Governance
export const getUserScoresAdmin = (userId) =>
    API.get(`/admin/users/${userId}/scores`, { headers: { Authorization: getToken() } });

export const updateScoreAdmin = (scoreId, data) =>
    API.put(`/admin/scores/${scoreId}`, data, { headers: { Authorization: getToken() } });

export const deleteScoreAdmin = (scoreId) =>
    API.delete(`/admin/scores/${scoreId}`, { headers: { Authorization: getToken() } });
