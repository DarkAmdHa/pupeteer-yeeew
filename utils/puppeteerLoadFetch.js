import pt from "puppeteer";
import scrapeImages from "./scrapeImages.js";
import saveImagesToS3 from "./saveImagesToS3.js";
import sanitizeHTML from "./sanitizeHTML.js";

const puppeteerLoadFetch = async (
  link,
  justText = false,
  scrapingImages = false,
  businessSlug,
  dynamic,
  platformName = ""
) => {
  const browser = await pt.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 500 });

  await page.goto(link);

  if (dynamic) {
    // Wait for 5 seconds before scraping:
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  let sanitizedData;
  let uploadedImageLocations = [];
  if (scrapingImages) {
    //Scrape images from browser:
    const images = await scrapeImages(page, platformName);
    if (images.length)
      uploadedImageLocations = await saveImagesToS3(images, businessSlug);
  }

  //Trying to get it from ChatGPT as well.
  // try {
  //   if (platformName === "booking") {
  //     //Scrape Room Types:
  //     await page.evaluate(() => {
  //       const rooms = [];
  //       if (document.querySelectorAll("#rooms_table [data-room-name]").length) {
  //         document
  //           .querySelectorAll("#rooms_table [data-room-name]")
  //           .forEach((room) => {
  //             const row = room.closest("tr");
  //             const facilities = [];
  //             row
  //               .querySelectorAll(".hprt-facilities-facility")
  //               .forEach((facility) => facilities.push(facility.innerText));
  //             const maxOccupancy = row.querySelector(
  //               ".hprt-table-cell-occupancy .bui-u-sr-only"
  //             )?.innerText;
  //             rooms.push({
  //               roomName: room.innerText,
  //               roomFacilities: facilities,
  //               maxOccupancy: maxOccupancy,
  //               priceWhenScraped: row.querySelector(".bui-price-display__value")
  //                 ?.innerText,
  //             });
  //           });
  //       }
  //     });
  //   }
  // } catch (error) {
  //   console.log("Ran into an error scrapping Booking room types".red);
  // }

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
