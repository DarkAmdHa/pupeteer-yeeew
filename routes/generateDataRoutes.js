import express from "express";
import {
  generateBusinessDataHandler,
  runDemoHandler,
  runRegionalHandler,
} from "../controllers/generateBusinessDataController.js";

const router = express.Router();

router.post("/", generateBusinessDataHandler);

router.post("/demo", runDemoHandler);
router.post("/regional", runRegionalHandler);

export default router;
