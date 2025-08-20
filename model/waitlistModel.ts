import { Schema, model, Document } from "mongoose";

export interface IWailistEntry extends Document {
  fullName: string;
  email: string;
  phoneNo: string;
  createdAt: string;
}

const waitListSchema = new Schema<IWailistEntry>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNo: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const WaitListEntry = model<IWailistEntry>("waitlistEntry", waitListSchema);

export default WaitListEntry;
