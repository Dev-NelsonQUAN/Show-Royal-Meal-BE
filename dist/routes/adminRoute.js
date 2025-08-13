"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controller/admin");
const user_1 = require("../controller/user");
const adminRouter = express_1.default.Router();
adminRouter.post("/login", user_1.login);
adminRouter.get("/users", admin_1.getAllUsers);
adminRouter.get("/activity", admin_1.getRecentActivity);
adminRouter.get("/stats", admin_1.getDashboardStats);
adminRouter.get("/waitlist", admin_1.getWaitlistEntries);
adminRouter.post("/waitlist/send", admin_1.sendEmailToWaitlist);
// adminRouter.post("/waitlist/send", protect, admin, sendEmailToWaitlist);
exports.default = adminRouter;
