import express from "express";
import dotenv from "dotenv";
import colors from "colors";

import { errorHandler } from "./middleware/errorMiddleware.js";
import puppeteerLoadFetch from "./utils/puppeteerLoadFetch.js";
import generateSEOContentWithGoogle from "./utils/generateSEOContentWithGoogle.js";
import twoWayComm from "./utils/twoWayComm.js";
import listingScrape from "./utils/listingScrape.js";
import generateSlug from "./utils/generateSlug.js";

dotenv.config();

const app = express();

app.use(express.json());

app.post("/api/data/getData", async (req, res) => {
  //   res.json({
  //     errors: [
  //       "The requested information about Maqai Beach Eco Surf Resort could not be found on the provided content.",
  //       "The information about Maqai Beach Eco Surf Resort could not be found in the provided content.",
  //     ],
  //     data: {
  //       contact_email: "info@maqai.com",
  //       phone_number: "+679 9907761",
  //       whatsapp_number: "",
  //       accomodation_type: ["Resort"],
  //       trip_type: ["Family Holiday", "Learn to Surf", "Luxury Holiday"],
  //       contact_name: "",
  //       location: "Qamea island just north of Taveuni, Fiji",
  //       summary:
  //         "- Maqai Eco Resort offers absolute beachfront bures amidst coconut palms with ocean views.\n" +
  //         "- Features include the Sand Bar cafe/restaurant, solar power, organic garden, yoga & pilates, board hire and surf lessons, snorkeling tours, island transfers, Fijian massage, and fishing trips.\n" +
  //         "- Catering to couples, families, and adventure seekers with glamping options.\n" +
  //         "- Testimonials highlight great waves, tropical paradise feel, and the freshness of organic food.\n" +
  //         "- Destination emphasised as a must-visit, off-the-beaten-track location in Northern Fiji.",
  //       name: "Maqai Beach Eco Surf Resort",
  //       platformSummaries: {
  //         booking: [Object],
  //         agoda: [Object],
  //         expedia: [Object],
  //         trip: [Object],
  //         atoll: [Object],
  //         surfline: [Object],
  //       },
  //       finalData:
  //         "Nestled amidst the swaying coconut palms on the pristine beachfront of Qamea Island, just north of Taveuni in the splendid archipelago of Fiji, Maqai Beach Eco Surf Resort emerges as an undiscovered gem for travelers in search of a blend of adventure and serenity. With its commitment to eco-friendly practices, the resort beckons families, couples, and solo adventurers alike to experience its unique offerings, from the exhilarating rush of riding uncrowded waves to the tranquil pleasure of a sunset viewed from a hammock.\n" +
  //         "\n" +
  //         "Maqai Beach Eco Surf Resort presents a collection of absolute beachfront bures, offering guests unobstructed views of the sparkling ocean waters, all constructed with an eye towards sustainability and comfort. These traditional Fijian bungalows are powered by solar energy and are a part of the resort’s broader initiative to maintain harmony with the surrounding environment. Distinguished by their private en suite bathrooms, spacious front patios, and deck chairs, the accommodations invite guests to relax in privacy while being only steps away from the soft sand and gentle waves.\n" +
  //         "\n" +
  //         "For the culinary-minded, the Sand Bar cafe/restaurant stands ready to delight with mouth-watering dishes, emphasizing the freshness of organic produce harvested from the resort's garden and the daily catch sourced from local fishermen. Beyond the palate, Maqai offers a symphony of activities: from surfing lessons with seasoned instructors to snorkeling tours revealing the vivid underwater world, and from the rejuvenating touch of a Fijian massage to the tranquility of yoga and pilates sessions held amidst the natural splendor.\n" +
  //         "\n" +
  //         "Surfers, from those taking their first tentative ride to seasoned veterans seeking the perfect barrel, will find Maqai Beach Eco Surf Resort an idyllic surf spot. The resort’s strategic location adjacent to the Maqai Right reef ensures consistent quality waves, suitable for various skill levels. This hidden surf paradise ensures an intimate surfing experience away from the crowded popular surf spots, capturing the essence of a true surfers’ haven.\n" +
  //         "\n" +
  //         "Venturers longing for more can embark on island transfers to explore the nearby attractions, including the ethereal Tavoro Creek and the majestic Bouma Falls Park, further enriching their Fijian adventure. It's this combination of seclusion, the communal vibe of the Sandbar Restaurant, and the varied on-site facilities, from badminton courts, and game rooms to water sports equipment rentals, that underscore the resort’s appeal.\n" +
  //         "\n" +
  //         "The ethos of Maqai Beach Eco Surf Resort – its fusion of luxury, adventure, and sustainability – creates a compelling narrative for travelers seeking an off-the-beaten-path destination. This eco-friendly haven champions not only the beauty of its surroundings but also the preservation of such beauty for generations to come. From the moment guests arrive, greeted by the warm Fijian hospitality and the hypnotic sound of the waves, to the moment they depart, Maqai promises a tropical paradise experience unlike any other, making it a must-visit on the Northern Fiji circuit.\n" +
  //         "\n" +
  //         "For adventurers keen to delve into the heart of Fiji's surf scene, discover unparalleled tranquility, or simply bask in the beauty of untouched nature, Maqai Beach Eco Surf Resort stands as a beckoning beacon, inviting one and all to its shores.",
  //     },
  //   });
  //   return;

  const prompts = req.body.prompts;
  const data = req.body.data;
  console.log(data);

  const businessName = data[0];
  const businessLink = data[1];

  const links = {
    bookingLink: data[2],
    agodaLink: data[3],
    expediaLink: data[4],
    tripAdvisorLink: data[5],
    tripLink: data[6],
    perfectWaveLink: data[7],
    luexLink: data[8],
    waterwaysSurfLink: data[9],
    worldSafarisLink: data[10],
    awaveLink: data[11],
    atollLink: data[12],
    surfHolidaysLink: data[13],
    surflineLink: data[14],
  };

  //Generating Data:
  let businessData = { errors: [], data: {} };
  try {
    businessData.data = await twoWayComm(businessLink, prompts);
  } catch (e) {
    businessData.errors.push("Main Site not working");
    console.log("Main Site not working");
  }
  businessData.data.platformSummaries = {};

  const linksArr = Object.keys(links);

  for (var i = 0; i < linksArr.length; i++) {
    const platformName = linksArr[i].split("Link")[0];
    const link = links[linksArr[i]];
    if (!!link) {
      //Scrape Data:
      const result = await puppeteerLoadFetch(
        link,
        true,
        false,
        generateSlug(businessName),
        true
      );
      try {
        const listingDataFromOpenAi = await listingScrape(
          platformName,
          businessName,
          result.sanitizedData,
          prompts
        );

        listingDataFromOpenAi.error &&
          businessData.errors.push(
            `Error while scraping ${platformName}: ${listingDataFromOpenAi.error}`
          );

        businessData.data.platformSummaries[platformName] = {
          summary: listingDataFromOpenAi.summary
            ? listingDataFromOpenAi.summary
            : "",
          highlights: listingDataFromOpenAi.highlights
            ? listingDataFromOpenAi.highlights
            : "",
        };
      } catch (e) {
        businessData.errors.push(
          `Something went wrong while scraping ${platformName}: ${
            e.message ?? e
          }`
        );
      }
    }
  }

  //Final summary using all the summaries:
  const content = await generateSEOContentWithGoogle(
    businessData.data,
    prompts.contentGenerationPrompt
  );

  businessData.data.finalData = content;

  console.log(businessData);
  res.json(businessData);
});

if (process.env.NODE_ENV === "development") {
  app.get("/", (req, res) => {
    res.json({
      message: "Success",
    });
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `App Running on Port ${PORT} in ${process.env.NODE_ENV} mode`.cyan.underline
  );
});
