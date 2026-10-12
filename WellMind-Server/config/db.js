import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI ?? "";

  if (!uri.trim()) {
    console.error(
      "MongoDB Connection Failed: MONGO_URI is not configured. " +
        "Set MONGO_URI in server/.env (get a fresh connection string from " +
        "MongoDB Atlas -> Connect -> Drivers)."
    );
    process.exit(1);
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri.trim())) {
    console.error(
      "MongoDB Connection Failed: MONGO_URI has an invalid scheme. " +
        "It must start with mongodb:// or mongodb+srv://."
    );
    process.exit(1);
  }

  try {
    // Mongoose 8.x: useNewUrlParser/useUnifiedTopology are deprecated and removed.
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (error) {
    // Print only the error name/message; never print the URI or credentials.
    console.error("MongoDB Connection Failed:", error?.name ?? "UnknownError", "-", error?.message ?? "");
    process.exit(1);
  }
};

export default connectDB;
