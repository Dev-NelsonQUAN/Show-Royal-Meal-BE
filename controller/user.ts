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

// import { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import User from "../model/userModel";
// import generateToken from "../utils/generate";
// import {
//   sendUserWelcomeMail,
//   sendAdminNotificationMail,
// } from "../utils/mailer";
// import dotenv from "dotenv";

// dotenv.config();

// export const signUp = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { fullName, email, password, phoneNumber, role } = req.body;
//     if (!fullName || !email || !password || !phoneNumber) {
//       res.status(400).json({ message: "All fields are required" });
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
//     const newUserPayload = {
//       fullName,
//       password: hashPassword,
//       email,
//       phoneNumber,
//       role: role || "User",
//     };
//     const user = await User.create(newUserPayload);

//     if (user.role === "Admin") {
//       const destinationAdminEmail =
//         process.env.ADMIN_EMAIL || "default_admin@example.com";
//       await sendAdminNotificationMail(
//         destinationAdminEmail,
//         user.fullName,
//         user.email
//       );
//       await sendUserWelcomeMail(user.email, user.fullName);
//     } else {
//       await sendUserWelcomeMail(user.email, user.fullName);
//     }
//     res.status(201).json({ message: "User created successfully", user });
//   } catch (error: unknown) {
//     let errorMessage = "An internal server error occurred.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     res.status(500).json({ message: errorMessage });
//   }
// };

// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       res.status(400).json({ message: "Email and password are required." });
//       return;
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(401).json({ message: "Invalid credentials." });
//       return;
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       res.status(401).json({ message: "Invalid credentials." });
//       return;
//     }
//     const token = generateToken(String(user._id), String(user.role));
//     res.status(200).json({ message: "Login Successful", user, token });
//   } catch (error: unknown) {
//     let errorMessage = "An internal server error occurred.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     res.status(500).json({ message: errorMessage });
//   }
// };

// import { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import User from "../model/userModel";
// import generateToken from "../utils/generate";
// import {
//   sendUserWelcomeMail,
//   sendAdminNotificationMail,
// } from "../utils/mailer";
// import dotenv from "dotenv";

// dotenv.config();

// export const signUp = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { fullName, email, password, phoneNumber, role } = req.body;
//     if (!fullName || !email || !password || !phoneNumber) {
//       res.status(400).json({ message: "All fields are required" });
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
//     const newUserPayload = {
//       fullName,
//       password: hashPassword,
//       email,
//       phoneNumber,
//       role: role || "User",
//     };
//     const user = await User.create(newUserPayload);

//     if (user.role === "Admin") {
//       const destinationAdminEmail =
//         process.env.ADMIN_EMAIL || "default_admin@example.com";
//       await sendAdminNotificationMail(
//         destinationAdminEmail,
//         user.fullName,
//         user.email
//       );
//       await sendUserWelcomeMail(user.email, user.fullName);
//     } else {
//       await sendUserWelcomeMail(user.email, user.fullName);
//     }
//     res.status(201).json({ message: "User created successfully", user });
//   } catch (error: unknown) {
//     let errorMessage = "An internal server error occurred.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     res.status(500).json({ message: errorMessage });
//   }
// };

// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       res.status(400).json({ message: "Email and password are required." });
//       return;
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(401).json({ message: "Invalid credentials." });
//       return;
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       res.status(401).json({ message: "Invalid credentials." });
//       return;
//     }
//     if (user.role !== "Admin") {
//       res
//         .status(403)
//         .json({ message: "Access Forbidden: You are not an administrator." });
//       return;
//     }
//     const token = generateToken(String(user._id), String(user.role));
//     res.status(200).json({ message: "Admin Login Successful", user, token });
//   } catch (error: unknown) {
//     let errorMessage = "An internal server error occurred.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     res.status(500).json({ message: errorMessage });
//   }
// };

// // import { Request, Response } from "express";
// // import bcrypt from "bcryptjs";
// // import User from "../model/userModel";
// // import generateToken from "../utils/generate";
// // import {
// //   sendUserWelcomeMail,
// //   sendAdminNotificationMail,
// // } from "../utils/mailer";
// // import dotenv from "dotenv";

// // dotenv.config();

// // export const signUp = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { fullName, email, password, phoneNumber, role } = req.body;
// //     if (!fullName || !email || !password || !phoneNumber) {
// //       res.status(400).json({ message: "All fields are required" });
// //       return;
// //     }
// //     const existingUser = await User.findOne({
// //       $or: [{ email }, { phoneNumber }],
// //     });
// //     if (existingUser) {
// //       const conflictField =
// //         existingUser.email === email ? "Email" : "Phone number";
// //       res.status(409).json({ message: `${conflictField} already exists` });
// //       return;
// //     }
// //     const hashPassword = await bcrypt.hash(password, 10);
// //     const newUserPayload = {
// //       fullName,
// //       password: hashPassword,
// //       email,
// //       phoneNumber,
// //       role: role || "User",
// //     };
// //     const user = await User.create(newUserPayload);

// //     if (user.role === "Admin") {
// //       const destinationAdminEmail =
// //         process.env.ADMIN_EMAIL || "default_admin@example.com";
// //       await sendAdminNotificationMail(
// //         destinationAdminEmail,
// //         user.fullName,
// //         user.email
// //       );
// //       await sendUserWelcomeMail(user.email, user.fullName);
// //     } else {
// //       await sendUserWelcomeMail(user.email, user.fullName);
// //     }
// //     res.status(201).json({ message: "User created successfully", user });
// //   } catch (error: unknown) {
// //     console.error("Signup error:", error);
// //     let errorMessage = "An internal server error occurred.";
// //     if (error instanceof Error) {
// //       errorMessage = error.message;
// //     }
// //     res.status(500).json({ message: errorMessage });
// //   }
// // };

// // export const login = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { email, password } = req.body;
// //     if (!email || !password) {
// //       return res.status(400).json({ message: "Email and password are required." });
// //     }
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       return res.status(401).json({ message: "Invalid credentials." });
// //     }
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ message: "Invalid credentials." });
// //     }
// //     if (user.role !== 'Admin') {
// //       return res.status(403).json({ message: "Access Forbidden: You are not an administrator." });
// //     }
// //     const token = generateToken(String(user._id), String(user.role));
// //     res.status(200).json({ message: "Admin Login Successful", user, token });
// //   } catch (error: unknown) {
// //     console.error("Admin Login error:", error);
// //     let errorMessage = "An internal server error occurred.";
// //     if (error instanceof Error) {
// //       errorMessage = error.message;
// //     }
// //     res.status(500).json({ message: errorMessage });
// //   }
// // };

// // import { Request, Response } from "express";
// // import bcrypt from "bcryptjs";
// // import User from "../model/userModel";
// // import generateToken from "../utils/generate";
// // import {
// //   sendUserWelcomeMail,
// //   sendAdminNotificationMail,
// // } from "../utils/mailer";
// // import dotenv from "dotenv";

// // dotenv.config();

// // export const signUp = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { fullName, email, password, phoneNumber, role } = req.body;
// //     if (!fullName || !email || !password || !phoneNumber) {
// //       res.status(400).json({ message: "All fields required" });
// //       return;
// //     }
// //     const existingUser = await User.findOne({
// //       $or: [{ email }, { phoneNumber }],
// //     });
// //     if (existingUser) {
// //       const conflictField =
// //         existingUser.email === email ? "Email" : "Phone number";
// //       res.status(409).json({ message: `${conflictField} already exists` });
// //       return;
// //     }
// //     const hashPassword = await bcrypt.hash(password, 10);
// //     const user = await User.create({
// //       fullName,
// //       password: hashPassword,
// //       email,
// //       phoneNumber,
// //       role,
// //     });

// //     if (user.role === "Admin") {
// //       const destinationAdminEmail =
// //         process.env.ADMIN_EMAIL || "default_admin@example.com";
// //       await sendAdminNotificationMail(
// //         destinationAdminEmail,
// //         user.fullName,
// //         user.email
// //       );
// //       await sendUserWelcomeMail(user.email, user.fullName);
// //     } else {
// //       await sendUserWelcomeMail(user.email, user.fullName);
// //     }

// //     res.status(201).json({ message: "User created successfully", user });
// //   } catch (error: unknown) {
// //     console.error("Signup error:", error);
// //     let errorMessage = "An internal server error occurred.";
// //     if (error instanceof Error) {
// //       errorMessage = error.message;
// //     }
// //     res.status(500).json({ message: errorMessage });
// //   }
// // };

// // export const login = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       res.status(401).json({ message: "Invalid credentials" });
// //       return;
// //     }
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       res.status(401).json({ message: "Invalid credentials" });
// //       return;
// //     }

// //     const token = generateToken(String(user._id), String(user.role));

// //     res.status(200).json({ message: "Login Successful", user, token });
// //   } catch (error: unknown) {
// //     console.error("Login error:", error);
// //     let errorMessage = "An internal server error occurred.";
// //     if (error instanceof Error) {
// //       errorMessage = error.message;
// //     }
// //     res.status(500).json({ message: errorMessage });
// //   }
// // };

// // import { Request, Response } from "express";
// // import bcrypt from "bcryptjs";
// // import User from "../model/userModel";
// // import generateToken from "../utils/generate";
// // import {
// //   sendUserWelcomeMail, // Import the new welcome functions
// //   sendAdminNotificationMail,
// // } from "../utils/mailer";
// // import dotenv from "dotenv";

// // dotenv.config(); // Load environment variables

// // export const signUp = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { fullName, email, password, phoneNumber, role = "User" } = req.body;
// //     if (!fullName || !email || !password || !phoneNumber) {
// //       res.status(400).json({ message: "All fields required" });
// //       return;
// //     }
// //     const existingUser = await User.findOne({
// //       $or: [{ email }, { phoneNumber }],
// //     });
// //     if (existingUser) {
// //       const conflictField =
// //         existingUser.email === email ? "Email" : "Phone number";
// //       res.status(409).json({ message: `${conflictField} already exists` });
// //       return;
// //     }
// //     const hashPassword = await bcrypt.hash(password, 10);
// //     const user = await User.create({
// //       fullName,
// //       password: hashPassword,
// //       email,
// //       phoneNumber,
// //       role,
// //     });

// //     // --- Conditional Mailer Logic ---
// //     if (user.role === "Admin") {
// //       // Send a notification email to the admin to confirm a new admin user was created.
// //       // You should specify a destination admin email here, or get it from your .env.
// //       // It's crucial to have this environment variable set for admin notifications.
// //       const destinationAdminEmail =
// //         process.env.ADMIN_EMAIL || "default_admin@example.com";
// //       await sendAdminNotificationMail(
// //         destinationAdminEmail,
// //         user.fullName,
// //         user.email
// //       );
// //       // Optionally, send a welcome email to the new admin user as well
// //       await sendUserWelcomeMail(user.email, user.fullName); // Using the general welcome for now
// //     } else {
// //       // Send a welcome email to the new regular user
// //       await sendUserWelcomeMail(user.email, user.fullName);
// //     }
// //     // --- End Conditional Mailer Logic ---

// //     res.status(201).json({ message: "User created successfully", user });
// //   } catch (error) {
// //     console.error("Signup error:", error);
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };

// // export const login = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       res.status(400).json({ message: "User not found. Please signup" });
// //       return;
// //     }
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       res.status(400).json({ message: "Incorrect Password" });
// //       return;
// //     }

// //     const token = generateToken(String(user._id), String(user.role));

// //     res.status(200).json({ message: "Login Successful", user, token });
// //   } catch (error) {
// //     console.error("Login error:", error); // Added for better debugging
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };

// // import { Request, Response } from "express";
// // import bcrypt from "bcryptjs";
// // import User from "../model/userModel";
// // import generateToken from "../utils/generate";
// // import { welcomeMail } from "../utils/mailer";

// // export const signUp = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { fullName, email, password, phoneNumber, role = "User" } = req.body;
// //     if (!fullName || !email || !password || !phoneNumber) {
// //       res.status(400).json({ message: "All fields required" });
// //       return;
// //     }
// //     const existingUser = await User.findOne({
// //       $or: [{ email }, { phoneNumber }],
// //     });
// //     if (existingUser) {
// //       const conflictField =
// //         existingUser.email === email ? "Email" : "Phone number";
// //       res.status(409).json({ message: `${conflictField} already exists` });
// //       return;
// //     }
// //     const hashPassword = await bcrypt.hash(password, 10);
// //     const user = await User.create({
// //       fullName,
// //       password: hashPassword,
// //       email,
// //       phoneNumber,
// //       role,
// //     });

// //     await welcomeMail(user.email, user.fullName);

// //     res.status(201).json({ message: "User created successfully", user });
// //   } catch (error) {
// //     console.error("Signup error:", error);
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };

// // export const login = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       res.status(400).json({ message: "User not found. Please signup" });
// //       return;
// //     }
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       res.status(400).json({ message: "Incorrect Password" });
// //       return;
// //     }

// //     const token = generateToken(String(user._id), String(user.role));

// //     res.status(200).json({ message: "Login Successful", user, token });
// //   } catch (error) {
// //     console.error("Login error:", error); // Added for better debugging
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };
