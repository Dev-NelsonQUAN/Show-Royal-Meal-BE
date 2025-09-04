import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  getRecentActivity,
  getWaitlistEntries,
  sendEmailToWaitlist,
} from "../controller/admin";
import { login } from "../controller/user";

const adminRouter = express.Router();

adminRouter.post("/login", login);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/activity", getRecentActivity);
adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/waitlist", getWaitlistEntries);
// adminRouter.delete("/")
adminRouter.post("/waitlist/send", sendEmailToWaitlist);
// adminRouter.post("/waitlist/send", protect, admin, sendEmailToWaitlist);

export default adminRouter;
