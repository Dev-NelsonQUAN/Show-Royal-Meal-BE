import express from "express";
import { getAllUsers } from "../controller/admin";

const adminRouter = express.Router();

adminRouter.get("/get-all-users", getAllUsers);

export default adminRouter;
