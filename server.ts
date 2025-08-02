import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDb from "./config/configDb";
import userRouter from "./routes/userRoute";
import productRouter from "./routes/productRoute";
import orderRouter from "./routes/orderRoute";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 4056;

app.use(express.json());
app.use(cors());
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use(morgan("dev"));

connectDb();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to our server" });
});

app.listen(port, () => {
  console.log(`Server is listening to http://localhost:${port}`);
});
