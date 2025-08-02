import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    const mongoDb: string | undefined = process.env.MONGODB_URL;

    if (!mongoDb) {
      console.error(
        "Error: MONGO_URI is not defined in environment variables. Please set it in your .env file."
      );
      process.exit(1);
    }

    await mongoose.connect(mongoDb);
    console.log("MongoDB connected successfully");
  } catch (err: unknown) {
    console.log("Error connecting to Db", err);
  }
};

export default connectDb;
