import express from "express";
import {
  generateBusinessDataHandler,
  runDemoHandler,
  runRegionalHandler,
  scrapeBusinessSite,
  scrapePlatforms,
  scrapePlatforms2,
  buildBusinessSlug,
  generateFinalContent,
} from "../controllers/generateBusinessDataController.js";

const router = express.Router();

router.post("/", generateBusinessDataHandler);

router.post("/demo", runDemoHandler);
router.post("/regional", runRegionalHandler);
router.post("/scrape-site", scrapeBusinessSite);
router.post("/scrape-platforms", scrapePlatforms);
router.post("/scrape-platforms-2", scrapePlatforms2);
router.post("/slug-build", buildBusinessSlug);
router.post("/content-generation", generateFinalContent);

export default router;
