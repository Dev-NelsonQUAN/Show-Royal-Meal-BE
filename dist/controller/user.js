"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../model/userModel"));
const generate_1 = __importDefault(require("../utils/generate"));
const mailer_1 = require("../utils/mailer");
const signUp = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber } = req.body;
        if (!fullName || !email || !password || !phoneNumber) {
            res.status(400).json({ message: "All fields required" });
            return;
        }
        const existingUser = await userModel_1.default.findOne({
            $or: [{ email }, { phoneNumber }],
        });
        if (existingUser) {
            const conflictField = existingUser.email === email ? "Email" : "Phone number";
            res.status(409).json({ message: `${conflictField} already exists` });
            return;
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await userModel_1.default.create({
            fullName,
            password: hashPassword,
            email,
            phoneNumber,
        });
        await (0, mailer_1.welcomeMail)(user.email, user.fullName);
        res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.signUp = signUp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found. Please signup" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Incorrect Password" });
            return;
        }
        const token = (0, generate_1.default)(String(user._id), String(user.role));
        res.status(200).json({ message: "Login Successful", user, token });
    }
    catch (error) {
        console.error("Login error:", error); // Added for better debugging
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.login = login;
// import { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import User from "../model/userModel";
// import generateToken from "../utils/generate";
// import { welcomeMail } from "../utils/mailer";
// export const signUp = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { fullName, email, password, phoneNumber } = req.body;
//     if (!fullName || !email || !password || !phoneNumber) {
//       res.status(400).json({ message: "All fields required" });
//       return;
//     }
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phoneNumber }],
//     });
//     if (existingUser) {
//       const conflictField =
//         existingUser.email === email ? "Email" : "Phone number";
//       res.status(409).json({ message: `${conflictField} already exists` });
//       return;
//     }
//     const hashPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       fullName,
//       password: hashPassword,
//       email,
//       phoneNumber,
//     });
//     await welcomeMail({
//       to: user.email,
//       subject: "Welcome to Show Royal Meal",
//       html: `
//       <h3>Hello ${fullName},</h3>
//       <p>Welcome to Show Royal! We're are excited to have you with us.</p>
//       `,
//     });
//     res.status(201).json({ message: "User created successfully", user });
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };
// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(400).json({ message: "User not found. Please signup" });
//       return;
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       res.status(400).json({ message: "Incorrect Password" });
//       return;
//     }
//     const token = generateToken(String(user._id), String(user.role));
//     res.status(200).json({ message: "Login Successful", user, token });
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };
