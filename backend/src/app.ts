import cors from "cors";
import express from "express";
import estimatorRouter from "./routes/estimator.routes";
import { SERVER_CONFIG } from "./config/constants";

const app = express();

app.use(cors());
app.use(express.json());

// Root route — friendly message when visiting the backend URL in a browser
app.get("/", (_req, res) => {
  res.json({
    message: "ConstroMat API is running.",
    hint: "Open http://localhost:5173 in your browser for the UI.",
    endpoints: {
      health: "GET /api/health",
      brickWallEstimate: "POST /api/brick-wall/estimate",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", estimatorRouter);

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Backend running on http://localhost:${SERVER_CONFIG.PORT}`);
});
