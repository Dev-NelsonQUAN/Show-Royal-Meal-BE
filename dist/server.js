"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const configDb_1 = __importDefault(require("./config/configDb"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4056;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/api/user", userRoute_1.default);
app.use("/api/admin", adminRoute_1.default);
app.use("/api/product", productRoute_1.default);
app.use("/api/order", orderRoute_1.default);
(0, configDb_1.default)();
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to our server" });
});
app.listen(port, () => {
    console.log(`Server is listening to http://localhost:${port}`);
});
