import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  getRecentActivity,
  getWaitlistEntries,
  sendEmailToWaitlist,
  verifyAdminToken,
} from "../controller/admin";
import { login } from "../controller/user";
import { admin, protect } from "../middleware/authMiddleware";

const adminRouter = express.Router();

adminRouter.post("/login", login);
adminRouter.get("/users", protect, admin, getAllUsers);
adminRouter.get("/activity", protect, admin, getRecentActivity);
adminRouter.get("/stats", protect, admin, getDashboardStats);
adminRouter.get("/waitlist", protect, admin, getWaitlistEntries);
adminRouter.post("/waitlist/send", protect, admin, sendEmailToWaitlist);
adminRouter.get("/verify-token", protect, admin, verifyAdminToken);
// adminRouter.post("/waitlist/send", protect, admin, sendEmailToWaitlist);

export default adminRouter;
