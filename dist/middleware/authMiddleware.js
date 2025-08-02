"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const protect = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        const user = await userModel_1.default.findById(decoded.id || decoded._id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token", error });
    }
};
exports.protect = protect;
const admin = (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
        res.status(401).json({ message: "Acess denied" });
        return;
    }
    next();
};
exports.admin = admin;
