import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js"
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const {MONGODB_URI} = process.env;

app.get("/health",(req, res) =>{
    res.status(200).json({status: "ok"});
});

// simple DB status endpoint
app.get("/health/db", (req, res) => {
  const state = ["disconnected","connected","connecting","disconnecting"][/* readyState */  mongoose.connection.readyState] ?? "unknown";
  res.json({ db: state });
});

import mongoose from "mongoose";

connectDB(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
});


app.listen(PORT, () =>{
    console.log(`API running on http://localhost:${PORT}`);

})