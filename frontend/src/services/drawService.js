import API from "./api";
import { getToken } from "../utils/auth";

export const runDraw = (logic = "random") => 
    API.post("/draws/run", { logic }, { headers: { Authorization: getToken() } });

export const publishDraw = (drawId) => 
    API.post("/draws/publish", { drawId }, { headers: { Authorization: getToken() } });

export const getLastDraw = () => API.get("/draws/last");

export const getAllDraws = () => API.get("/draws/history", { headers: { Authorization: getToken() } });