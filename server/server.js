import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/auth.js"
import reviewsRoutes from "./routes/reviews.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//app.use --> middleware
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.json({
    message: "Haat_Bodol API Server",
    endpoints: {
      health: "/api/health",
      donations: "/api/items",
      auth: "/api/auth",
      reviews: "/api/reviews"
    },
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running." });
});

app.use("/api/items", itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);
