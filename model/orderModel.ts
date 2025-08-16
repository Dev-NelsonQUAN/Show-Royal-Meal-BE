import mongoose, { Document, Schema } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AutoIncrement = require("mongoose-sequence")(mongoose);

// --- NEW: Interface for the nested payment object ---
interface IPayment {
  method: "Payment" | "Credit";
  detail?: "Cash" | "Card" | "Bank Transfer"; // Optional because it's not needed for 'Credit'
  status: "Paid" | "Unpaid";
}

export interface IOrder extends Document {
  orderId: number;
  user: mongoose.Types.ObjectId | Record<string, unknown>;
  items: {
    productId: mongoose.Types.ObjectId | Record<string, unknown>;
    qty: number;
  }[];
  status: string;
  totalAmount: number;
  pickUpDate: string;
  date: Date;
  notes?: string;
  payment: IPayment;
  createdAt: Date;
  updatedAt: Date;
}

// --- NEW: Schema for the nested payment object ---
const paymentSchema = new Schema<IPayment>(
  {
    method: {
      type: String,
      enum: ["Payment", "Credit"],
      required: [true, "Payment method (Payment or Credit) is required."],
    },
    detail: {
      type: String,
      enum: ["Cash", "Card", "Bank Transfer"],
      // Conditionally required: 'detail' is mandatory ONLY if 'method' is 'Payment'
      required: function (this: IPayment) {
        return this.method === "Payment";
      },
      message:
        "Payment detail (e.g., Cash, Card) is required when method is Payment.",
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
  },
  { _id: false }
); // Use _id: false as it's a subdocument

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
    // --- ADD THE PAYMENT FIELD TO THE MAIN SCHEMA ---
    payment: {
      type: paymentSchema,
      required: [true, "Payment information is missing."],
    },
    status: {
      type: String,
      enum: ["Pending", "Ready", "Confirmed", "Approved", "Declined"],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pickUpDate: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon"],
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

// import mongoose, { Document, Schema } from "mongoose";

// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const AutoIncrement = require("mongoose-sequence")(mongoose);

// export interface IOrder extends Document {
//   orderId: number;
//   user: mongoose.Types.ObjectId | Record<string, unknown>;
//   items: {
//     productId: mongoose.Types.ObjectId | Record<string, unknown>;
//     qty: number;
//   }[];
//   status: string;
//   totalAmount: number;
//   pickUpDate: string;
//   date: Date;
//   notes?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const orderSchema = new Schema<IOrder>(
//   {
//     orderId: {
//       type: Number,
//       unique: true,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         qty: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     status: {
//       type: String,
//       enum: ["Pending", "Ready", "Confirmed", "Approved", "Declined"],
//       default: "Pending",
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     pickUpDate: {
//       type: String,
//       required: true,
//       enum: ["Morning", "Afternoon"],
//     },
//     date: { type: Date, default: Date.now },
//     notes: { type: String },
//   },
//   {
//     timestamps: true,
//   }
// );

// orderSchema.plugin(AutoIncrement, {
//   inc_field: "orderId",
//   start_seq: 1000,
// });

// const Order = mongoose.model<IOrder>("Order", orderSchema);
// export default Order;
