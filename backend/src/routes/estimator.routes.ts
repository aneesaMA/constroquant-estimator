import { Router } from "express";
import { estimateBrickWall, estimateMaterials } from "../controllers/estimator.controller";

const estimatorRouter = Router();

// Legacy generic estimator endpoint
estimatorRouter.post("/estimate", estimateMaterials);

// Brick Wall Estimator endpoint
estimatorRouter.post("/brick-wall/estimate", estimateBrickWall);

export default estimatorRouter;
