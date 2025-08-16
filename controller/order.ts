import { Request, Response } from "express";
import Product from "../model/productModel";
import Order from "../model/orderModel"; // 'IOrder' import removed
import User, { IUser } from "../model/userModel";
import { orderStatusMail, sendOrderMail } from "../utils/mailer";
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// createOrder function remains correct. No changes needed.
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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

    // Transform the data to match the frontend's desired structure
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        // --- FIX: Explicitly cast 'item' to include the '_id' property ---
        const leanItem = item as typeof item & { _id: mongoose.Types.ObjectId };
        return {
          product: leanItem.productId,
          qty: leanItem.qty,
          _id: leanItem._id,
        };
      }),
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
// import Order from "../model/orderModel";
// import User, { IUser } from "../model/userModel";
// import { orderStatusMail, sendOrderMail } from "../utils/mailer";

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace Express {
//     interface Request {
//       user?: IUser;
//     }
//   }
// }

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
//     // --- THIS IS THE FIX ---
//     // The complex 'ValidationError' check has been completely removed.
//     // Now, ANY error will be caught, logged, and a generic message will be sent.

//     // eslint-disable-next-line no-console
//     console.error("Error creating order:", error); // Log the full technical error for debugging
//     res
//       .status(500)
//       .json({ message: "An error occurred while creating the order." }); // Send a safe, generic message to the client
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

// export const getAllOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const orders = await Order.find()
//       .populate({
//         path: "user",
//         select: "fullName email phoneNumber",
//       })
//       .populate({
//         path: "items.productId", // The path to the field you want to populate
//         model: "Product", // The name of the model to use
//         select: "productName price", // Specify which fields to include
//       })
//       .sort({ createdAt: -1 });

//     // Remap the response to match the frontend type structure ('product' instead of 'productId')
//     const formattedOrders = orders.map((order) => {
//       const orderObject = order.toObject();
//       orderObject.items = orderObject.items.map((item: any) => ({
//         product: item.productId, // Rename populated field
//         qty: item.qty,
//         _id: item._id,
//       }));
//       return orderObject;
//     });

//     res
//       .status(200)
//       .json({ message: "All orders fetched successfully", data: orders });
//   } catch (error: unknown) {
//     // eslint-disable-next-line no-console
//     console.error("Error fetching all orders:", error);
//     res.status(500).json({ message: "An internal server error occurred" });
//   }
// };

// // import { Request, Response } from "express";
// // import Product from "../model/productModel";
// // import Order from "../model/orderModel";
// // import User, { IUser } from "../model/userModel";
// // import { orderStatusMail, sendOrderMail } from "../utils/mailer";

// // declare global {
// //   // eslint-disable-next-line @typescript-eslint/no-namespace
// //   namespace Express {
// //     interface Request {
// //       user?: IUser;
// //     }
// //   }
// // }

// // export const createOrder = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const { items, pickUpDate, notes, payment } = req.body;

// //     if (!items || items.length === 0) {
// //       res.status(400).json({ message: "No order items" });
// //       return;
// //     }
// //     if (!payment || !payment.method) {
// //       res
// //         .status(400)
// //         .json({ message: "Payment details (method) are required." });
// //       return;
// //     }

// //     let totalAmount = 0;
// //     for (const item of items) {
// //       const product = await Product.findById(item.productId);
// //       if (!product) {
// //         res
// //           .status(400)
// //           .json({ message: `Product not found: ${item.productId}` });
// //         return;
// //       }
// //       if (item.qty <= 0) {
// //         res.status(400).json({ message: "Quantity must be one or more" });
// //         return;
// //       }
// //       totalAmount += product.price * item.qty;
// //     }

// //     const order = new Order({
// //       user: req.user!._id,
// //       items,
// //       pickUpDate,
// //       totalAmount,
// //       notes,
// //       payment,
// //     });

// //     const createdOrder = await order.save();

// //     const user = await User.findById(req.user?._id);
// //     if (user) {
// //       const formattedId = `ORD-${createdOrder.orderId}`;
// //       await sendOrderMail(user.email, user.fullName, formattedId);
// //     }
// //     res
// //       .status(201)
// //       .json({ message: "Order placed successfully", newOrder: createdOrder });
// //   } catch (error: any) {
// //     if (error.name === "ValidationError") {
// //       const messages = Object.values(error.errors).map(
// //         (val: any) => val.message
// //       );
// //       res.status(400).json({ message: messages.join(". ") });
// //       return;
// //     }
// //     // eslint-disable-next-line no-console
// //     console.error("Error creating order:", error);
// //     res.status(500).json({ message: "An internal server error occurred" });
// //   }
// // };

// // export const updateOrderStatus = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const { status } = req.body;
// //     const order = await Order.findByIdAndUpdate(
// //       req.params.id,
// //       { status },
// //       { new: true }
// //     ).populate<{ user: IUser }>("user");
// //     if (!order) {
// //       res.status(404).json({ message: "Order not found" });
// //       return;
// //     }
// //     const user = order.user;

// //     await orderStatusMail(
// //       user.email,
// //       user.fullName,
// //       status as "shipped" | "delivered" | "cancelled",
// //       `ORD-${order.orderId}`
// //     );

// //     res.status(200).json({ message: "Status updated successfully", order });
// //   } catch (error: any) {
// //     // eslint-disable-next-line no-console
// //     console.error("Error updating order status:", error);
// //     res.status(500).json({ message: "An internal server error occurred" });
// //   }
// // };

// // export const getAllOrder = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const orders = await Order.find()
// //       .populate({
// //         path: "user",
// //         select: "fullName email phoneNumber",
// //       })
// //       .sort({ createdAt: -1 });

// //     res
// //       .status(200)
// //       .json({ message: "All orders fetched successfully", data: orders });
// //   } catch (error: any) {
// //     // eslint-disable-next-line no-console
// //     console.error("Error fetching all orders:", error);
// //     res.status(500).json({ message: "An internal server error occurred" });
// //   }
// // };

// // import { Request, Response } from "express";
// // import Product from "../model/productModel";
// // import Order from "../model/orderModel";
// // import User, { IUser } from "../model/userModel";
// // import { orderStatusMail, sendOrderMail } from "../utils/mailer";

// // declare global {
// //   // eslint-disable-next-line @typescript-eslint/no-namespace
// //   namespace Express {
// //     interface Request {
// //       user?: IUser;
// //     }
// //   }
// // }

// // export const createOrder = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     // 1. Destructure 'payment' from the request body
// //     const { items, pickUpDate, notes, payment } = req.body;

// //     if (!items || items.length === 0) {
// //       res.status(400).json({ message: "No order items" });
// //       return;
// //     }
// //     // 2. Add validation for the payment object itself
// //     if (!payment || !payment.method) {
// //       res
// //         .status(400)
// //         .json({ message: "Payment details (method) are required." });
// //       return;
// //     }

// //     let totalAmount = 0;
// //     for (const item of items) {
// //       const product = await Product.findById(item.productId);
// //       if (!product) {
// //         res
// //           .status(400)
// //           .json({ message: `Product not found: ${item.productId}` });
// //         return;
// //       }
// //       if (item.qty <= 0) {
// //         res.status(400).json({ message: "Quantity must be one or more" });
// //         return;
// //       }
// //       totalAmount += product.price * item.qty;
// //       // You might want to handle stock updates here in a real transaction
// //     }

// //     // 3. Create the new Order instance with the payment object
// //     const order = new Order({
// //       user: req.user!._id,
// //       items,
// //       pickUpDate,
// //       totalAmount,
// //       notes,
// //       payment, // Pass the payment object here
// //     });

// //     const createdOrder = await order.save(); // Mongoose will validate the payment object based on the schema rules

// //     const user = await User.findById(req.user?._id);
// //     if (user) {
// //       const formattedId = `ORD-${createdOrder.orderId}`;
// //       await sendOrderMail(user.email, user.fullName, formattedId);
// //     }
// //     res
// //       .status(201) // Use 201 Created for successful resource creation
// //       .json({ message: "Order placed successfully", newOrder: createdOrder });
// //   } catch (error: any) {
// //     // 4. Improved error handling to catch Mongoose validation errors
// //     if (error.name === "ValidationError") {
// //       // Create a clean, user-friendly error message from the validation failures
// //       const messages = Object.values(error.errors).map(
// //         (val: any) => val.message
// //       );
// //       res.status(400).json({ message: messages.join(". ") });
// //       return;
// //     }
// //     console.error("Error creating order:", error); // Log the full error for debugging
// //     res.status(500).json({ message: "An internal server error occurred" });
// //   }
// // };

// // export const updateOrderStatus = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const { status } = req.body;
// //     const order = await Order.findByIdAndUpdate(
// //       req.params.id,
// //       { status },
// //       { new: true }
// //     ).populate<{ user: IUser }>("user");
// //     if (!order) {
// //       res.status(404).json({ message: "Order not found" }); // Use 404 for not found
// //       return;
// //     }
// //     const user = order.user;

// //     await orderStatusMail(
// //       user.email,
// //       user.fullName,
// //       status as "shipped" | "delivered" | "cancelled",
// //       `ORD-${order.orderId}`
// //     );

// //     res.status(200).json({ message: "Status updated successfully", order });
// //   } catch (error: any) {
// //     console.error("Error updating order status:", error);
// //     res.status(500).json({ message: "An internal server error occurred" });
// //   }
// // };

// // export const getAllOrder = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const orders = await Order.find()
// //       .populate({
// //         path: "user",
// //         select: "fullName email phoneNumber",
// //       })
// //       .sort({ createdAt: -1 }); // Sort by newest first

// //     res
// //       .status(200)
// //       .json({ message: "All orders fetched successfully", data: orders });
// //   } catch (error: any) {
// //     console.error("Error fetching all orders:", error);
// //     res.status(500).json({ message: "An internal server error occurred" });
// //   }
// // };

// // import { Request, Response } from "express";
// // import Product from "../model/productModel";
// // import Order from "../model/orderModel";
// // import User, { IUser } from "../model/userModel";
// // import { orderStatusMail, sendOrderMail } from "../utils/mailer";

// // declare global {
// //   // eslint-disable-next-line @typescript-eslint/no-namespace
// //   namespace Express {
// //     interface Request {
// //       user?: IUser; // or use specific fields like `_id: string`
// //     }
// //   }
// // }

// // export const createOrder = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const { items, pickUpDate, notes } = req.body;
// //     if (!items || items.length === 0) {
// //       res.status(400).json({ message: "No order items" });
// //       return;
// //     }
// //     let totalAmount = 0;
// //     for (const item of items) {
// //       const product = await Product.findById(item.productId);
// //       if (!product) {
// //         res
// //           .status(400)
// //           .json({ message: `Product not found : ${item.productId}` });
// //         return;
// //       }
// //       if (item.qty <= 0) {
// //         res.status(400).json({ message: "Quantity must be one or more" });
// //         return;
// //       }

// //       totalAmount += product.price * item.qty;
// //       // product.stock -= item.qty;
// //       await product.save();
// //       // if (product.stock < item.qty) {
// //       //   res.status(400).json({
// //       //     message: `Insufficient stock for : ${product.productName || item.productId}`,
// //       //   });
// //       // } else {
// //       //   totalAmount += product.price * item.qty;
// //       //   // product.stock -= item.qty;
// //       //   await product.save();
// //       // }
// //     }
// //     const order = new Order({
// //       user: req.user!._id,
// //       items,
// //       pickUpDate,
// //       totalAmount,
// //       notes,
// //     });
// //     const createOrder = await order.save();
// //     const user = await User.findById(req.user?._id);
// //     if (user) {
// //       const formattedId = `ORD-${createOrder.orderId}`;
// //       await sendOrderMail(user.email, user.fullName, formattedId);
// //     }
// //     res
// //       .status(200)
// //       .json({ message: "Order placed successfully", newOrder: createOrder });
// //   } catch (error) {
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };

// // export const updateOrderStatus = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const { status } = req.body;
// //     const order = await Order.findByIdAndUpdate(
// //       req.params.id,
// //       { status },
// //       { new: true }
// //     ).populate<{ user: IUser }>("user");
// //     if (!order) {
// //       res.status(400).json({ message: "Order not found" });
// //       return;
// //     }
// //     const user = order.user;

// //     // --- THIS IS THE FIX ---
// //     // The orderStatusMail function now takes separate arguments for clarity and reusability.
// //     await orderStatusMail(
// //       user.email,
// //       user.fullName,
// //       status as "shipped" | "delivered" | "cancelled", // Cast the status to match the type in the mailer function
// //       `ORD-${order.orderId}`
// //     );

// //     res.status(200).json({ message: "Status updated" });
// //   } catch (error) {
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };

// // export const getAllOrder = async (
// //   req: Request,
// //   res: Response
// // ): Promise<void> => {
// //   try {
// //     const order = await Order.find().populate({
// //       path: "user",
// //       select: "fullName email phoneNumber",
// //     });
// //     if (!order) {
// //       res.status(400).json({ message: "Unable to get all order" });
// //       return;
// //     }
// //     res.status(200).json({ message: "All orders", data: order });
// //   } catch (error) {
// //     res.status(500).json({ message: "An error occurred", error });
// //   }
// // };

// // // import { Request, Response } from "express";
// // // import Product from "../model/productModel";
// // // import Order from "../model/orderModel";
// // // import User, { IUser } from "../model/userModel";
// // // import { orderStatusMail, sendOrderMail } from "../utils/mailer";

// // // declare global {
// // //   // eslint-disable-next-line @typescript-eslint/no-namespace
// // //   namespace Express {
// // //     interface Request {
// // //       user?: IUser; // or use specific fields like `_id: string`
// // //     }
// // //   }
// // // }

// // // export const createOrder = async (
// // //   req: Request,
// // //   res: Response
// // // ): Promise<void> => {
// // //   try {
// // //     const { items } = req.body;
// // //     if (!items || items.length === 0) {
// // //       res.status(400).json({ message: "No order items" });
// // //       return;
// // //     }
// // //     let totalAmount = 0;
// // //     for (const item of items) {
// // //       const product = await Product.findById(item.productId);
// // //       if (!product) {
// // //         res
// // //           .status(400)
// // //           .json({ message: `Product not found : ${item.productId}` });
// // //         return;
// // //       }
// // //       if (item.qty <= 0) {
// // //         res.status(400).json({ message: "Quantity must be one or more" });
// // //         return;
// // //       }
// // //       if (product.stock < item.qty) {
// // //         res.status(400).json({
// // //           message: `Insufficient stock for : ${product.productName || item.productId}`,
// // //         });
// // //       } else {
// // //         totalAmount += product.price * item.qty;
// // //         product.stock -= item.qty;
// // //         await product.save();
// // //       }
// // //     }
// // //     const order = new Order({
// // //       user: req.user!._id,
// // //       items,
// // //       totalAmount,
// // //     });
// // //     const createOrder = await order.save();
// // //     const user = await User.findById(req.user?._id);
// // //     if (user) {
// // //       const formattedId = `ORD-${createOrder.orderId}`;
// // //       await sendOrderMail(user.email, user.fullName, formattedId);
// // //     }
// // //     res
// // //       .status(200)
// // //       .json({ message: "Order placed successfully", newOrder: createOrder });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "An error occurred", error });
// // //   }
// // // };

// // // export const updateOrderStatus = async (
// // //   req: Request,
// // //   res: Response
// // // ): Promise<void> => {
// // //   try {
// // //     const { status } = req.body;
// // //     const order = await Order.findByIdAndUpdate(
// // //       req.params.id,
// // //       { status },
// // //       { new: true }
// // //     ).populate<{ user: IUser }>("user");
// // //     if (!order) {
// // //       res.status(400).json({ message: "Order not found" });
// // //       return;
// // //     }
// // //     const user = order.user;
// // //     await orderStatusMail({
// // //       to: user.email,
// // //       subject: `Order ORD-${order.orderId} Status Updated`,
// // //       html: `
// // //         <p>Dear ${user.fullName || "Customer"},</p>
// // //         <p>Your order status has been updated to: <strong>${status}</strong>.</p>
// // //         <p>Thank you for shopping with us.</p>
// // //       `,
// // //     });
// // //     res.status(200).json({ message: "Status updated" });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "An error occurred", error });
// // //   }
// // // };

// // // export const getAllOrder = async (
// // //   req: Request,
// // //   res: Response
// // // ): Promise<void> => {
// // //   try {
// // //     const order = await Order.find().populate({
// // //       path: "user",
// // //       select: "fullName email phoneNumber",
// // //     });
// // //     if (!order) {
// // //       res.status(400).json({ message: "Unable to get all order" });
// // //       return;
// // //     }
// // //     res.status(200).json({ message: "All orders", data: order });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "An error occurred", error });
// // //   }
// // // };
