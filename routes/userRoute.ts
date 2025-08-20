import express from "express";
import { login, signUp, signUpWaitlist } from "../controller/user";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.post("/waitlist", signUpWaitlist);

export default userRouter;
