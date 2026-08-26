import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
  }

  mongoose.connection.on("connected", () => {
    console.log(`MongoDB connected -> ${mongoose.connection.name}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  await mongoose.connect(uri);
}
