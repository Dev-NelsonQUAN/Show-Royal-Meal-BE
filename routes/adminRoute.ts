import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  getRecentActivity,
  getWaitlistEntries,
} from "../controller/admin";
import { login } from "../controller/user";

const adminRouter = express.Router();

adminRouter.post("/login", login);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/activity", getRecentActivity);
adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/waitlist", getWaitlistEntries);

export default adminRouter;
