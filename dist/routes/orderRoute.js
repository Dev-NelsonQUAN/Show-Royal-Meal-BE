"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const order_1 = require("../controller/order");
const orderRouter = express_1.default.Router();
orderRouter.post("/create-order", authMiddleware_1.protect, order_1.createOrder);
orderRouter.put("/status/:id", authMiddleware_1.protect, order_1.updateOrderStatus);
orderRouter.get("/all-order", authMiddleware_1.protect, authMiddleware_1.admin, order_1.getAllOrder);
exports.default = orderRouter;
