import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  description: string;
  // stock: number;
  price: number;
  image: string[];
}

const productSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // stock: {
    //   type: Number,
    //   required: true,
    // },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
