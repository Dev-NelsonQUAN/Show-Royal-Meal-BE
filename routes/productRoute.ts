import express from "express";
import upload from "../utils/upload";
import {
  createProduct,
  deleteMultipleProduct,
  getAllProduct,
  getOneProduct,
  updateProduct,
} from "../controller/product";
import { admin, protect } from "../middleware/authMiddleware";

const productRouter = express.Router();

productRouter.post(
  "/create-product",
  upload.array("image", 5),
  protect,
  admin,
  createProduct
);
productRouter.put(
  "/update-product/:id",
  protect,
  admin,
  upload.array("image", 5),
  updateProduct
);
productRouter.post("/delete-product", protect, admin, deleteMultipleProduct);
productRouter.get("/one-product/:id", getOneProduct);
productRouter.get("/all-product", getAllProduct);

export default productRouter;
