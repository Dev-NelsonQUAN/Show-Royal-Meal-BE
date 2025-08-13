"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailToWaitlist = exports.getWaitlistEntries = exports.getDashboardStats = exports.getRecentActivity = exports.getAllUsers = void 0;
const userModel_1 = __importDefault(require("../model/userModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const orderModel_1 = __importDefault(require("../model/orderModel"));
const waitlistModel_1 = __importDefault(require("../model/waitlistModel")); // Make sure you have this model from the previous step
const mailer_1 = require("../utils/mailer"); // Import the new mailer function
dotenv_1.default.config();
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_1.default.find({ role: "User" }).select("-password").lean();
        res.status(200).json({ message: "All users fetched successfully", users });
    }
    catch (error) {
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.getAllUsers = getAllUsers;
const getRecentActivity = async (req, res) => {
    try {
        // 1. Get the 5 most recent new users
        const recentUsers = await userModel_1.default.find({ role: "User" })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        // 2. Get the 5 most recent new orders
        const recentOrders = await orderModel_1.default.find({})
            .sort({ date: -1 })
            .limit(5)
            .lean();
        // 3. Map them into a consistent format for the frontend
        const userActivities = recentUsers.map((user) => ({
            type: "info",
            title: `New customer ${user.fullName || "user"} registered`,
            timestamp: user.createdAt,
        }));
        const orderActivities = recentOrders.map((order) => ({
            type: "warning",
            title: `New order #${order.orderId} received`,
            timestamp: order.date,
        }));
        // 4. Combine, sort by date, and take the latest few
        const allActivities = [...userActivities, ...orderActivities]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5); // Get the top 5 most recent events overall
        res.status(200).json({ activities: allActivities });
    }
    catch (error) {
        let errorMessage = "An error occurred fetching recent activity.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.getRecentActivity = getRecentActivity;
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [pendingOrders, newCustomersToday] = await Promise.all([
            orderModel_1.default.countDocuments({ status: "Pending" }),
            userModel_1.default.countDocuments({
                role: "User",
                createdAt: { $gte: today, $lt: tomorrow },
            }),
        ]);
        res.status(200).json({
            pendingOrders,
            newCustomersToday,
        });
    }
    catch (error) {
        let errorMessage = "An internal server error occurred fetching stats.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.getDashboardStats = getDashboardStats;
const getWaitlistEntries = async (req, res) => {
    try {
        // Fetch all entries and sort by the newest first
        const waitlist = await waitlistModel_1.default.find({})
            .sort({ createdAt: -1 })
            .lean();
        // Send back the data in a format the frontend expects
        res
            .status(200)
            .json({ message: "Waitlist fetched successfully", waitlist });
    }
    catch (error) {
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.getWaitlistEntries = getWaitlistEntries;
const sendEmailToWaitlist = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            res.status(400).json({ message: "Subject and message are required." });
            return;
        }
        // 1. Get all emails from the waitlist
        const waitlistEntries = await waitlistModel_1.default.find({}).select("email").lean();
        const recipientEmails = waitlistEntries.map((entry) => entry.email);
        if (recipientEmails.length === 0) {
            res.status(404).json({ message: "No users found on the waitlist." });
            return;
        }
        // 2. Send the emails (don't wait for it to finish)
        (0, mailer_1.sendBulkWaitlistEmail)(recipientEmails, subject, message);
        // 3. Immediately respond to the admin so they don't have to wait
        res.status(200).json({
            message: `Email campaign started. It will be sent to ${recipientEmails.length} recipients in the background.`,
        });
    }
    catch (error) {
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.sendEmailToWaitlist = sendEmailToWaitlist;
// export const getRecentActivity = async (req: Request, res: Response) => {
//   const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
//   res.status(200).json({ activities });
// };
