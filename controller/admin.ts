import { Request, Response } from "express";
import User from "../model/userModel";
import dotenv from "dotenv";
import Order from "../model/orderModel";
import WaitlistEntry from "../model/waitlistModel";
import { sendBulkWaitlistEmail } from "../utils/mailer";
import { IUser } from "../model/userModel";

dotenv.config();

interface AuthRequest extends Request {
  user?: IUser;
}

export const verifyAdminToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.status(200).json({ user: req.user });
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ role: "User" }).select("-password").lean();

    res.status(200).json({ message: "All users fetched successfully", users });
  } catch (error: unknown) {
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};

export const getRecentActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Get the 5 most recent new users
    const recentUsers = await User.find({ role: "User" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 2. Get the 5 most recent new orders
    const recentOrders = await Order.find({})
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

    const allActivities = [...userActivities, ...orderActivities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5); // Get the top 5 most recent events overall

    res.status(200).json({ activities: allActivities });
  } catch (error: unknown) {
    let errorMessage = "An error occurred fetching recent activity.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [pendingOrders, newCustomersToday] = await Promise.all([
      Order.countDocuments({ status: "Pending" }),
      User.countDocuments({
        role: "User",
        createdAt: { $gte: today, $lt: tomorrow },
      }),
    ]);

    res.status(200).json({
      pendingOrders,
      newCustomersToday,
    });
  } catch (error: unknown) {
    let errorMessage = "An internal server error occurred fetching stats.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};

export const getWaitlistEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch all entries and sort by the newest first
    const waitlist = await WaitlistEntry.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Send back the data in a format the frontend expects
    res
      .status(200)
      .json({ message: "Waitlist fetched successfully", waitlist });
  } catch (error: unknown) {
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};

export const sendEmailToWaitlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      res.status(400).json({ message: "Subject and message are required." });
      return;
    }

    // 1. Get all emails from the waitlist
    const waitlistEntries = await WaitlistEntry.find({}).select("email").lean();
    const recipientEmails = waitlistEntries.map((entry) => entry.email);

    if (recipientEmails.length === 0) {
      res.status(404).json({ message: "No users found on the waitlist." });
      return;
    }

    // 2. Send the emails (don't wait for it to finish)
    sendBulkWaitlistEmail(recipientEmails, subject, message);

    // 3. Immediately respond to the admin so they don't have to wait
    res.status(200).json({
      message: `Email campaign started. It will be sent to ${recipientEmails.length} recipients in the background.`,
    });
  } catch (error: unknown) {
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};

// export const getRecentActivity = async (req: Request, res: Response) => {
//   const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
//   res.status(200).json({ activities });
// };
