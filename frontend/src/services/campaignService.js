import API from "./api";
import { getToken } from "../utils/auth";

export const getCampaigns = () => API.get("/campaigns");

export const createCampaign = (data) =>
    API.post("/campaigns", data, { headers: { Authorization: getToken() } });

export const updateCampaign = (id, data) =>
    API.put(`/campaigns/${id}`, data, { headers: { Authorization: getToken() } });

export const deleteCampaign = (id) =>
    API.delete(`/campaigns/${id}`, { headers: { Authorization: getToken() } });
