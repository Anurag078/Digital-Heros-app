import db from "../config/db.js";

// SUBSCRIBE
export const subscribe = async (req, res) => {
    const userId = req.user.id;
    const { plan, paymentMethodId } = req.body; // paymentMethodId simulates Stripe token

    // 1. Mock Gateway Validation (PCI Compliance Simulation)
    if (!paymentMethodId || paymentMethodId === "fail") {
        return res.status(400).json({ message: "Payment gateway validation failed. Invalid card." });
    }

    // 2. Lifecycle & Expiry Calculation
    let expiry = new Date();
    if (plan === "monthly") {
        expiry.setMonth(expiry.getMonth() + 1);
    } else if (plan === "yearly") {
        expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
        return res.status(400).json({ message: "Invalid subscription plan selected." });
    }

    const { error } = await db.from("users").update({
        subscription_status: 1, 
        plan, 
        expiry_date: expiry 
    }).eq("id", userId);

    if (error) return res.status(500).json(error);
    res.json({ message: "Subscription activated successfully (Payment Verified)", expiry });
};

// CANCEL SUBSCRIPTION (MOCK)
export const cancelSubscription = async (req, res) => {
    const userId = req.user.id;
    // In a real app we'd trigger a Stripe cancellation
    const { error } = await db.from("users").update({ 
        subscription_status: 0 
    }).eq("id", userId);

    if (error) return res.status(500).json(error);
    res.json({ message: "Subscription cancelled successfully" });
};