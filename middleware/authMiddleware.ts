import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../model/userModel";
import { IUser } from "../model/userModel";
import { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header("Authorization");
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const user = await User.findById(decoded.id || decoded._id).select(
      "-password"
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    req.user = user as IUser;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
};

export const admin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "Admin") {
    res.status(401).json({ message: "Acess denied" });
    return;
  }
  next();
};
