import API from "./api";
import { getToken } from "../utils/auth";

export const getCharities = () => API.get("/charities");

export const selectCharity = (id) =>
    API.post(
        "/charities/select",
        { charity_id: id },
        { headers: { Authorization: getToken() } }
    );

export const createCharity = (data) =>
    API.post("/charities", data, { headers: { Authorization: getToken() } });

export const updateCharity = (id, data) =>
    API.put(`/charities/${id}`, data, { headers: { Authorization: getToken() } });

export const deleteCharity = (id) =>
    API.delete(`/charities/${id}`, { headers: { Authorization: getToken() } });

export const setRecipient = (id) =>
    API.post(`/charities/${id}/recipient`, {}, { headers: { Authorization: getToken() } });