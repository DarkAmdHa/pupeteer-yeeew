import express from "express";
import {
  generateBusinessDataHandler,
  runDemoHandler,
} from "../controllers/generateBusinessDataController.js";

const router = express.Router();

router.post("/", generateBusinessDataHandler);

router.post("/demo", runDemoHandler);

export default router;
