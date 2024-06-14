import twoWayComm from "../utils/twoWayComm.js";
import puppeteerLoadFetch from "../utils/puppeteerLoadFetch.js";
import findListingOnGoogle from "../utils/findListingOnGoogle.js";
import slugBuilder from "../utils/slugBuilder.js";
import generateSEOContentWithGoogle from "../utils/generateSEOContentWithGoogle.js";
import generateSlug from "../utils/generateSlug.js";
import listingScrape from "../utils/listingScrape.js";

import asyncHandler from "express-async-handler";

import { sampleData, regionalOverviewSampleData } from "../constants.js";
import fetchGeocodeData from "../utils/geoLocate.js";

// @desc    Generate Business Data
// @route   POST /api/data
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
  const agodaPage = await findListingOnGoogle(businessName, "agoda.com");
  const tripPage = await findListingOnGoogle(businessName, "Trip.com");
  const trivagoPage = await findListingOnGoogle(businessName, "Trivago.com");
  const perfectWavePage = await findListingOnGoogle(
    businessName,
    "perfectwavetravel.com"
  );
  const luexPage = await findListingOnGoogle(businessName, "luex.com");
  const waterWaysTravelPage = await findListingOnGoogle(
    businessName,
    "waterwaystravel.com"
  );
  const worldSurfarisPage = await findListingOnGoogle(
    businessName,
    "worldsurfaris.com"
  );
  const awavePage = await findListingOnGoogle(businessName, "awave.com.au");
  const atollTravelpage = await findListingOnGoogle(
    businessName,
    "atolltravel.com"
  );
  const surfHolidaysPage = await findListingOnGoogle(
    businessName,
    "surfholidays.com"
  );
  const surflinePage = await findListingOnGoogle(businessName, "surfline.com");
  const lushPalmPage = await findListingOnGoogle(businessName, "lushpalm.com");
  const thermalTravelPage = await findListingOnGoogle(
    businessName,
    "thermal.travel"
  );
  const bookSurfCampsPage = await findListingOnGoogle(
    businessName,
    "booksurfcamps.com"
  );
  const nomadSurfersPage = await findListingOnGoogle(
    businessName,
    "nomadsurfers.com"
  );
  const stokedSurfAdventruesPage = await findListingOnGoogle(
    businessName,
    "stokedsurfadventures.com"
  );
  const soulSurfTravelPage = await findListingOnGoogle(
    businessName,
    "soulsurftravel.com.au"
  );
  const surfersHypePage = await findListingOnGoogle(
    businessName,
    "surfershype.com"
  );

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
  if (agodaPage.data) {
    const result = await puppeteerLoadFetch(
      agodaPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "Agoda.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.agodaData = {
      link: agodaPage.data,
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

  // perfectwavetravel.com
  if (perfectWavePage.data) {
    const result = await puppeteerLoadFetch(
      perfectWavePage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "perfectwavetravel.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.perfectWaveData = {
      link: perfectWavePage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // luex.com
  if (luexPage.data) {
    const result = await puppeteerLoadFetch(
      luexPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "luex.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.luexData = {
      link: luexPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // waterwaystravel.com
  if (waterWaysTravelPage.data) {
    const result = await puppeteerLoadFetch(
      waterWaysTravelPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "waterwaystravel.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.waterWaysTravelData = {
      link: waterWaysTravelPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // worldsurfaris.com
  if (worldSurfarisPage.data) {
    const result = await puppeteerLoadFetch(
      worldSurfarisPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "worldsurfaris.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.worldSurfarisData = {
      link: worldSurfarisPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // awave.com.au
  if (awavePage.data) {
    const result = await puppeteerLoadFetch(
      awavePage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "awave.com.au",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.awaveData = {
      link: awavePage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // atolltravel.com
  if (atollTravelpage.data) {
    const result = await puppeteerLoadFetch(
      atollTravelpage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "atolltravel.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.atollTravelData = {
      link: atollTravelpage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  if (surfHolidaysPage.data) {
    const result = await puppeteerLoadFetch(
      surfHolidaysPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "surfholidays.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.surfHolidaysData = {
      link: surfHolidaysPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // surfline.com
  if (surflinePage.data) {
    const result = await puppeteerLoadFetch(
      surflinePage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "surfline.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.surflineData = {
      link: surflinePage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // lushpalm.com
  if (lushPalmPage.data) {
    const result = await puppeteerLoadFetch(
      lushPalmPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "lushpalm.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.lushPalmData = {
      link: lushPalmPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // thermal.travel
  if (thermalTravelPage.data) {
    const result = await puppeteerLoadFetch(
      thermalTravelPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "thermal.travel",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.thermalTravelData = {
      link: thermalTravelPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // booksurfcamps.com
  if (bookSurfCampsPage.data) {
    const result = await puppeteerLoadFetch(
      bookSurfCampsPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "booksurfcamps.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.bookSurfCampsData = {
      link: bookSurfCampsPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // nomadsurfers.com
  if (nomadSurfersPage.data) {
    const result = await puppeteerLoadFetch(
      nomadSurfersPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "nomadsurfers.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.nomadSurfersData = {
      link: nomadSurfersPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // stokedsurfadventures.com
  if (stokedSurfAdventruesPage.data) {
    const result = await puppeteerLoadFetch(
      stokedSurfAdventruesPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "stokedsurfadventures.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.stokedSurfAdventuresData = {
      link: stokedSurfAdventruesPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // soulsurftravel.com.au
  if (soulSurfTravelPage.data) {
    const result = await puppeteerLoadFetch(
      soulSurfTravelPage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "soulsurftravel.com.au",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.soulSurfTravelData = {
      link: soulSurfTravelPage.data,
      textContent: listingDataFromOpenAi.summary
        ? listingDataFromOpenAi.summary
        : result.sanitizedData,
      highlights: listingDataFromOpenAi.highlights
        ? listingDataFromOpenAi.highlights
        : "",
      images: result.uploadedImageLocations,
    };
  }

  // surfershype.com
  if (surfersHypePage.data) {
    const result = await puppeteerLoadFetch(
      surfersHypePage.data,
      true,
      true,
      generateSlug(businessName),
      true
    );

    const listingDataFromOpenAi = await listingScrape(
      "surfershype.com",
      businessName,
      result.sanitizedData,
      prompts
    );

    businessData.surfersHypeData = {
      link: surfersHypePage.data,
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

// @desc    Generate Business Data Demo
// @route   POST /api/data/demo
// @access  Public
export const runDemoHandler = asyncHandler(async (req, res) => {
  // res.json({
  //   errors: [
  //     "Error while scraping expedia: The requested information about Funky Fish Resort could not be found in the provided content.",
  //     "Error while scraping tripAdvisor: The requested information about Funky Fish Resort including its summary and highlights cannot be provided as the content of the listing was not provided.",
  //     "Error while scraping trip: The content of the listing was not provided. As a result, the summary and highlights for Funky Fish Resort cannot be generated. Please provide the content for further assistance.",
  //   ],
  //   data: {
  //     contact_email: "enquiries@funkyfishresort.com",
  //     phone_number: "(679) 999 6393",
  //     whatsapp_number: "",
  //     accomodation_type: "Resort",
  //     trip_type: ["Family Holiday", "Surfing in Comfort and Convenience"],
  //     contact_name: "",
  //     location: "P.O.Box 10314, Nadi Airport, Fiji Islands.",
  //     summary:
  //       "Funky Fish Beach & Surf Resort offers a unique and memorable experience in the heart of the Mamanuca Island group, only 15 kms from Fiji international airport. This resort caters to all, providing an affordable paradise with accommodation options including 1 and 2 Bedroom Beach Front Bures and air-conditioned Cloudbreak View Rooms. Known for its proximity to world-renowned Fiji Surf Breaks, guests have the opportunity to engage in water activities such as surfing, swimming, snorkelling, and fishing. Special deals are available throughout the year, making this fabulous island experience accessible without breaking the budget. The property also operates its own fast, affordable ferry transfer service from their private jetty, ensuring ease of access. Beyond the surf, there's an array of activities including diving, kite surfing, fishing, and hiking, or guests can simply relax and take in the stunning scenery and crystal clear waters. The resort's offerings are completed with a day spa, dining facilities that capture the essence of island cuisine, and romantic, affordable weddings against a backdrop of dramatic sunsets.",
  //     name: "Funky Fish Beach & Surf Resort",
  //     platformSummaries: {
  //       booking: {
  //         summary:
  //           "Funky Fish Beach & Surf Resort is located on Malolo Island and features a 200 metre private beach. It includes a swimming pool, games room, and provides nightly entertainment. The accommodation options range from beach bungalows and private rooms to dormitory rooms, all with shared or private bathroom facilities that include solar-heated showers. Free towels, bed linen, and toiletries are provided daily. The resort is a 10-minute boat ride from famous surfing spots like Cloudbreak and Wilkes Passage, and close to Musket Cove Marina and Malolo Lailai Island. Amenities at the resort include the beachfront restaurant EPIC, which serves fresh seafood along with Fijian and European dishes, Break Bar, The Senibua Spa, and Dories Closet Boutique. Nightly entertainment features karaoke and Fijian dancing, and guests can engage in snorkeling and handline fishing off the reef for free. Kayaks, stand up paddle boards, and motorized water sports are available at additional cost. The location is particularly liked by couples, which is highly rated at 8.1 for a two-person trip. Other popular facilities include an outdoor swimming pool, spa and wellness centre, beachfront location, and the provision of an airport shuttle.",
  //         highlights:
  //           "Outdoor swimming pool, Airport shuttle, Spa and wellness centre, Beachfront, Restaurant, Room service, Bar, Private beach area, Breakfast",
  //       },
  //       agoda: {
  //         summary:
  //           "Funky Fish Beach Resort is a vibrant and lively 3-star hotel located in the breathtaking Mamanuca Islands, Fiji, offering a stunning beachfront location close to Malolo Lailai Airport. This high-quality property provides access to a variety of amenities, including massage, restaurant, indoor pool, and free car parking. It features 17 well-appointed rooms designed with comfort, relaxation, and traditional Fijian touches in mind. Activities available include water sports, hiking, fishing, and wind surfing, among others. The resort ensures a fun-filled stay with facilities like a bar, spa, and outdoor swimming pool, making it an ideal destination for both adventurers and those seeking relaxation. The resort also offers a range of dining options, from a fantastic on-site restaurant to BBQ facilities and a shared kitchen, accommodating various dining preferences including vegan options. Funky Fish Beach Resort stands out for its friendly atmosphere, making guests feel like part of a family, and is highly rated for its value for money, location, and exceptional staff performance.",
  //         highlights:
  //           "Outdoor recreational features include a Private beach, Spa, Swimming pool [indoor], Swimming pool [outdoor], Internet access with Free Wi-Fi in all rooms!, Free Wi-Fi in public areas, Dining, drinking, and snacking alternatives such as Bar, BBQ facilities, Breakfast [buffet], [continental], Shared kitchen, Room service, and For children, there are services like Babysitting service, Family room, Kids meal, Playground. The convenience of Dry cleaning, Laundry service, Luggage storage, Elevator, Daily housekeeping, Smoking area, Safety deposit boxes, and For getting around options like Airport transfer, Car park [free of charge], Shuttle service.",
  //       },
  //       expedia: {
  //         summary: "",
  //         highlights: "",
  //       },
  //       tripAdvisor: {
  //         summary: "",
  //         highlights: "",
  //       },
  //       trip: {
  //         summary: "",
  //         highlights: "",
  //       },
  //       surfHolidays: {
  //         summary:
  //           "Funky Fish Surf Resort, located in Malolo Island amid the Mamanuca archipelago of Fiji, provides a unique blend of convenient access to Fiji's best surf breaks and a serene island retreat for couples, families, groups, and solo travelers. Only 15 km away from Fiji International Airport, the resort is easily reachable and offers direct marine transfer services. Accommodation options range from beachfront family bungalows with kitchenettes to private rooms and a spacious dormitory, all designed to meet various needs and budgets. Recreational facilities include a beachfront restaurant, a bar, a spa, and a boutique, with snorkeling and hand line fishing offered for free, while more adventurous activities like diving and motorized water sports are available at an additional cost. The resort ensures a memorable stay with its friendly atmosphere, private beach access, and an array of amenities aimed at providing comfort and convenience to its guests.",
  //         highlights:
  //           "- 250 meters of private beach\n- The Beachfront restaurant serves fresh seafood, Fijian and European dishes\n- Senibua spa and Dories closet boutique on the beachfront\n- Free snorkeling gear, tramping, hand line fishing off the reef\n- Additional cost for kayaks, stand up paddle boards, motorized water sports diving, fishing, surf tours, island tours\n- Daily boat runs to famous Surf Breaks like Wilkes Passage, Namotu Left, Swimming Pools, Cloudbreak, and Restaurants\n- 24-Hour reception, Air Conditioning, Free WIFI, Outdoor Swimming Pool, Surfboard hire and Storage Area, Restaurant, and Hotel bar among other amenities",
  //       },
  //     },
  //     finalData:
  //       "In the embrace of the Mamanuca Island group, a mere 15 kilometers from Fiji's international threshold, the Funky Fish Beach & Surf Resort emerges as a sanctuary for those who seek the harmonious balance between the excitement of water sports and the peaceful retreat of island life. This resort, with its offer of a unique and memorable sojourn, stands as a testament to the allure of the Fiji Islands, marrying affordable luxury with the raw, untamed beauty of the Pacific.\n" +
  //       "\n" +
  //       "The resort's accommodation options are a study in thoughtful diversity, catering to an array of preferences and needs. From the 1 and 2 Bedroom Beach Front Bures that offer a direct gaze upon the azure expanse, to the air-conditioned Cloudbreak View Rooms that provide a comfortable respite after a day under the sun, each choice is designed with the individual in mind. The lure of the ocean is ever-present, with the resort’s proximity to world-renowned surf breaks such as Cloudbreak and Wilkes Passage offering guests a direct line to the pulse of Fiji’s surf scene.\n" +
  //       "\n" +
  //       "Culinary adventures at the resort are anchored in the rich tapestry of island cuisine. The beachfront restaurant, EPIC, becomes a place of gathering, where fresh seafood meets the tradition of Fijian and European dishes, creating a dining experience that mirrors the complexity and richness of the surrounding sea. The Break Bar complements this with its casual ambiance, inviting guests to unwind with a drink in hand as the day fades into a symphony of color at sunset.\n" +
  //       "\n" +
  //       "For those who find solace in the quietude of the ocean, amenities such as complimentary snorkeling and handline fishing off the reef allow for an intimate connection with Fiji’s aquatic moods. Yet, for the adventurers at heart, the call of the waves is answered with available kayaks, stand up paddleboards, and motorized water sports, ensuring that the rhythm of the sea is ever at one’s fingertips.\n" +
  //       "\n" +
  //       "Beyond the surf, the Funky Fish Beach & Surf Resort broadens its embrace to include an array of activities designed to enrich the soul. The Senibua Spa, a sanctuary of wellness, offers a space for rejuvenation, while Dories Closet Boutique presents a selection of island-inspired fashion and keepsakes. The adventurous can embark on diving excursions or engage in kite surfing, fishing, and hiking, each activity a thread in the vibrant tapestry of Fijian outdoor life.\n" +
  //       "\n" +
  //       "For those planning a day imbued with romance, the resort’s capability to host affordable weddings sets the stage for an unforgettable exchange of vows against the backdrop of the Pacific’s dramatic sunsets. It is an offering that encapsulates the resort’s ethos — accessibility to paradise without the demand of a prohibitive price.\n" +
  //       "\n" +
  //       "In essence, the Funky Fish Beach & Surf Resort stands as a gateway, not just to the explicit thrill of the surf or the allure of island leisure, but to an experience that harmonizes adventure with rest, tradition with personal discovery. It is a place where the vastness of the sea meets the warmth of Fijian hospitality, promising a stay that remains etched in memory, long after the sun dips below the horizon.",
  //   },
  // });
  // return;

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

export const runRegionalHandler = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;

  const businessName = data[0];
  const businessLink = data[1];

  //Generating Data:
  let businessData = { errors: [], data: {} };

  // 1. Scrape Business Data using Two Way communication:
  try {
    businessData.data = await twoWayComm(businessLink, prompts);
  } catch (e) {
    businessData.errors.push("Main Site not working");
    console.log("Main Site not working".red);
  }

  businessData.data.platformSummaries = {};

  const links = {
    booking: { platformURL: "Booking.com", listingUrl: "" },
    agoda: { platformURL: "agoda.com", listingUrl: "" },
    trip: { platformURL: "Trip.com", listingUrl: "" },
    expedia: { platformURL: "expedia.com", listingUrl: "" },
    trivago: { platformURL: "Trivago.com", listingUrl: "" },
    perfectWave: { platformURL: "perfectwavetravel.com", listingUrl: "" },
    luex: { platformURL: "luex.com", listingUrl: "" },
    waterwaysSurf: { platformURL: "waterwaystravel.com", listingUrl: "" },
    worldSafaris: { platformURL: "worldsurfaris.com", listingUrl: "" },
    awave: { platformURL: "awave.com.au", listingUrl: "" },
    atoll: { platformURL: "atolltravel.com", listingUrl: "" },
    surfHolidays: { platformURL: "surfholidays.com", listingUrl: "" },
    surfline: { platformURL: "surfline.com", listingUrl: "" },
    lushPalm: { platformURL: "", listingUrl: "lushpalm.com" },
    thermalTravel: { platformURL: "thermal.travel", listingUrl: "" },
    bookSurfCamps: { platformURL: "booksurfcamps.com", listingUrl: "" },
    nomadSurfers: { platformURL: "nomadsurfers.com", listingUrl: "" },
    stokedSurfAdventrues: {
      platformURL: "stokedsurfadventures.com",
      listingUrl: "",
    },
    soulSurfTravel: { platformURL: "soulsurftravel.com.au", listingUrl: "" },
    surfersHype: { platformURL: "surfershype.com", listingUrl: "" },
  };

  const linksArr = Object.keys(links);

  for (var i = 0; i < linksArr.length; i++) {
    // for (var i = 0; i < 2; i++) {
    const platformName = linksArr[i];
    const platformURL = links[linksArr[i]].platformURL;
    try {
      const listingUrlData = await findListingOnGoogle(
        businessName,
        platformURL
      );
      if (listingUrlData.data) {
        //Scrape Pages from platforms
        links[linksArr[i]].listingUrl = listingUrlData.data;
        const result = await puppeteerLoadFetch(
          listingUrlData.data,
          true,
          true,
          generateSlug(businessName),
          true
        );
        const listingDataFromOpenAi = await listingScrape(
          links[linksArr[i]].platformURL,
          businessName,
          result.sanitizedData,
          prompts
        );

        if (listingDataFromOpenAi.error) {
          throw new Error(listingDataFromOpenAi.error);
        }

        businessData.data.platformSummaries[`${platformName}Data`] = {
          link: listingUrlData.data,
          textContent: listingDataFromOpenAi.summary
            ? listingDataFromOpenAi.summary
            : result.sanitizedData,
          highlights: listingDataFromOpenAi.highlights
            ? listingDataFromOpenAi.highlights
            : "",
          images: result.uploadedImageLocations,
        };
      }
    } catch (error) {
      console.log(
        `Something went wrong while scraping from ${platformName}: ${error.message}`
          .red.inverse
      );
      businessData.errors.push(
        `Error while scraping ${platformName}: ${error.message}`
      );
    }
  }

  // 3. Build Business Slug for yeeew:
  const slug = await slugBuilder(
    data[0],
    businessData.data.location,
    prompts.slugBuilderPrompt
  );
  businessData.data.slug = slug;

  // 4. Generate content
  const content = await generateSEOContentWithGoogle(
    businessData,
    prompts.contentGenerationPromptWithJson,
    true
  );

  businessData.data.content = JSON.parse(content);

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});

// @desc    Scrape Business main site for data
// @route   POST /api/data/scrape-site
// @access  Public
export const scrapeBusinessSite = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;

  const businessLink = data[1];

  //Generating Data:
  let businessData = { errors: [], data: {} };

  // 1. Scrape Business Data using Two Way communication:
  try {
    businessData.data = await twoWayComm(businessLink, prompts);
  } catch (e) {
    businessData.errors.push("Main Site not working");
    console.log("Main Site not working".red);
  }

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});

// @desc    Scrape platforms
// @route   POST /api/data/scrape-platforms-1
// @access  Public
export const scrapePlatforms = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;
  const businessData = req.body.businessData;

  const businessName = data[0];

  businessData.data.platformSummaries = {};

  const links = {
    booking: { platformURL: "Booking.com", listingUrl: "" },
    agoda: { platformURL: "agoda.com", listingUrl: "" },
    trip: { platformURL: "Trip.com", listingUrl: "" },
    expedia: { platformURL: "expedia.com", listingUrl: "" },
    trivago: { platformURL: "Trivago.com", listingUrl: "" },
    perfectWave: { platformURL: "perfectwavetravel.com", listingUrl: "" },
    luex: { platformURL: "luex.com", listingUrl: "" },
    waterwaysSurf: { platformURL: "waterwaystravel.com", listingUrl: "" },
    worldSafaris: { platformURL: "worldsurfaris.com", listingUrl: "" },
    awave: { platformURL: "awave.com.au", listingUrl: "" },
  };

  const linksArr = Object.keys(links);

  for (var i = 0; i < linksArr.length; i++) {
    // for (var i = 0; i < 0; i++) {
    const platformName = linksArr[i];
    const platformURL = links[linksArr[i]].platformURL;
    try {
      const listingUrlData = await findListingOnGoogle(
        businessName,
        platformURL
      );
      if (listingUrlData.data) {
        //Scrape Pages from platforms
        links[linksArr[i]].listingUrl = listingUrlData.data;
        const result = await puppeteerLoadFetch(
          listingUrlData.data,
          true,
          true,
          generateSlug(businessName),
          true
        );
        const listingDataFromOpenAi = await listingScrape(
          links[linksArr[i]].platformURL,
          businessName,
          result.sanitizedData,
          prompts
        );

        if (listingDataFromOpenAi.error) {
          throw new Error(listingDataFromOpenAi.error);
        }

        businessData.data.platformSummaries[`${platformName}Data`] = {
          link: listingUrlData.data,
          textContent: listingDataFromOpenAi.summary
            ? listingDataFromOpenAi.summary
            : result.sanitizedData,
          highlights: listingDataFromOpenAi.highlights
            ? listingDataFromOpenAi.highlights
            : "",
          images: result.uploadedImageLocations,
        };
      }
    } catch (error) {
      console.log(
        `Something went wrong while scraping from ${platformName}: ${error.message}`
          .red.inverse
      );
      businessData.errors.push(
        `Error while scraping ${platformName}: ${error.message}`
      );
    }
  }

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});
// @desc    Scrape platforms
// @route   POST /api/data/scrape-platforms-2
// @access  Public
export const scrapePlatforms2 = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;
  const businessData = req.body.businessData;

  const businessName = data[0];

  const links = {
    atoll: { platformURL: "atolltravel.com", listingUrl: "" },
    surfHolidays: { platformURL: "surfholidays.com", listingUrl: "" },
    surfline: { platformURL: "surfline.com", listingUrl: "" },
    lushPalm: { platformURL: "", listingUrl: "lushpalm.com" },
    thermalTravel: { platformURL: "thermal.travel", listingUrl: "" },
    bookSurfCamps: { platformURL: "booksurfcamps.com", listingUrl: "" },
    nomadSurfers: { platformURL: "nomadsurfers.com", listingUrl: "" },
    stokedSurfAdventrues: {
      platformURL: "stokedsurfadventures.com",
      listingUrl: "",
    },
    soulSurfTravel: { platformURL: "soulsurftravel.com.au", listingUrl: "" },
    surfersHype: { platformURL: "surfershype.com", listingUrl: "" },
  };

  const linksArr = Object.keys(links);

  for (var i = 0; i < linksArr.length; i++) {
    // for (var i = 0; i < 0; i++) {
    const platformName = linksArr[i];
    const platformURL = links[linksArr[i]].platformURL;
    try {
      const listingUrlData = await findListingOnGoogle(
        businessName,
        platformURL
      );
      if (listingUrlData.data) {
        //Scrape Pages from platforms
        links[linksArr[i]].listingUrl = listingUrlData.data;
        const result = await puppeteerLoadFetch(
          listingUrlData.data,
          true,
          true,
          generateSlug(businessName),
          true
        );
        const listingDataFromOpenAi = await listingScrape(
          links[linksArr[i]].platformURL,
          businessName,
          result.sanitizedData,
          prompts
        );

        if (listingDataFromOpenAi.error) {
          throw new Error(listingDataFromOpenAi.error);
        }

        businessData.data.platformSummaries[`${platformName}Data`] = {
          link: listingUrlData.data,
          textContent: listingDataFromOpenAi.summary
            ? listingDataFromOpenAi.summary
            : result.sanitizedData,
          highlights: listingDataFromOpenAi.highlights
            ? listingDataFromOpenAi.highlights
            : "",
          images: result.uploadedImageLocations,
        };
      }
    } catch (error) {
      console.log(
        `Something went wrong while scraping from ${platformName}: ${error.message}`
          .red.inverse
      );
      businessData.errors.push(
        `Error while scraping ${platformName}: ${error.message}`
      );
    }
  }

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});

// @desc    Build Slug
// @route   POST /api/data/slug-build
// @access  Public
export const buildBusinessSlug = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;
  const businessData = req.body.businessData;

  // 3. Build Business Slug for yeeew:
  const slug = await slugBuilder(
    data[0],
    businessData.data.location,
    prompts.slugBuilderPrompt
  );
  businessData.data.slug = slug;

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});

// @desc    Build Slug
// @route   POST /api/data/geolocate
// @access  Public
export const locateBusiness = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const businessData = req.body.businessData;

  if (!businessData.data.location) res.json({ businessData });

  // Google Maps Geocoding API endpoint

  const locations = await fetchGeocodeData(businessData.data.location);
  let lat, lng;
  if (locations.results.length) {
    //Select the first as most likely
    const coordinates = locations.results[0];
    lat = coordinates.geometry.location.lat;
    lng = coordinates.geometry.location.lng;
  }
  businessData.data.coordinates = {
    lat: lat ? lat : 0,
    lng: lng ? lng : 0,
  };

  res.json({ businessData });
});

// @desc    Generate Final Content
// @route   POST /api/data/content-generation
// @access  Public
export const generateFinalContent = asyncHandler(async (req, res) => {
  // const businessData2 = regionalOverviewSampleData;
  // res.json({ businessData: businessData2 });
  // return;
  const prompts = req.body.prompts;
  const data = req.body.data;
  const businessData = req.body.businessData;

  // 4. Generate content
  const content = await generateSEOContentWithGoogle(
    businessData,
    prompts.contentGenerationPromptWithJson,
    true
  );
  debugger;
  // const parsedContent = {
  //   overview: "Bobby's Surf Camp, the original surf camp in G-Land, has been a beacon for surfing adventurers for over 40 years. Situated on the southeast tip of Java within the jungle preserve of Alas Purwo National Park, Bobby's offers a raw, unforgettable experience. The camp's location along the eastern shoreline of Grajagan Bay makes it a prime spot for surfers aiming to tackle some of Indonesia's most impressive waves.",
  //   aboutAccomodation: "Accommodation at Bobby's Surf Camp ranges from standard to VIP packages, each offering different levels of comfort and amenities. The Standard Package features 32 square meters of twin-share accommodation with a private bathroom. For a bit more luxury, the Deluxe Package includes a 36-square-meter room with either twin or queen beds, a private bathroom, and a terrace with a sitting area. Superior rooms are more spacious at 45 square meters and come equipped with hot showers, a minibar, and a TV featuring international and local channels. Those opting for the VIP Package will enjoy a two-story room with four single beds (or an optional double bed) and a hot shower bathroom, providing the height of with luxury and space.",
  //   foodInclusions: "Bobby's Surf Camp ensures that all guests are well-fed, with meals that cater to various dietary restrictions including vegetarian, vegan, and gluten-free options. The menu is a mix of local Indonesian cuisine and Western dishes, incorporating fresh ingredients to provide a wholesome dining experience after a day on the waves.",
  //   specificSurfSpots: "Located along Grajagan Bay, Bobby's Surf Camp is near some of the most iconic surf spots in the region. This includes the notable G-Land waves, known for their consistency and challenge, perfect for seasoned surfers looking to test their skills.",
  //   gettingThere: "Traveling to Bobby's Surf Camp is part of the adventure. The camp is located on Bhineka Jati Jaya Street in Tuban, Bali. Guests typically arrange boat transportation to reach the southeast tip of Java, where the camp is nestled. It's essential to arrange your travel in advance, and the camp's staff can provide recommendations for the best routes and transport providers.",
  //   faq: [
  //     "1. Is there Internet access at Bobby's Surf Camp? - Yes, there is Wi-Fi available at the camp.",
  //     "2. Are there medical facilities nearby? - Basic medical kits are available on-site, but for more serious conditions, the nearest hospital is in Banyuwangi.",
  //     "3. What is the best time of year to surf at G-Land? - The surf season typically runs from May to October.",
  //     "4. Is equipment rental available? - Yes, surfboard rentals are available at the camp.",
  //     "5. Is there alcohol available at the resort? - Yes, there is alcohol available with a variety of options including beer and spirits.",
  //     "6. Are there any local customs or traditions I should be aware of? - Respect for local culture and traditions is important; modest clothing is recommended when traveling through local villages.",
  //     "7. Is there air conditioning in the rooms? - Air conditioning is available in the Superior and VIP packages.",
  //     "8. Is Bali a safe destination? - Yes, Bali is generally safe, but like any destination, it's always good to stay vigilant and aware of your surroundings.",
  //   ],
  //   highlights: "First and original surf camp in G-Land; Over 40 years of operation; Popular among surf legends worldwide; Located in Alas Purwo National Park; Raw, unforgettable adventure experience; Standard Package - Twin Share Accommodation, private bathroom; Deluxe Package - Queen bed, terrace with sitting area; Superior Package - Spacious terrace, minibar, hot shower; VIP Package - Two stories, hot shower bathroom",
  //   trip_type: "Intrepid Adventures, Luxury Holiday, Surfing in Comfort and Convenience",
  //   accomodation_type: "Resort, Hostel",
  //   location: "Bhineka Jati Jaya Street 1 No. 8, Tuban, Bali",
  //   phone_numbers: "+62 82 341 599 588",
  //   whatsapp_numbers: "+62 82 341 599 588",
  //   emails: "reservation@bobbysgland.com",
  //   contact_names: "",
  // }
  const parsedContent = JSON.parse(content);
  if (parsedContent.accomodation_type) {
    businessData.data.accomodation_type = parsedContent.accomodation_type;
  }
  if (parsedContent.trip_type) {
    businessData.data.trip_type = parsedContent.trip_type;
  }
  if (parsedContent.location) {
    businessData.data.location = parsedContent.location;
  }
  if (parsedContent.phone_number) {
    businessData.data.phone_number = parsedContent.phone_number;
  }
  if (parsedContent.whatsapp_number) {
    businessData.data.whatsapp_number = parsedContent.whatsapp_number;
  }
  if (parsedContent.email) {
    businessData.data.email = parsedContent.email;
  }
  if (parsedContent.contact_name) {
    businessData.data.contact_name = parsedContent.contact_name;
  }

  businessData.data.content = parsedContent;

  console.log(JSON.stringify(businessData));
  res.json({ businessData });
});
