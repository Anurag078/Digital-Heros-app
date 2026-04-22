import API from "./api";
import { getToken } from "../utils/auth";

export const subscribeUser = (plan, paymentMethodId) =>
    API.post(
        "/subscription",
        { plan, paymentMethodId },
        { headers: { Authorization: getToken() } }
    );

export const cancelSubscription = () =>
    API.post(
        "/subscription/cancel",
        {},
        { headers: { Authorization: getToken() } }
    );