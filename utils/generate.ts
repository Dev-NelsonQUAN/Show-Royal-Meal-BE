import jwt from "jsonwebtoken";

interface Payload {
  id: string;
  role: string;
}

const generateToken = (id: string, role: string): string => {
  const payload: Payload = { id, role };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export default generateToken;
