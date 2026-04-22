import nodemailer from "nodemailer";

// Mock transport for development/local testing
// In production, you would use SMTP details (e.g., SendGrid, Gmail, etc.)
const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025, // MailHog/Mailtrap default
    ignoreTLS: true,
    // Use json transport for local logging if no SMTP server is running
    streamTransport: true,
    newline: 'unix',
    buffer: true
});

export const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: '"Digital Heroes Mission" <hero@digitalheroes.co.in>',
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Sent] To: ${options.email} | Subject: ${options.subject}`);
        // If using streamTransport, you can see the full envelope:
        // console.log(info.message.toString());
        return info;
    } catch (err) {
        console.error("Email Service Error:", err);
    }
};

export const notifySignup = (email, name) => {
    return sendEmail({
        email,
        subject: "Welcome to the Mission, Hero! 🛡️",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #6366f1;">Welcome, ${name}!</h1>
                <p>Your journey with Digital Heroes has begun. Your subscription helps change lives while giving you a chance to win big.</p>
                <p>Log your first score today to enter the next monthly draw!</p>
                <br/>
                <a href="http://localhost:5173/dashboard" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
            </div>
        `
    });
};

export const notifyDrawResults = (email, numbers) => {
    return sendEmail({
        email,
        subject: "The Monthly Draw Results are IN! 🏆",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>The results for this month's draw have been published.</h2>
                <p>Winning Numbers: <strong>${JSON.parse(numbers).join(", ")}</strong></p>
                <p>Check your dashboard to see if you've matched a winning tier!</p>
                <br/>
                <a href="http://localhost:5173/dashboard" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Check Winnings</a>
            </div>
        `
    });
};

export const notifyWinnerVerification = (email, amount, status) => {
    const isPaid = status === 'paid';
    return sendEmail({
        email,
        subject: isPaid ? "Your Payout has been PROCESSED! 💰" : "Claim Status Update",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Status Update: ${status.toUpperCase()}</h2>
                <p>${isPaid ? `Congratulations! Your prize of $${amount} has been successfully verified and paid out.` : `Your claim for $${amount} is currently ${status}.`}</p>
                <p>Log in to view details and charity impact.</p>
                <br/>
                <a href="http://localhost:5173/dashboard" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
            </div>
        `
    });
};
