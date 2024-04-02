import express from "express";
import { generateBusinessDataHandler } from "../controllers/generateBusinessDataController.js";

const router = express.Router();

router.post("/getData", generateBusinessDataHandler);

export default router;
