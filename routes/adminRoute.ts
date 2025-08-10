import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  getRecentActivity,
} from "../controller/admin";

const adminRouter = express.Router();

adminRouter.get("/users", getAllUsers);
adminRouter.get("/activity", getRecentActivity);
adminRouter.get("/stats", getDashboardStats);

export default adminRouter;
