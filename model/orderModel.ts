import mongoose, { Document, Schema } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AutoIncrement = require("mongoose-sequence")(mongoose);

export interface IOrder extends Document {
  orderId: number;
  user: mongoose.Types.ObjectId | Record<string, unknown>;
  items: {
    productId: mongoose.Types.ObjectId | Record<string, unknown>;
    qty: number;
  }[];
  status: string;
  totalAmount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: Number,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Ready", "Confirmed", "Approved", "Declined"],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

orderSchema.plugin(AutoIncrement, {
  inc_field: "orderId",
  start_seq: 1000,
});

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
