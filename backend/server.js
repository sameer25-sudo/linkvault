import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import "./cron/cleanup.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

/* Rate Limit */
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
});

app.use(limiter);

app.use(cors());
app.use(express.json());

/* MongoDB */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* Root */
app.get("/", (req, res) => {
  res.send("LinkVault API is running");
});

/* Routes */
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
