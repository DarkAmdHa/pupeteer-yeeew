import twoWayComm from "../utils/twoWayComm.js";
import puppeteerLoadFetch from "../utils/puppeteerLoadFetch.js";
import findListingOnGoogle from "../utils/findListingOnGoogle.js";
import slugBuilder from "../utils/slugBuilder.js";
import generateSEOContentWithGoogle from "../utils/generateSEOContentWithGoogle.js";
import generateSlug from "../utils/generateSlug.js";
import listingScrape from "../utils/listingScrape.js";

import asyncHandler from "express-async-handler";

import express from "express";
import dotenv from "dotenv";
import colors from "colors";

dotenv.config();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.get("/", (req, res) => {
    res.json({
      message: "Success",
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `App Running on Port ${PORT} in ${process.env.NODE_ENV} mode`.cyan.underline
  );
});

const test = asyncHandler(async () => {
  // const businessData2 = sampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompt = `Use the following content of a {{ platformName }} listing, to get all information and make a summary about the business {{ businessName }}. This should also include any contact information about the business like contact emails, phone numbers, whatsapp numbers, contact names, addresses as well as anything about the business you can find. Make sure that these contact details are picked after making sure they have been posted in the context of contacting them with them. If possible, return the address of the business in the summary, as well as all the contact details mentioned above, else if not found, don't . Make sure to also return the Highlights/Top Amenities of this business. This could be specifically listed on the page. If so, return that as well. The final response should be a JSON, looking like: { highlights: "", summary: ""}. If highlights are not found, return an empty string.  Here is the content of the listing: {{ businessData }}`;

  const businessName = "Maqai Beach Eco Surf Resort";
  const businessLink = "https://maqai.com/";

  //Generating Data:
  let businessData = {};

  // 1. Scrape Business Data using Two Way communication:
  // businessData = await twoWayComm(businessLink, prompts);
  //2. Scrape listings on booking,trip,trivago about business:
  const bookingPage = await findListingOnGoogle(businessName, "Booking.com");

  //Scrape Pages from platforms
  if (bookingPage.data) {
    const result = await puppeteerLoadFetch(
      bookingPage.data,
      true,
      true,
      generateSlug(businessName),
      true,
      "booking"
    );

    const listingDataFromOpenAi = await listingScrape(
      "Booking.com",
      businessName,
      result.sanitizedData,
      [],
      prompt
    );

    businessData.bookingData = {
      link: bookingPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
      rooms: listingDataFromOpenAi.rooms ? listingDataFromOpenAi.rooms : [],
      surroundings: listingDataFromOpenAi.surroundings
        ? listingDataFromOpenAi.surroundings
        : [],
      amenities: listingDataFromOpenAi.amenities
        ? listingDataFromOpenAi.amenities
        : [],
    };
  }
  debugger;

  // 3. Build Business Slug for yeeew:
  const slug = await slugBuilder(
    businessData.name,
    businessData.location,
    prompts.slugBuilderPrompt
  );
  businessData.slug = slug;

  // 4. Generate content
  const content = await generateSEOContentWithGoogle(
    businessData,
    prompts.contentGenerationPrompt
  );
  businessData.content = content;

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});

test();
