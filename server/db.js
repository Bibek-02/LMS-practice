import mongoose from "mongoose";

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    // keep defaults simple for now
  });
  console.log("MongoDB connected:", mongoose.connection.name);

  // graceful shutdown
  const close = async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}
