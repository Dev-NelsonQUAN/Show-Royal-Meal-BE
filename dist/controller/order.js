"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrder = exports.updateOrderStatus = exports.createOrder = void 0;
const productModel_1 = __importDefault(require("../model/productModel"));
const orderModel_1 = __importDefault(require("../model/orderModel"));
const userModel_1 = __importDefault(require("../model/userModel"));
const mailer_1 = require("../utils/mailer");
const createOrder = async (req, res) => {
    try {
        const { items, pickUpDate } = req.body;
        if (!items || items.length === 0) {
            res.status(400).json({ message: "No order items" });
            return;
        }
        let totalAmount = 0;
        for (const item of items) {
            const product = await productModel_1.default.findById(item.productId);
            if (!product) {
                res
                    .status(400)
                    .json({ message: `Product not found : ${item.productId}` });
                return;
            }
            if (item.qty <= 0) {
                res.status(400).json({ message: "Quantity must be one or more" });
                return;
            }
            totalAmount += product.price * item.qty;
            // product.stock -= item.qty;
            await product.save();
            // if (product.stock < item.qty) {
            //   res.status(400).json({
            //     message: `Insufficient stock for : ${product.productName || item.productId}`,
            //   });
            // } else {
            //   totalAmount += product.price * item.qty;
            //   // product.stock -= item.qty;
            //   await product.save();
            // }
        }
        const order = new orderModel_1.default({
            user: req.user._id,
            items,
            totalAmount,
        });
        const createOrder = await order.save();
        const user = await userModel_1.default.findById(req.user?._id);
        if (user) {
            const formattedId = `ORD-${createOrder.orderId}`;
            await (0, mailer_1.sendOrderMail)(user.email, user.fullName, formattedId);
        }
        res
            .status(200)
            .json({ message: "Order placed successfully", newOrder: createOrder });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderModel_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("user");
        if (!order) {
            res.status(400).json({ message: "Order not found" });
            return;
        }
        const user = order.user;
        // --- THIS IS THE FIX ---
        // The orderStatusMail function now takes separate arguments for clarity and reusability.
        await (0, mailer_1.orderStatusMail)(user.email, user.fullName, status, // Cast the status to match the type in the mailer function
        `ORD-${order.orderId}`);
        res.status(200).json({ message: "Status updated" });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getAllOrder = async (req, res) => {
    try {
        const order = await orderModel_1.default.find().populate({
            path: "user",
            select: "fullName email phoneNumber",
        });
        if (!order) {
            res.status(400).json({ message: "Unable to get all order" });
            return;
        }
        res.status(200).json({ message: "All orders", data: order });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.getAllOrder = getAllOrder;
// import { Request, Response } from "express";
// import Product from "../model/productModel";
// import Order from "../model/orderModel";
// import User, { IUser } from "../model/userModel";
// import { orderStatusMail, sendOrderMail } from "../utils/mailer";
// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace Express {
//     interface Request {
//       user?: IUser; // or use specific fields like `_id: string`
//     }
//   }
// }
// export const createOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { items } = req.body;
//     if (!items || items.length === 0) {
//       res.status(400).json({ message: "No order items" });
//       return;
//     }
//     let totalAmount = 0;
//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         res
//           .status(400)
//           .json({ message: `Product not found : ${item.productId}` });
//         return;
//       }
//       if (item.qty <= 0) {
//         res.status(400).json({ message: "Quantity must be one or more" });
//         return;
//       }
//       if (product.stock < item.qty) {
//         res.status(400).json({
//           message: `Insufficient stock for : ${product.productName || item.productId}`,
//         });
//       } else {
//         totalAmount += product.price * item.qty;
//         product.stock -= item.qty;
//         await product.save();
//       }
//     }
//     const order = new Order({
//       user: req.user!._id,
//       items,
//       totalAmount,
//     });
//     const createOrder = await order.save();
//     const user = await User.findById(req.user?._id);
//     if (user) {
//       const formattedId = `ORD-${createOrder.orderId}`;
//       await sendOrderMail(user.email, user.fullName, formattedId);
//     }
//     res
//       .status(200)
//       .json({ message: "Order placed successfully", newOrder: createOrder });
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };
// export const updateOrderStatus = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).populate<{ user: IUser }>("user");
//     if (!order) {
//       res.status(400).json({ message: "Order not found" });
//       return;
//     }
//     const user = order.user;
//     await orderStatusMail({
//       to: user.email,
//       subject: `Order ORD-${order.orderId} Status Updated`,
//       html: `
//         <p>Dear ${user.fullName || "Customer"},</p>
//         <p>Your order status has been updated to: <strong>${status}</strong>.</p>
//         <p>Thank you for shopping with us.</p>
//       `,
//     });
//     res.status(200).json({ message: "Status updated" });
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };
// export const getAllOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const order = await Order.find().populate({
//       path: "user",
//       select: "fullName email phoneNumber",
//     });
//     if (!order) {
//       res.status(400).json({ message: "Unable to get all order" });
//       return;
//     }
//     res.status(200).json({ message: "All orders", data: order });
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };
