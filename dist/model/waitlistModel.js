"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const waitListSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
}, {
    timestamps: true,
});
const WaitListEntry = (0, mongoose_1.model)("waitlistEntry", waitListSchema);
exports.default = WaitListEntry;
