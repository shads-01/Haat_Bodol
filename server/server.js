import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

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

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running." });
});

app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
