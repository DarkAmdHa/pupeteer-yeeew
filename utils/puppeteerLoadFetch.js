import pt from "puppeteer";
import scrapeImages from "./scrapeImages.js";
import saveImagesToS3 from "./saveImagesToS3.js";
import sanitizeHTML from "./sanitizeHTML.js";

const puppeteerLoadFetch = async (
  link,
  justText = false,
  scrapingImages = false,
  businessSlug,
  dynamic
) => {
  const browser = await pt.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 500 });

  await page.goto(link);

  if (dynamic) {
    // Wait for 5 seconds before scraping:
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  let sanitizedData;
  let uploadedImageLocations = [];
  if (scrapingImages) {
    //Scrape images from browser:
    const images = await scrapeImages(page);
    if (images.length)
      uploadedImageLocations = await saveImagesToS3(images, businessSlug);
  }

  if (justText) {
    await page.evaluate(() => {
      document.querySelectorAll("a").forEach((a) => {
        a.outerHTML = "Link: " + a.href + " " + a.innerText + " ";
      });
    });
    sanitizedData = await page.evaluate(() => {
      return document.querySelector("body").innerText;
    });
  } else {
    const HTML = await page.content();
    sanitizedData = sanitizeHTML(HTML);
  }

  await browser.close();
  return { uploadedImageLocations, sanitizedData };
};

export default puppeteerLoadFetch;
