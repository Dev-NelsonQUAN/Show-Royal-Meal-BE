"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const userModel_1 = __importDefault(require("../model/userModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getAllUsers = async (req, res) => {
    try {
        // THE FIX: Add { role: "User" } to the find query.
        // This tells Mongoose to only find documents where the role is "User".
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
// import { Request, Response } from "express";
// import User from "../model/userModel";
// import dotenv from "dotenv";
// dotenv.config();
// export const getAllUsers = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     // We fetch all users but exclude their passwords from the response for security.
//     const users = await User.find({}).select("-password").lean();
//     // We send back the data in the exact format the frontend expects: { users: [...] }
//     res.status(200).json({ message: "All users fetched successfully", users });
//   } catch (error: unknown) {
//     let errorMessage = "An internal server error occurred.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     res.status(500).json({ message: errorMessage });
//   }
// };
