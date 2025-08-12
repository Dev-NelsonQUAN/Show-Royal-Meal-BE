import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../model/userModel";
import generateToken from "../utils/generate";
import {
  sendUserWelcomeMail,
  sendAdminNotificationMail,
} from "../utils/mailer";
import dotenv from "dotenv";

dotenv.config();

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;
    if (!fullName || !email || !password || !phoneNumber) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      const conflictField =
        existingUser.email === email ? "Email" : "Phone number";
      res.status(409).json({ message: `${conflictField} already exists` });
      return;
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUserPayload = {
      fullName,
      password: hashPassword,
      email,
      phoneNumber,
      role: role || "User",
    };
    const user = await User.create(newUserPayload);

    if (user.role === "Admin") {
      const destinationAdminEmail =
        process.env.ADMIN_EMAIL || "default_admin@example.com";
      await sendAdminNotificationMail(
        destinationAdminEmail,
        user.fullName,
        user.email
      );
      await sendUserWelcomeMail(user.email, user.fullName);
    } else {
      await sendUserWelcomeMail(user.email, user.fullName);
    }
    res.status(201).json({ message: "User created successfully", user });
  } catch (error: unknown) {
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }
    const token = generateToken(String(user._id), String(user.role));
    res.status(200).json({ message: "Login Successful", user, token });
  } catch (error: unknown) {
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ message: errorMessage });
  }
};
