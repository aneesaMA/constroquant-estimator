import { Router } from "express";
import { estimateRoad } from "../controllers/road.controller";
import { getRoadThickness } from "../controllers/roadEstimator.controller";

const roadRouter = Router();

roadRouter.post("/estimate", estimateRoad);
roadRouter.get("/thickness", getRoadThickness);

export default roadRouter;
