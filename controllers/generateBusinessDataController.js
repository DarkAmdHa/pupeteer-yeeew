import twoWayComm from "../utils/twoWayComm.js";
import puppeteerLoadFetch from "../utils/puppeteerLoadFetch.js";
import findListingOnGoogle from "../utils/findListingOnGoogle.js";
import slugBuilder from "../utils/slugBuilder.js";
import generateSEOContentWithGoogle from "../utils/generateSEOContentWithGoogle.js";
import generateSlug from "../utils/generateSlug.js";
import listingScrape from "../utils/listingScrape.js";

import asyncHandler from "express-async-handler";

import { sampleData } from "../constants.js";

// @desc    Generate Business Data
// @route   POST /api/getData
// @access  Public
export const generateBusinessDataHandler = asyncHandler(async (req, res) => {
  // const businessData2 = sampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;

  const businessName = data[0];
  const businessLink = data[1];

  //Generating Data:
  let businessData = {};

  // 1. Scrape Business Data using Two Way communication:
  businessData = await twoWayComm(businessLink, prompts);
  //2. Scrape listings on booking,trip,trivago about business:
  const bookingPage = await findListingOnGoogle(businessName, "Booking.com");
  const tripPage = await findListingOnGoogle(businessName, "Trip.com");
  const trivagoPage = await findListingOnGoogle(businessName, "Trivago.com");

  //Scrape Pages from platforms
  if (bookingPage.data) {
    const result = await puppeteerLoadFetch(
      bookingPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "Booking.com",
      businessName,
      result.sanitizedData,
      prompts
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
    };
  }
  if (tripPage.data) {
    const result = await puppeteerLoadFetch(
      tripPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "Trip.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.tripData = {
      link: tripPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }
  if (trivagoPage.data) {
    const result = await puppeteerLoadFetch(
      trivagoPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "Trivago.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.trivagoData = {
      link: trivagoPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // 3. Build Business Slug for yeeew:
  const slug = await slugBuilder(
    businessData.name,
    businessData.location,
    prompts.slugBuilderPrompt[0]
  );
  businessData.slug = slug;

  // 4. Generate content
  const content = await generateSEOContentWithGoogle(
    businessData,
    prompts.contentGenerationPrompt[0]
  );
  businessData.content = content;

  console.log(businessData);
  res.json({ businessData });
});
