"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneProduct = exports.getAllProduct = exports.deleteMultipleProduct = exports.updateProduct = exports.createProduct = void 0;
const productModel_1 = __importDefault(require("../model/productModel"));
const createProduct = async (req, res) => {
    try {
        const { productName, description, price, stock } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
            res
                .status(400)
                .json({ message: "At least one or more image is required" });
            return;
        }
        const imagePaths = files.map((file) => file.path);
        const product = await productModel_1.default.create({
            productName,
            description,
            price,
            stock,
            image: imagePaths,
        });
        res.status(201).json({ message: "Product created successfully", product });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { productName, description, price, stock } = req.body;
        const product = await productModel_1.default.findById(req.params.id);
        if (!product) {
            res.status(400).json({ message: "Product not found" });
            return;
        }
        product.productName = productName || product.productName;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const imagePaths = req.files.map((file) => file.path);
            product.image = imagePaths;
        }
        const updated = await product.save();
        res.status(200).json({ message: "Updated successfully", product: updated });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.updateProduct = updateProduct;
const deleteMultipleProduct = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: "No products IDs found for deletion" });
            return;
        }
        const deleteProduct = await productModel_1.default.deleteMany({ _id: { $in: ids } });
        if (deleteProduct.deletedCount === 0) {
            res
                .status(400)
                .json({ message: "No product found to delete with the provided IDs" });
            return;
        }
        res.status(200).json({
            message: `${deleteProduct.deletedCount} products deleted successfully`,
        });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.deleteMultipleProduct = deleteMultipleProduct;
const getAllProduct = async (req, res) => {
    try {
        const product = await productModel_1.default.find().lean();
        res.status(200).json({ message: "All products fetched", product });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.getAllProduct = getAllProduct;
const getOneProduct = async (req, res) => {
    try {
        const product = await productModel_1.default.findById(req.params.id).lean();
        if (!product) {
            res.status(400).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({ message: "Product gotten successful", product });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
exports.getOneProduct = getOneProduct;
