import API from "./api";
import { getToken } from "../utils/auth";

export const getMyWinnings = () =>
    API.get("/winnings/my", {
        headers: { Authorization: getToken() },
    });

export const claimWinning = (winningId, proofImage) =>
    API.post(
        "/winnings/claim",
        { winningId, proofImage },
        { headers: { Authorization: getToken() } }
    );

export const getAllWinnings = () =>
    API.get("/winnings/all", {
        headers: { Authorization: getToken() },
    });

export const verifyWinning = (winningId, status, notes, proofImage = null) =>
    API.post(
        "/winnings/verify",
        { winningId, status, notes, proofImage },
        { headers: { Authorization: getToken() } }
    );
