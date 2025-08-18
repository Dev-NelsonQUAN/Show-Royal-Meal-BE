import { Request, Response } from "express";
import { Types } from "mongoose"; // Import Types for ObjectId
import Product from "../model/productModel";
import Order from "../model/orderModel";
import User, { IUser } from "../model/userModel";
import { orderStatusMail, sendOrderMail } from "../utils/mailer";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("RECEIVED REQUEST BODY:", JSON.stringify(req.body, null, 2));

    const { items, pickUpDate, notes, payment } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: "No order items" });
      return;
    }
    if (!payment || !payment.method) {
      res
        .status(400)
        .json({ message: "Payment details (method) are required." });
      return;
    }

    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res
          .status(400)
          .json({ message: `Product not found: ${item.productId}` });
        return;
      }
      if (item.qty <= 0) {
        res.status(400).json({ message: "Quantity must be one or more" });
        return;
      }
      totalAmount += product.price * item.qty;
    }

    const order = new Order({
      user: req.user!._id,
      items,
      pickUpDate,
      totalAmount,
      notes,
      payment,
    });

    const createdOrder = await order.save();

    const user = await User.findById(req.user?._id);
    if (user) {
      const formattedId = `ORD-${createdOrder.orderId}`;
      await sendOrderMail(user.email, user.fullName, formattedId);
    }
    res
      .status(201)
      .json({ message: "Order placed successfully", newOrder: createdOrder });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the order." });
  }
};

// updateOrderStatus remains correct. No changes needed.
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate<{ user: IUser }>("user");

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    const user = order.user;

    await orderStatusMail(
      user.email,
      user.fullName,
      status as "shipped" | "delivered" | "cancelled",
      `ORD-${order.orderId}`
    );

    res.status(200).json({ message: "Status updated successfully", order });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
};

// --- THIS IS THE CORRECTED FUNCTION ---
export const getAllOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate<{ user: IUser }>({
        path: "user",
        select: "fullName email phoneNumber",
      })
      .populate({
        path: "items.productId",
        model: "Product",
        select: "productName price",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Define the shape of a lean item after population
    type LeanOrderItem = {
      productId: { _id: Types.ObjectId; productName: string; price: number };
      qty: number;
      _id: Types.ObjectId;
    };

    // Transform the data, ensuring TypeScript understands the item shape
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: (order.items as LeanOrderItem[]).map((item) => ({
        product: item.productId, // Rename populated field
        qty: item.qty,
        _id: item._id,
      })),
    }));

    res.status(200).json({
      message: "All orders fetched successfully",
      data: formattedOrders,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
};

// import { Request, Response } from "express";
// import Product from "../model/productModel";
// import Order from "../model/orderModel"; // 'IOrder' import removed
// import User, { IUser } from "../model/userModel";
// import { orderStatusMail, sendOrderMail } from "../utils/mailer";
// import mongoose from "mongoose";

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace Express {
//     interface Request {
//       user?: IUser;
//     }
//   }
// }

// // createOrder function remains correct. No changes needed.
// export const createOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { items, pickUpDate, notes, payment } = req.body;

//     if (!items || items.length === 0) {
//       res.status(400).json({ message: "No order items" });
//       return;
//     }
//     if (!payment || !payment.method) {
//       res
//         .status(400)
//         .json({ message: "Payment details (method) are required." });
//       return;
//     }

//     let totalAmount = 0;
//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         res
//           .status(400)
//           .json({ message: `Product not found: ${item.productId}` });
//         return;
//       }
//       if (item.qty <= 0) {
//         res.status(400).json({ message: "Quantity must be one or more" });
//         return;
//       }
//       totalAmount += product.price * item.qty;
//     }

//     const order = new Order({
//       user: req.user!._id,
//       items,
//       pickUpDate,
//       totalAmount,
//       notes,
//       payment,
//     });

//     const createdOrder = await order.save();

//     const user = await User.findById(req.user?._id);
//     if (user) {
//       const formattedId = `ORD-${createdOrder.orderId}`;
//       await sendOrderMail(user.email, user.fullName, formattedId);
//     }
//     res
//       .status(201)
//       .json({ message: "Order placed successfully", newOrder: createdOrder });
//   } catch (error: unknown) {
//     // eslint-disable-next-line no-console
//     console.error("Error creating order:", error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while creating the order." });
//   }
// };

// // updateOrderStatus remains correct. No changes needed.
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
//       res.status(404).json({ message: "Order not found" });
//       return;
//     }
//     const user = order.user;

//     await orderStatusMail(
//       user.email,
//       user.fullName,
//       status as "shipped" | "delivered" | "cancelled",
//       `ORD-${order.orderId}`
//     );

//     res.status(200).json({ message: "Status updated successfully", order });
//   } catch (error: unknown) {
//     // eslint-disable-next-line no-console
//     console.error("Error updating order status:", error);
//     res.status(500).json({ message: "An internal server error occurred" });
//   }
// };

// // --- THIS IS THE CORRECTED FUNCTION ---
// export const getAllOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const orders = await Order.find()
//       .populate<{ user: IUser }>({
//         path: "user",
//         select: "fullName email phoneNumber",
//       })
//       .populate({
//         path: "items.productId",
//         model: "Product",
//         select: "productName price",
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     // Transform the data to match the frontend's desired structure
//     const formattedOrders = orders.map((order) => ({
//       ...order,
//       items: order.items.map((item) => {
//         // --- FIX: Explicitly cast 'item' to include the '_id' property ---
//         const leanItem = item as typeof item & { _id: mongoose.Types.ObjectId };
//         return {
//           product: leanItem.productId,
//           qty: leanItem.qty,
//           _id: leanItem._id,
//         };
//       }),
//     }));

//     res.status(200).json({
//       message: "All orders fetched successfully",
//       data: formattedOrders,
//     });
//   } catch (error: unknown) {
//     // eslint-disable-next-line no-console
//     console.error("Error fetching all orders:", error);
//     res.status(500).json({ message: "An internal server error occurred" });
//   }
// };
