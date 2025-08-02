"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    try {
        const mongoDb = process.env.MONGODB_URL;
        if (!mongoDb) {
            console.error("Error: MONGO_URI is not defined in environment variables. Please set it in your .env file.");
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoDb);
        console.log("MongoDB connected successfully");
    }
    catch (err) {
        console.log("Error connecting to Db", err);
    }
};
exports.default = connectDb;
