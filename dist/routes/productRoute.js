"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/upload"));
const product_1 = require("../controller/product");
const authMiddleware_1 = require("../middleware/authMiddleware");
const productRouter = express_1.default.Router();
productRouter.post("/create-product", upload_1.default.array("image", 5), authMiddleware_1.protect, authMiddleware_1.admin, product_1.createProduct);
productRouter.put("/update-product/:id", authMiddleware_1.protect, authMiddleware_1.admin, upload_1.default.array("image", 5), product_1.updateProduct);
productRouter.post("/delete-product", authMiddleware_1.protect, authMiddleware_1.admin, product_1.deleteMultipleProduct);
productRouter.get("/one-product/:id", product_1.getOneProduct);
productRouter.get("/all-product", product_1.getAllProduct);
exports.default = productRouter;
