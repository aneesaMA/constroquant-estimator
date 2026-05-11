import cors from "cors";
import express from "express";
import estimatorRouter from "./routes/estimator.routes";
import roadRouter from "./routes/road.routes";
import { SERVER_CONFIG } from "./config/constants";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "ConstroMat API is running.",
    hint: "Use /api endpoints",
    endpoints: {
      health: "GET /api/health",
      brickWallEstimate: "POST /api/brick-wall/estimate",
      roadEstimate: "POST /api/road/estimate",
    },
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api", estimatorRouter);
app.use("/api/road", roadRouter);

// ✅ IMPORTANT: Use dynamic port for Render
const PORT = process.env.PORT || SERVER_CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});