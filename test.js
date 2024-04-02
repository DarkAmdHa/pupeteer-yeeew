const pt = require("puppeteer");
const dotenv = require("dotenv");

dotenv.config();

const scrapeImages = require("./utils/scrapeImages");
const saveImagesToS3 = require("./utils/saveImagesToS3");

const puppeteerLoadFetch = async (
  link,
  justText,
  scrapingImages,
  businessSlug
) => {
  const browser = await pt.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 500 });

  await page.goto(link);

  let sanitizedData;
  let uploadedImageLocations = [];
  if (scrapingImages) {
    //Scrape images from browser:
    const images = await scrapeImages(page);
    if (images.length)
      uploadedImageLocations = await saveImagesToS3(images, businessSlug);
  }

  // if (justText) {
  //   await page.evaluate(() => {
  //     document.querySelectorAll("a").forEach((a) => {
  //       a.outerHTML = "Link: " + a.href + " " + a.innerText + " ";
  //     });
  //   });
  //   sanitizedData = await page.evaluate(() => {
  //     return document.querySelector("body").innerText;
  //   });
  // } else {
  //   const HTML = await page.content();
  //   sanitizedData = sanitizeHTML(HTML);
  // }

  await browser.close();
  debugger;
  return { uploadedImageLocations, sanitizedData };
};

puppeteerLoadFetch(
  "https://www.airbnb.com.au/rooms/47752583?_set_bev_on_new_domain=1688601339_ODI2ZDg2MTVjYmFi&source_impression_id=p3_1688601339_rjKlhA1lUBgdZtCA",
  false,
  true,
  "trying"
);
