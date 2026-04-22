import API from "./api";
import { getToken } from "../utils/auth";

export const addScore = (data) =>
    API.post("/scores", data, {
        headers: { Authorization: getToken() },
    });

export const getScores = () =>
    API.get("/scores", {
        headers: { Authorization: getToken() },
    });