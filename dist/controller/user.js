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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const signUp = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;
        if (!fullName || !email || !password || !phoneNumber) {
            res.status(400).json({ message: "All fields are required" });
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
        const newUserPayload = {
            fullName,
            password: hashPassword,
            email,
            phoneNumber,
            role: role || "User",
        };
        const user = await userModel_1.default.create(newUserPayload);
        if (user.role === "Admin") {
            const destinationAdminEmail = process.env.ADMIN_EMAIL || "default_admin@example.com";
            await (0, mailer_1.sendAdminNotificationMail)(destinationAdminEmail, user.fullName, user.email);
            await (0, mailer_1.sendUserWelcomeMail)(user.email, user.fullName);
        }
        else {
            await (0, mailer_1.sendUserWelcomeMail)(user.email, user.fullName);
        }
        res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.signUp = signUp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        const token = (0, generate_1.default)(String(user._id), String(user.role));
        res.status(200).json({ message: "Login Successful", user, token });
    }
    catch (error) {
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};
exports.login = login;
