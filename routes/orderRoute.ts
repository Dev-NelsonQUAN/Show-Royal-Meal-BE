import express from "express";
import { admin, protect } from "../middleware/authMiddleware";
import {
  createOrder,
  getAllOrder,
  updateOrderStatus,
} from "../controller/order";

const orderRouter = express.Router();

orderRouter.post("/create-order", protect, createOrder);
orderRouter.put("/status/:id", protect, updateOrderStatus);
orderRouter.get("/all-order", protect, admin, getAllOrder);

export default orderRouter;
