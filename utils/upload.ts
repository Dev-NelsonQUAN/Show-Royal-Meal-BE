import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Bread",
    allowed_formats: ["jpg", "jpeg", "png"],
  } as {
    folder: string;
    allowed_formats: string[];
  },
});

const upload = multer({ storage });
export default upload;
