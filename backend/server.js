import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import "./cron/cleanup.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // 60 requests per minute
});

app.use(limiter);

app.use(cors());
app.use(express.json());
// app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("LinkVault API is running");
});

app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
