import { Request, Response } from "express";
import { Express } from "express";
import Product from "../model/productModel";

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productName, description, price, stock } = req.body;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res
        .status(400)
        .json({ message: "At least one or more image is required" });
      return;
    }
    const imagePaths = files.map((file) => file.path);

    const product = await Product.create({
      productName,
      description,
      price,
      stock,
      image: imagePaths,
    });
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productName, description, price, stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      return;
    }
    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imagePaths = req.files.map(
        (file: Express.Multer.File) => file.path
      );
      product.image = imagePaths;
    }
    const updated = await product.save();
    res.status(200).json({ message: "Updated successfully", product: updated });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const deleteMultipleProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "No products IDs found for deletion" });
      return;
    }
    const deleteProduct = await Product.deleteMany({ _id: { $in: ids } });
    if (deleteProduct.deletedCount === 0) {
      res
        .status(400)
        .json({ message: "No product found to delete with the provided IDs" });
      return;
    }
    res.status(200).json({
      message: `${deleteProduct.deletedCount} products deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const getAllProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.find().lean();
    res.status(200).json({ message: "All products fetched", product });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const getOneProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product gotten successful", product });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};
