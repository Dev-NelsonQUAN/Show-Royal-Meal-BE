import { Request, Response } from "express";
import User from "../model/userModel";
import dotenv from "dotenv";
import Order from "../model/orderModel";
import WaitlistEntry from "../model/waitlistModel"; // Make sure you have this model from the previous step

dotenv.config();

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // THE FIX: Add { role: "User" } to the find query.
    // This tells Mongoose to only find documents where the role is "User".
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

// In a new file like src/controllers/adminController.ts

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

    // 4. Combine, sort by date, and take the latest few
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

// export const getRecentActivity = async (req: Request, res: Response) => {
//   const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
//   res.status(200).json({ activities });
// };
