const pt = require("puppeteer");
const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const path = require("path");
// const { getSpreadSheetValues } = require("./util/googleSheetsService");

const apiKey = process.env.OPEN_AI_API_KEY;
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

function sanitizeHTML(html) {
  try {
    // Regular expression to extract hrefs from <a> tags
    const hrefRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gim;
    let hrefs = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      hrefs.push(match[1]);
    }

    // Create a string of hrefs separated by new lines
    const hrefsString = hrefs.join("\n") + "\n\n";

    // Regular expressions to remove various non-textual elements
    var cleanedContent = html
      .replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "")
      .replace(/<style[^>]*>([\S\s]*?)<\/style>/gim, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gim, "")
      //    .replace(/<[^>]*>/g, '')
      .replace(/<(?!\/?a\s*[^>]*>)[^>]*>/g, "")
      .replace(/(<a [^>]*?)\sclass="[^"]*"(.*?>)/gi, "$1$2")
      .replace(/(onclick|onload)="[^"]*"/gim, "")
      .replace(/style="[^"]*"/gim, "")
      .replace(/\s+/g, " ")
      .trim();

    // Concatenate hrefs at the top of the cleaned content
    const finalContent = hrefsString + cleanedContent;

    return finalContent;
  } catch (e) {
    console.log(e);
    throw new Error(
      "Link " + url + " not valid or not reachable: " + e.message
    );
  }
}
const puppeteerLoadFetch = async (link, justText, scrapeImages) => {
  const browser = await pt.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 500 });

  await page.goto(link);

  await page.screenshot({ path: "image.png" });

  let sanitizedData;
  if (scrapeImages) {
    const images = await page.evaluate(() => {
      const imagesArray = [];
      document.querySelectorAll("img").forEach((image) => {
        imagesArray.push(image.src);
      });
      return imagesArray;
    });
    await saveImages(link, images);
  }

  if (justText) {
    await page.evaluate(() => {
      document.querySelectorAll("a").forEach((a) => {
        a.outerHTML = "Link: " + a.href + " " + a.innerText + " ";
      });
    });
    sanitizedData = await await page.evaluate(() => {
      return document.querySelector("body").innerText;
    });
    // if(scrapingFrom.toLowerCase() === 'google'){
    //   sanitizedData = await await page.evaluate(() => {
    //     return document.querySelector('[role="main"]').innerText;
    //   });

    // }else{
    //   sanitizedData = await await page.evaluate(() => {
    //     return document.querySelector(body).innerText;
    //   });
    // }
  } else {
    const HTML = await page.content();
    sanitizedData = sanitizeHTML(HTML);
  }

  await browser.close();

  return sanitizedData;
};

//Fetch the relevant yeeew links from google
const fetchRelevantGoogleLinks = async (link, max) => {
  const browser = await pt.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 500 });

  await page.goto(link);

  await page.screenshot({ path: "image.png" });

  const links = await page.$$eval(`a[href^="https://www.yeeew.com/"]`, (as) =>
    as.map((a) => a.href)
  );
  await browser.close();

  console.log(links);

  return links.slice(0, max);
};

async function saveImages(link, images) {
  const folderPath = path.join(__dirname, "images");
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  for (const image of images) {
    try {
      if (image != "") {
        const imageResponse = await axios.get(image, {
          responseType: "stream",
        });
        const filePath = path.join(folderPath, path.basename(image));
        const fileStream = fs.createWriteStream(filePath);
        imageResponse.data.pipe(fileStream);
      }
    } catch (e) {
      console.log(e);
    }
  }
}

const regularFetch = async (link, scrapeImages = false) => {
  let response;
  try {
    // const scraperAPIUrl = "https://api.scraperapi.com/?api_key=fe563d2e2531c760d454cbc530b12f96&url=" + encodeURIComponent(link);
    const scraperAPIUrl = link;
    response = await fetch(scraperAPIUrl);

    let htmlContent = await response.text();

    if (scrapeImages) {
      const $ = cheerio.load(htmlContent);
      const images = [];

      $("img").each((index, element) => {
        const src = $(element).attr("src");
        images.push({ src });
      });

      await saveImages(link, images);
    }
    return sanitizeHTML(htmlContent);
  } catch (e) {
    console.log(e);
    throw new Error(
      "Link " + link + " not valid or not reachable: " + e.message
    );
  }
};

const communicateWithOpenAi = async (link, prompt, apiKey) => {
  try {
    const cleanedContent = await puppeteerLoadFetch(link, true);
    const messages = [
      {
        role: "system",
        // If the data is not found, send back instead the next plausible link where it could be found based on the code provided to you eg /contact or /contact-us (in case the user is looking for contact data). This should also be in JSON as
        // Make sure this next link is working. What i mean is, if the next link points to /contact, make sure the returned link is in the form https://google.com/contact ,in this case, the initial site passed to you is google.com.
        // {nextLink: NEXT LINK HERE}
        content: `You will go through a provided code and look for the requested data.
            If the data is found, return a JSON response with data in 
            {data: FOUND DATA HERE}
            If instead the data is nowhere to be found, write a nice message saying something like "The email could not be found on this site (Or something along those line) in JSON as 
            {error: YOU RESPONSE HERE}
            Only reply in the above fashion.
          `,
      },
      { role: "user", content: prompt + ":\n" + cleanedContent },
    ];

    var data = {
      messages: messages,
      // model: "gpt-4-turbo-preview",
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
    });

    const responseInJson = await response.json();
    if (!response.ok) {
      throw new Error(
        responseInJson.error
          ? responseInJson.error.code + ": " + responseInJson.error.message
          : "Something went wrong trying to connect with the OpenAI API"
      );
    }
    const parsedResponse = responseInJson["choices"][0]["message"]["content"];
    console.log(parsedResponse);
    // Since our responses are also replied as JSON strings
    return JSON.parse(parsedResponse);
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

const regularOpenAi = async (link, prompt, apiKey) => {
  let cleanedContent;
  try {
    if (link != "") cleanedContent = await regularFetch(link);
    const messages = [
      {
        role: "system",
        content: `
          You will generate SEO rich content describing different business' based on the provided data about them. 
          Reference surfing spots as surf spots and make it sound exciting! write this in the style of William Finnegan's writing
          You will Write it in the third person. Make sure your writing is factual. Write a description of the accommodation.
           You will also be provided with a list of the user's existing site page links, based on which, where possible you will try to link your written content to other relevant existing pages of the user's site.
           Make sure the connections are natural, based on things like other surf spots in the area, similar accomodations etc.
          `,
      },
      { role: "user", content: prompt },
    ];
    if (cleanedContent) {
      messages.push({
        role: "user",
        content: "Here's our existing site pages:" + cleanedContent,
      });
    }
    var data = {
      messages: messages,
      // model: "gpt-4-turbo-preview",
      model: "gpt-4-turbo-preview",
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
    });

    const responseInJson = await response.json();
    if (!response.ok) {
      throw new Error(
        responseInJson.error
          ? responseInJson.error.code + ": " + responseInJson.error.message
          : "Something went wrong trying to connect with the OpenAI API"
      );
    }

    const parsedResponse = responseInJson["choices"][0]["message"]["content"];
    console.log(parsedResponse);
    // Since our responses are also replied as JSON strings
    return parsedResponse;
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

const siteInfoScrapper = async (
  link,
  prompt,
  previousData,
  scrapeImages = false
) => {
  try {
    const cleanedContent = await regularFetch(link, scrapeImages);
    const messages = [
      {
        role: "system",
        content: `You are a site scrapper. You will be provided a site, and a list of content that needs to be scrapped, as well as pages from the site you've been to and content that is scrapped.
            As you go through the site, you will accumulate the data wherever found. If a particular data is not found, you will leave it empty. 
            You will try to navigate through at most 5 of the more relevant pages where you can find the data based on your best judgement.
            Each time you go through a page, return a JSON with a field called "data" which will contain the found data, such as contact_email: "" phone_number: "" etc. This data will be fed back to you on subsequent requests so you are aware of data that is found already
            On top of the data field, you will return a "nextLink" field, which will contain the next most likely page you'd like to navigate to to get more data. Just make sure every next link is a page from the main site, not somewhere else on the internet. You will then be fed the code of that page and the cycle continues. Once you feel all the site is scrapped, do not return the nextLink field (the data field should still be returned)
            The nextLink should be the absolute link of the business, so instead of /about, it should be https://business.com/about.
            Refine the data as you find out more about the business.
          `,
      },
      { role: "user", content: prompt + cleanedContent },
    ];
    if (previousData) {
      messages.push({
        role: "user",
        content: `Here's a json containing the previous data you sent as well as links you've already visited: ${JSON.stringify(
          previousData
        )}`,
      });
    }

    var data = {
      messages: messages,
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
    });

    const responseInJson = await response.json();
    if (!response.ok) {
      throw new Error(
        responseInJson.error
          ? responseInJson.error.code + ": " + responseInJson.error.message
          : "Something went wrong trying to connect with the OpenAI API"
      );
    }
    const parsedResponse = responseInJson["choices"][0]["message"]["content"];
    console.log(parsedResponse);
    // Since our responses are also replied as JSON strings
    return JSON.parse(parsedResponse);
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

const twoWayComm = async (link, prompt) => {
  const maxIterations = 5;
  let iteration = 1;
  const visitedLinks = [];

  let response = await siteInfoScrapper(link, prompt, undefined, false);
  visitedLinks.push(link);
  while (
    response.nextLink &&
    response.nextLink != "" &&
    iteration < maxIterations
  ) {
    iteration++;
    const previousData = { previousReturnedData: response.data, visitedLinks };
    response = await siteInfoScrapper(
      response.nextLink,
      prompt,
      previousData,
      false
    );
    visitedLinks.push(response.nextLink);
  }
  // if (response2.error && response2.error != "") {
  //   return JSON.stringify(response2.error);
  // }
  console.log(response);
  // if (iteration === maxIterations && response2.nextLink) {
  //   return "Data not found, and ran into max page lookup of " + maxIterations;
  // }

  // if (response2.data) {
  //   return JSON.stringify(response2.data);
  // } else {
  //   return JSON.stringify(response2);
  // }
  return response.data;
};

//Used to get listing of business' on platforms like Booking, Trip.com etc
const findListingOnGoogle = async (businessName, platform) => {
  const prompt = `Use the following Google.com code to look for ${businessName}'s listing on ${platform}. There might be ads, or similar looking pages, or reviews or other pages. We only want the listing on the ${platform}, not reviews or other pages related to it.If not found, return an error in json i.e error: "not found"`;
  const link = `https://www.google.com/search?q=${encodeURIComponent(
    businessName + " " + platform
  )}`;
  return await communicateWithOpenAi(link, prompt, apiKey);
};

// Used to generate SEO content based on sitemap:
const generateSEOContent = async (businessData) => {
  // const yeewSiteMapLink = "https://www.yeeew.com/job_listing-sitemap.xml";
  // const prompt = `Provided the following data about this business: ${JSON.stringify(businessData)} and the following list of our existing site content, write content about this business that is both relevant, as well as internally linked to other businesses/pages on our site. Only make such connection when relevant. Return as a styled html`
  const yeewSiteMapLink = "https://www.yeeew.com/job_listing-sitemap.xml";
  const prompt = `
        You have been provided with the following data about a business:
        ${JSON.stringify(businessData)}

        Your task is to generate SEO-rich content describing this business. 
        Please ensure that the content:
        - Is written in the third person.
        - Includes factual information about the business, such as its location, services offered, amenities, etc.
        - Uses a tone that is informative and engaging, suitable for attracting potential customers.
        - Incorporates relevant keywords related to surfing, accommodations, and other relevant topics.
        - Contains internal links to other relevant pages on the website where appropriate.

        Return the resulting content as a styled HTML document.
    `;
  const content = await regularOpenAi(yeewSiteMapLink, prompt, apiKey);
  fs.writeFile("indexSiteMap.html", content, "utf8", (err) => {
    if (err) {
      console.error("Error writing HTML file:", err);
    } else {
      console.log("SEO content saved to indexSiteMap.html");
    }
  });
};

// used to generate site content based on relevant google data:
const generateSEOContentWithGoogle = async (data) => {
  //Get relevant google data:
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    data.location + " " + "yeeew.com"
  )}`;
  const links = await fetchRelevantGoogleLinks(googleUrl, 4);

  //Fetch each link:
  const relevantLinks = [];
  for (let i = 0; i < links.length; i++) {
    // const linkData = await regularFetch(links[i]);
    const linkData = await puppeteerLoadFetch(links[i], true);
    relevantLinks.push({
      link: links[i],
      linkHTML: linkData,
    });
  }

  // const prompt = `The following is some data about this business: ${JSON.stringify(data)}. And the following are some relevant links within our existing site as well as the html of these links: ${JSON.stringify(relevantLinks)}.Based on both of these, write SEO rich content about this business. Make sure the content is in third person and follows the other system rules set during the API call.`

  // Generate prompt for content generation
  const prompt = `
        You have been provided with the following data about a business:
        ${JSON.stringify(data)}

        Additionally, you have retrieved the following relevant links from Google:
        ${JSON.stringify(relevantLinks)}

        Based on the provided business data and relevant links, your task is to generate SEO-rich content about this business. 
        Please ensure that the content:
        - Is written in the third person.
        - Incorporates information from the provided business data and relevant links.
        - Uses a tone that is informative and engaging, suitable for attracting potential customers.
        - Includes internal links to other relevant pages on the website where appropriate.
    `;
  const content = await regularOpenAi("", prompt, apiKey);
  fs.writeFile("indexGoogleData.html", content, "utf8", (err) => {
    if (err) {
      console.error("Error writing HTML file:", err);
    } else {
      console.log("SEO content saved to indexGoogleData.html");
    }
  });
  return content;
};

// const generateDataFromSheet = async (range) => {
//   try {
//     const response = await getSpreadSheetValues(
//       spreadsheetId,
//       sheetName,
//       range
//     );

//     const rows = response.data.values;
//     if (rows.length) {
//       for (let i = 3; i <= 3; i++) {
//         // for (let i = 3; i < rows.length; i++) {
//         const businessName = rows[i][0];
//         const businessLink = rows[i][1];
//         //If link exists:
//         if (businessLink != "" && businessLink != "NA") {
//           const businessData = await generateBusinessData(
//             businessLink,
//             businessName
//           );
//         }
//       }
//     } else {
//       console.log("No Data Found");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const generateBusinessData = async (link, businessName) => {
  let data = {};
  try {
    // 1. Scrape Business Data using Two Way communication:
    data = await twoWayComm(link, fullScrapperPrompt);
    //2. Scrape listings on booking,trip,trivago about business:
    const bookingPage = await findListingOnGoogle(businessName, "Booking.com");
    const tripPage = await findListingOnGoogle(businessName, "Trip.com");
    const trivagoPage = await findListingOnGoogle(businessName, "Trivago.com");

    //Scrape Pages from platforms
    let bookingTextContent, tripTextContent, trivagoTextContent;

    if (bookingPage.data) {
      bookingTextContent = await puppeteerLoadFetch(bookingPage.data);
      data.bookingPageSummary = bookingTextContent;
    }

    if (tripPage.data) {
      tripTextContent = await puppeteerLoadFetch(tripPage.data);
      data.tripPageSummary = bookingTextContent;
    }
    if (trivagoPage.data) {
      trivagoTextContent = await puppeteerLoadFetch(trivagoPage.data);
      data.trivagoPageSummary = bookingTextContent;
    }

    // 3. Build Business Slug for yeeew:
    const slug = await slugBuilder(data.name, data.location);
    data.slug = slug;

    // 4. Generate content
    const content = await generateSEOContentWithGoogle(data);
    console.log(content);
    data.content = content;
  } catch (err) {
    console.log("Error occurred during processing:", err.message);
  }

  console.log(data);
  return data;
};

const fullScrapperPrompt = `Find the business' location, business name, contact email, phone number, contact name,
  whatsapp number, accomodation type, trip type, surroundings, and a 1000 character summary of the business which you will refine as you go through the site to contain as much details about the business as possible.
  The summary can be bullet points of all the important information of the business you can find. Anything from awards, to temperatures, to people, and anything else you think distinguishes the business.
  The accomodation type should be based on the following definitions:
   Select up to 2-3 if needed: 
       Hotel:Hotels offer a diverse range of accommodations, from standard rooms to suites, providing a comfortable and convenient stay for surfers and other travellers. Rooms typically include essential amenities such as private bathrooms, Wi-Fi, and in-room services. Some hotels may have on-site dining options and basic recreational facilities. With a strong focus on affordability, hotels cater to various budgets, making them accessible to solo travellers, families, and groups.
       Hostel:Hostels offer a budget-friendly and communal atmosphere for surfers and other travellers. Typically providing dormitory-style accommodations with shared facilities, hostels encourage social interactions among guests. Basic amenities like communal kitchens and common areas are common. Ideal for solo travellers or groups seeking an affordable and sociable experience near surf spots.
       Charter:Charter accommodations provide a personalised and often exclusive experience for surfers and other travellers. These may involve private boat or yacht charters, offering mobility between surf spots. Prices vary based on the level of luxury and customization. Ideal for those seeking a tailored surf adventure with flexibility in destination exploration.
       Resort:Resorts provide a luxurious and comprehensive experience for surfers and other travellers seeking a blend of comfort and recreational activities. Accommodations in resorts often include well-appointed rooms, suites, or private villas, featuring upscale amenities such as spa services, multiple dining options, pools, and sometimes private beaches. The resort setting creates a relaxing and indulgent atmosphere, making it suitable for those who prioritise a high level of comfort and leisure. Due to the upscale facilities and services offered, resorts are generally priced at a higher range, appealing to travellers looking for an elevated vacation experience.
       Villa:Villas offer a private and spacious retreat for surfers and other travellers, often equipped with multiple bedrooms, a kitchen, and private amenities. Suited for groups or families, villas provide a secluded and personalised surf experience. Prices can range from moderate to high, depending on the villa's features and location.
       Cabin:Cabins provide a rustic and cosy accommodation option for surfers and other travellers, fostering a closer connection to nature. Typically found in scenic locations, cabins are ideal for those seeking a simpler and more secluded surf experience. Prices vary based on amenities, size, and location.
       Rental Campervan:Rental campervans offer a mobile and adventurous accommodation option for surfers and other travellers. Perfect for those who value flexibility and freedom, campervans allow travellers to explore different surf spots at their own pace. Prices depend on the campervan's size, features, and rental duration.
       Rental Accommodation:Rental accommodations encompass a variety of options, from apartments to houses, providing flexibility and a home-like environment for surfers and other travellers. Suited for those who prefer self-catering and independence. Prices vary based on the type and location of the rental.
       Mobile Tour:Mobile tours offer a unique and guided surf experience for surfers and other travellers, often involving specialised vehicles. Suited for adventurous individuals, mobile tours provide a curated experience with the flexibility to explore diverse surf spots. Prices depend on the tour's duration, included activities, and level of customisation.
   The trip type based on the following. Select up to 2-3 if needed:
       Boat Charter:Boat charters offer an immersive experience for surfers and travellers keen on water sports. These trips provide the opportunity to explore various surf spots and engage in activities such as snorkelling, diving, and other water-based adventures. Ideal for enthusiasts seeking a dynamic and aquatic-focused vacation with the flexibility to discover multiple coastal destinations.
       Family Holiday:Family holidays cater to the needs of travellers with children, providing a well-rounded experience for all family members. These trips typically include family-friendly accommodations, activities suitable for various age groups, and amenities that promote a comfortable and enjoyable stay. Perfect for creating lasting memories and bonding through shared experiences.
       Intrepid Adventures:Intrepid adventures are tailored for adventurous and thrill-seeking travellers. These trips often involve exploration of off-the-beaten-path destinations, challenging outdoor activities, and a focus on cultural immersion. Suited for those who seek a more unconventional and adrenaline-fueled travel experience.
       Learn to Surf:Learn to Surf trips are designed for individuals who want to master the art of surfing. These packages include professional surf lessons, suitable accommodations near beginner-friendly surf spots, and an environment conducive to skill development. Ideal for beginners or those looking to enhance their surfing abilities.
       Luxury Holiday:Luxury holidays provide a premium and indulgent travel experience for those who appreciate high-end accommodations, personalised services, and exclusive amenities. These trips cater to travellers seeking sophistication, comfort, and a heightened level of relaxation. Ideal for those who wish to enjoy a lavish vacation with impeccable attention to detail.
       Surfing in Comfort and Convenience: Surfing in comfort and convenience trips focus on providing surfers with a blend of quality accommodations and easy access to surf spots. These packages prioritise comfort, often including upscale lodging, convenient transport to surf locations, and amenities that enhance the overall surfing experience. Suited for surfers who want a seamless and enjoyable trip.
       Wave Pool:Wave pool trips cater to surfers who want a controlled and consistent surfing experience. These packages include access to artificial wave pools, ensuring a predictable and enjoyable surf session. Ideal for those who seek a unique and reliable surfing environment, particularly when natural surf conditions may be unpredictable.
       Business:Business trips are tailored for travellers with work-related purposes. These trips prioritise accommodations with business-friendly amenities, convenient locations, and facilities for meetings or remote work. Suited for professionals who need a balance between work commitments and travel.

   The fields should be exactly named as follows:
   "contact_email", "phone_number", "whatsapp_number","accomodation_type","trip_type","contact_name","location","summary", "name"`;

const slugBuilder = async (businessName, location) => {
  try {
    const structure = `{"europe":{"united-kingdom-ireland":{"england":{"southern-england-west":{"sidmouth-lyme-bay":{},"southbourne":{},"the-bill":{},"torbay":{}},"southern-england-east":{"bracklesham-bay":{},"brighton-west-pier":{},"eastbourne":{},"joss-bay":{},"littlehampton":{},"tidemills":{}},"cornwall-devon-south":{"porthleven":{}},"newquay":{"newquay-fistral-north":{},"newquay-little-fistral":{},"newquay-fistral-south":{}},"devon-north":{"croyde-beach":{}},"yorkshire-lincolnshire":{"cayton-bay-pumphouse":{},"sutton-on-sea":{},"whitby":{},"withernsea":{}},"durham-northumberland":{"south-shields":{}},"cornwall-north":{"bude-crooklets":{},"trevone":{}}},"scotland":{"caithness-west":{"castlehill-to-murkle":{},"murkle-point":{},"shit-pipe":{}},"sutherland":{"armadale-bay":{},"durness-balnakeil-bay":{},"strathy":{}},"southeast-scotland":{"arbroath":{},"balmedie-to-newburgh":{},"cruden-bay":{},"kingsbarns":{},"nigg-bay":{},"peterhead-sandford-bay":{},"st-andrews-east":{},"st-andrews-west":{},"st-combs-to-inverallochy":{},"stonehaven":{}},"moray-firth":{"boyndie-bay":{},"lossiemouth":{}},"outer-hebrides":{"eoropie":{},"hosta":{},"dalmore":{},"mangersta":{},"port-of-ness":{}},"inner-hebrides":{"ardnave-bay":{},"dunaverty":{},"islay-machir-bay":{},"laggan-bay":{},"lossit-bay":{},"machrihanish":{},"port-bharrapol-tiree":{},"saligo-bay":{},"the-hough":{},"the-maze":{},"westport-2":{}}},"wales":{"pembrokeshire":{"whitesands-bay":{}}}},"france":{"the-channel":{"yport":{},"lanse-du-brick":{},"collignon":{},"cap-gris-nez":{},"calais":{}},"brittany-north":{"blancs-sablons":{},"le-dossen":{},"plage-du-sillon-st-malo":{},"pors-ar-villec-locquirec":{},"trestaou":{}},"finistere-south":{"anse-de-pen-hat":{},"la-palue":{},"la-torche":{},"saint-tugen":{}},"morbihan-loire-atlantique":{"guidel-les-kaolins":{},"plage-du-loch":{}},"vendee":{"les-conches-bud-bud":{},"les-dunes":{},"sauveterre":{},"les-sables-dolonne":{}},"landes":{"tarnos":{},"ondres-plage":{},"moliets-plage":{},"mimizan-plage":{},"la-salie":{}},"sourthern-france-east":{"villefranche-sur-mer":{},"st-laurent-du-var":{},"sagone":{},"route-des-sanguinaires":{}},"hossegor":{"la-graviere":{},"element-called-water-surf-camp":{}}},"azores":{"sao-miguel":{"populo":{}}},"madeira":{"all-madeira-spots":{"ponta-do-tristao":{},"madalena-do-mar":{},"ponta-paul":{},"ribeira-da-janela":{}}},"portugal":{"minho-douro":{"afife":{},"agucadoura":{},"azurara":{},"esposende":{},"fao":{},"luz-porto":{},"perafita":{},"viana-do-castelo":{},"vila-do-conde":{}},"beira-litoral":{"buarcos":{},"cabedelo":{},"praia-da-barra":{},"sao-pedro-do-moel":{},"torreira":{},"espinho":{}},"peniche":{"belgas":{},"praia-azul":{},"supertubos":{}},"south-algarve":{"arrifana":{},"carrapateira":{},"lagos":{},"sagres-south":{},"zavial":{},"sagres-tonel":{},"praia-da-rocha":{},"praia-da-luz":{},"praia-da-cordoama":{},"praia-da-bordeira":{},"monte-clerigo":{},"praia-castelejo":{},"beliche":{}},"ericeira-portugal":{"foz-do-lizandro":{},"coxos":{}},"lisbon":{"fonte-da-telha":{},"lagoa-de-albufeira":{},"lisbon-estoril":{},"praia-grande-south":{},"sesimbra":{}},"alentejo-north-algarve":{"carriagem":{},"cogumelo":{},"porto-covo":{},"zambujeria-do-mar":{}}},"canary-islands":{"tenerife":{"la-izquierda-spanish-left":{}},"fuerteventura":{"los-hoteles":{},"playa-de-la-pared":{},"cotillo":{}},"gran-canaria":{"grand-canaria-north":{"bocabarranco":{},"el-paso":{},"la-barra-las-canteras":{},"quintanilla-gran-canaria":{},"la-cicer":{},"el-lloret":{},"el-fronton":{},"el-confital":{}},"gran-canaria-south":{"derecha-del-faro":{},"mosca-point":{},"arguineguin":{}}},"fuerteventura-north-coast":{"majanicho":{}}},"spain-spain":{"asturias-west":{"tapia-de-casariego":{},"salinas-y-espartal":{},"playon-de-bayas":{},"penarronda":{},"frejulfe":{},"san-lorenzo":{},"xago":{},"penarrubia":{}},"balearics":{"platja-de-cavalleria-menorca":{},"punta-prima-menorca":{},"canyamel":{},"can-pujols-ibiza":{},"cala-agulla":{},"aucanada-mallorca":{},"puerto-de-soller":{}},"eastern-spain":{"montgat":{},"playa-de-levante-valencia":{},"jucar":{},"platja-de-san-juan-valenciana":{},"la-mojonera-murcia":{},"faro-de-calaburra-andalucia":{},"masnou":{},"playa-cueva-del-lobo":{},"playa-de-carchuna-calahonda":{},"playa-de-la-carihuela-andalucia":{},"playa-del-dedo-andalucia":{},"sagunto":{},"los-alamos-andalucia":{}},"cantabria-west":{"playa-de-meron":{},"liencres":{},"gerra":{},"santander-el-sardinero":{}},"andalucia":{"los-canos":{}},"pais-vasco-east":{"laga":{},"mundaka":{}},"asturias-east":{"playa-espana":{},"playa-vega":{},"rodiles":{},"san-antolin":{},"ribadesella":{}},"galicia-west":{"caion":{},"barranan":{},"santa-maria-de-oia":{},"playa-de-traba":{},"playa-del-orzan":{},"rio-siera":{},"louro":{},"razo":{},"praia-de-sabon":{},"nemina":{},"la-lanzada":{}},"galicia-east":{"muinelos":{},"ponzos":{},"reinante":{},"san-anton":{},"san-cosme":{},"san-xorxe":{},"foz":{},"valdovino":{},"pantin":{}},"pais-vasco-west":{"bakio":{},"menakoz":{},"sopelana":{},"punta-galea":{},"la-arena":{}}}},"indonesia":{"bali":{"east-bali":{"serangan-island":{},"sanur":{},"serangan-turtle-island":{},"ceningans":{},"ketewel":{},"sri-lanka-bali":{}},"west-bali":{"balian":{"pererenan":{}},"kuta-beach":{},"hyatt-reef":{},"airport-rights":{},"old-mans-batu-bolong":{},"medewi":{},"berawa-beach":{},"padma":{},"seminyak":{},"airport-lefts":{}},"east-coast":{"padang-galak":{}},"bukit-peninsula":{"nyang-nyang":{},"dreamland":{},"padang-padang":{},"micks-place":{},"la-joya-resort":{},"bingin-surf-spot":{},"uluwatu-cottages":{}}},"rote":{"boa":{},"doo":{}},"sumbawa":{"west-sumbawa-sumbawa":{"yo-yos-the-wedge":{},"tropical":{},"yo-yos-the-hook":{}}},"sumba":{"racetrack-sumba":{},"pantai-marosi":{},"central-java-sumba":{"bondo-kodi":{}},"pero-lefts":{}},"lombok":{"south-lombok":{"halfway-kuta":{},"belongas":{},"air-guling":{},"air-guling-2":{},"don-don":{},"out-inside-ekas":{},"gili-trawangan":{},"mawi":{}}},"savu-and-rote-surfing":{"raijua":{},"savu-lefts":{},"savu-right":{},"t-land-2":{}},"java":{"g-land":{"tiger-tracks-rights":{},"g-land":{},"tiger-tracks-left":{}},"east-java":{"parangtritis":{},"moneytrees":{},"kongs":{},"chickens-2":{},"launching-pads":{},"speedies":{}},"west-java":{"sawarna":{},"outside-bombies":{},"ujung-genteng-harbour":{},"cimaja":{},"turtles":{},"binangeun":{},"tingil-island":{},"dili-island":{},"cikembang":{},"baya-beach":{},"karang-haji":{},"samundra":{},"mamas":{},"loji":{},"baya-reef":{}},"panaitan-island":{"panaitan-rights":{},"one-palm-point":{},"illusions":{},"pussies":{},"inside-rights":{},"napalms":{},"insides":{}},"central-java":{"batu-karas":{},"ploso":{}}},"west-sumatra":{"mentawais":{"central-mentawai-islands":{"suicides":{},"bintangs-right":{},"lances-left":{}},"southern-mentawai-islands":{"kfcs":{},"green-bush":{},"rags-right":{},"batcaves":{}},"northern-mentawai-islands":{"no-kandui":{},"beng-bengs":{},"bank-vaults":{},"burger-world":{},"ebay":{},"4-bobs":{},"kandui":{},"nipussi":{},"rifles":{}},"pitstops":{},"huey-1-surf-charter":{},"navistar-surf-charter":{},"the-mangalui-ndulu-surf-charter":{},"oasis-surf-charter":{},"resort-latitude-zero":{},"west-sumatramentawaisnorthern-mentawai-islands":{},"macoronis-resort":{},"hideaways-surf-spot-2":{}},"nias":{"nias-and-hinako-islands":{"lagundri-bay-the-point":{},"afulu":{},"asu":{},"asu-surf-camp-2":{}}},"lampung":{"mandiri":{},"jennys-right":{},"the-peak-krui":{},"ujung-bocur-karang-nyimbor":{},"way-jambu":{}},"aceh":{"lampuuk":{}},"telos":{"latitude-zero-resort":{}}},"north-sumatra":{"simeulue-and-banyak-islands":{"gunturs":{},"tea-bags":{},"treasure-island":{}}},"morotai":{"mor-ma-doto-resort":{}}},"pacific-ocean":{"hawaii":{"north-west-maui":{"hookipa":{},"peahi-jaws":{}},"kauai":{"tunnels":{},"acid-drop":{},"hanalei-bay":{},"mana-point":{},"polihale":{},"anahola-bay":{},"centers":{},"kalihiwai-point":{}},"honolua-bay":{},"oahu":{"diamond-head-2":{},"oahu-north-shore":{"pupukea":{},"phantoms":{},"himalayas":{},"walls":{},"aligator-rock":{},"leftovers":{},"boneyards":{},"kammieland":{},"outside-puaena-point":{},"banzai-pipeline":{},"yokohama":{},"sunset":{},"ehukai":{}},"oahu-south-shore":{"makaha-point":{},"makapuu-point-suicides":{},"waikiki":{},"paradise-2":{},"fours":{},"bomburas":{},"baby-haliewa":{}},"turtle-bay-resort":{}},"big-island":{"honolii":{},"pine-trees":{},"waipio-bay":{},"honopue-bay":{},"pololu-valley":{},"upolu":{},"pohoiki":{},"hapuna-pt":{},"kawaihae-breakwater":{},"magics":{},"bayans":{},"kahaluu":{},"lymans":{},"honls":{},"kohala-lighthouse":{},"honokane-bay":{}},"maui":{"north-west-maui":{"hana-bay":{},"d-t-fleming-beach-park":{},"dumps":{},"maalaea-bay":{}}},"rocky-point":{},"ala-moana-bowls":{},"kailua":{},"little-makaha":{},"honokahau":{},"tracks":{},"lahaina-harbor-breakwall":{},"maalaea-bay-2":{},"barbers-point":{},"maili-point":{},"aluhi-bay":{},"rainbows":{},"waimea-bay":{},"windmills-maui":{},"windmills-2":{},"backyards":{},"rockpiles-heisler-park":{},"velzyland":{},"laniakea":{},"sandy-beach":{},"oahu-north-shore":{"off-the-wall":{}},"backdoor":{}},"french-polynesia":{"tahiti-and-moorea":{"teahupoo":{}}},"fiji-pacific-ocean":{"mamanucas-and-viti-levu":{"endless-summer-fiji%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B":{},"rendezvous-surf-camp":{},"fiji-hideaway-resort-spa":{},"lomani-island-resort":{},"namotu-island-resort-fiji":{},"intercontinental-fiji-golf-resort-spa":{},"tavarua-resort":{},"momi-bay-mini-cloudbreak":{},"frigates-pass":{},"cloudbreak":{},"restaurants-surf-spot":{}},"kadavu-passage":{"qamea-resort-spa":{},"beqa-lagoon-resort":{}}}},"australia":{"queensland":{"sunshine-coast":{"noosa":{"yha-hostel-noosa":{},"tea-tree-noosa":{}},"agnes-waters":{}},"the-gold-coast":{"duranbah-d-bah":{},"mantra-coolangatta-beach-hotel":{},"komune-gold-coast":{}}},"new-south-wales":{"sydney-northern-beaches":{"manly":{"deadmans":{},"queenscliff-manly-beach":{},"boardrider-backpacker-and-budget-motel":{}},"curl-curl":{},"north-narrabeen":{}},"newcastle":{"bar-beach":{}},"central-coast":{"forresters-lefts":{}},"south-coast":{"mystics":{},"shallows":{},"guillotines":{},"black-rock-aussie-pipe":{}},"byron-bay":{"boulder-beach":{}},"coffs-harbour-to-iluka":{"woolgoolga-beach":{}}},"west-australia":{"south-west-australia":{"perth":{"trigg-point":{}}}},"dunes-surfers-beach":{}},"north-america":{"california":{"california-south":{"ventura-county":{"ventura-west":{"rincon-point":{},"california-street-c-street":{},"san-buenaventura-state-beach":{},"santa-clara-rivermouth":{},"mcgrath-state-beach-to-oxnard-shores":{}},"ventura-east":{"ventura-overhead":{}}},"santa-barbara-county":{"santa-barbara-north":{"santa-maria-rivermouth":{}},"santa-barbara-west":{"el-capitan-state-beach":{},"isla-vista":{}}},"san-diego-county":{"la-jolla":{"big-rock":{},"simmons-reef":{},"tourmaline":{},"cortez-bank":{},"little-point":{}},"trestles-to-trails":{"cottons-point":{},"church":{},"san-onofre-state-beach":{}},"oceanside-to-encinitas":{"terra-mar":{},"carlsbad-city-beach":{},"tamarack":{},"moonlight-beach":{},"d-street":{},"pipes":{},"georges":{},"stone-steps":{},"sandbox":{}},"south-san-diego-county":{"del-mar-rivermouth":{},"del-mar-beach":{},"15th-street":{},"south-del-mar":{},"coronado-city-beach":{}}},"los-angeles-county":{"north-los-angeles-county":{"secos":{},"trancas-point":{}},"palos-verdes":{"topaz-street":{},"sapphire-street":{},"abalone-cove-beach":{},"royal-palms-state-beach":{},"indicator":{}},"south-bay":{"rat-beach":{},"santa-monica-jetties":{},"rose-avenue":{},"toes-over":{},"ballona-creek":{},"d-w":{}}},"orange-county":{"orange-county-south":{"san-gabriel-rivermouth":{},"huntington-state-beach":{},"san-clemente-state-park":{},"huntington-pier-southside":{}},"upper-trestles":{},"huntington-pier-northside":{},"orange-county-north":{"newport-point":{}}}},"california-north":{"humboldt-county-north":{"samoa-peninsula":{},"mad-river-beach":{},"trinidad-state-beach":{},"camel-rock":{},"little-river-state-beach":{},"the-lagoons":{},"bunkers":{},"harbor-entrance":{},"table-bluff-county-park":{},"centreville-beach":{},"cape-mendocino":{},"deadmans-2":{},"third-reef":{},"no-pass":{}},"del-norte-county":{"point-st-george":{},"whaler-island":{},"enderts-beach":{},"wilson-creek":{},"klamath-rivermouth":{},"gold-bluffs-beach":{}},"sonoma-county":{"the-fort":{},"timber-cove":{},"doran-beach":{},"goat-rock":{},"russian-rivermouth":{},"mystos":{}},"mendocino-county":{"dehaven-creek":{},"seaside-creek":{},"ward-ave-beach":{},"chadbourne-gulch":{},"caspar-beach":{},"big-rivermouth":{},"navarro-rivermouth":{},"alder-creek":{},"schooner-gulch-moat-creek":{},"gualala":{}},"marin-county":{"drakes-estero":{},"point-reyes-beach":{}}},"california-central":{"monterey-county":{"lovers-point":{},"asilomar-state-beach":{},"willow-creek":{},"spanish-bay-south-moss-beach":{},"ghost-trees":{},"del-monte-beach":{},"marina-state-beach":{},"salinas-river-state-beach":{},"zmudowski-state-beach":{}},"san-luis-obispo-north":{"arroyo-laguna":{},"san-simeon-creek":{},"leffingwell-landing":{},"santa-rosa-creek":{},"hazard-canyon":{},"saint-annes":{},"the-pit":{},"spooners-cove":{},"lighthouse":{},"exotics":{},"studio-drive":{}},"santa-cruz-town-west-side":{"santa-cruz-harbor":{},"sunset-state-beach":{},"beer-can-beach":{},"26th-avenue":{},"the-rivermouth":{},"mitchells-cove":{},"swift-street":{}},"santa-cruz-county-north":{"stockton-avenue":{},"natural-bridges-state-beach":{},"laguna-creek":{}},"san-mateo-county-south":{"ano-nuevo-state-reserve":{},"gazos-creek":{},"bean-hollow-state-beach":{},"pescadero-state-beach":{},"pomponio-state-beach":{},"montara-state-beach":{}}}},"new-england":{"rhode-island":{"rhode-island-east":{"2nd-beach-sachuest":{},"1st-beach-eastons-beach":{},"ruggles":{}},"rhode-island-west":{"block-island":{}}},"new-hampshire":{"seabrook-beach":{},"rye-rocks":{},"jenness-beach":{},"the-wall":{},"hampton-beach":{}},"massachusetts":{"massachusetts-south":{"rexhame":{}}},"maine":{"maine-south":{"wells-beach":{}},"maine-north":{"reid-state-park":{},"popham-beach":{},"old-orchard-beach":{},"kennebunk-beach":{},"higgins-beach":{}}}},"florida":{"florida-east-coast":{"flagler-and-volusia-counties":{"daytona-beach":{},"sunglow-pier":{},"ponce-inlet-new-smyrna":{},"flagler-pier":{}},"indian-river-st-lucie-and-martin-counties":{"hobe-sound":{},"jensen-beach":{},"sebastian-inlet":{},"fort-pierce-north-jetty":{}},"martin-co-southpalm-beach-co-north":{"reef-road":{},"coral-cove-park":{}},"palm-beach-county-south":{"delray-beach":{},"juno-beach":{},"lake-worth-pier":{},"lantana":{}},"broward-and-dade-counties":{"deerfield-beach":{},"south-beach-3":{}},"brevard-county":{"pelican-beach-park":{},"satellite-beach":{},"spanish-house":{},"melbourne-beach":{},"jetty-park":{},"canova-beach":{}},"nassau-duval-and-st-johns-counties":{"ponte-vedra":{},"matanzas-inlet":{}}},"vilano":{}},"oregon":{"north":{"cape-lookout-3":{}}},"new-jersey-new-york":{"new-york":{"long-island-east":{"georgia-east-hampton":{}}}},"great-lakes":{"lake-michigan":{"elbow-sheboygan":{},"wind-point":{}}},"alaska":{"sitka":{"sandy-beach-sitka-alaska":{},"good-rats":{},"kais-place":{},"port-mary":{},"red-tree-reef":{},"sealion-cove":{},"shoals-point":{}},"kodiak-island":{"mill-bay":{},"three-mile":{},"kodiak-fossil-beach":{}}},"canada-west":{"british-columbia":{"vancouver-island":{"jackies-hole-no-rooks":{}}}}},"africa":{"morocco":{"taghazout":{"paradis-plage":{},"anchor-point-2":{},"banana-point-2":{},"killer-point-2":{},"taghazout":{},"devils-rock-2":{}},"northern-morocco":{"ain-diab":{},"briech":{},"cap-spartel":{},"jack-beach":{},"larrache":{},"mehdya-plage":{},"moulay-bousselham":{},"oued-cherrat":{},"paloma":{},"dar-bouazza":{},"rabat":{}},"central-morocco":{"haouzia":{},"tamri-2":{},"tafedna":{},"sidi-bouzid":{},"boilers-2":{},"el-jadida":{},"el-oualidia":{},"essaouira":{},"safi-2":{},"sidi-abed":{},"imsouane-the-bay":{},"cap-sim":{}},"southern-morocco":{"agadir":{},"boats-point":{},"casamar":{},"legzira":{},"mirleft":{},"plage-blanche":{},"sidi-ifni":{},"sidi-moussa-daglou":{},"sidi-rbat":{},"tan-tan-plage":{},"tifnit":{},"yoyo":{},"tarfaya":{}}},"south-africa":{"west-coast-district":{"langberg-point":{}},"kwazulu-natal-south":{"strand":{}},"cape-peninsula":{"k-365":{}}}},"indian-ocean":{"maldives":{"vodi":{},"lohis-surf-spot":{},"cokes-surf-camp":{},"cokes-surf-spot":{},"club-med-kani-resort":{},"six-senses-laamu":{},"niyama-resort":{},"yin-yang-surf-spot":{},"horizon-ii-surf-charter":{},"ocean-oasis-surf-charter":{},"four-seasons-kuda-huraa":{},"north-male-atolls":{"cinnamon-dhonveli-maldives-surf-resort":{}},"hudhuranfushi-surf-resort":{}}},"central-america":{"mexico-baja":{"southern-baja":{"scorpion-bay":{},"punta-abreojos":{}},"central-baja":{"el-cardon":{},"punta-canoas":{},"san-miguel":{},"punta-san-jose":{},"bahia-tortugas":{},"open-doors":{},"playa-elefante":{},"puerto-san-andres":{},"punta-blanca":{},"punta-cono":{},"punta-maria":{},"punta-negra":{},"punta-sta-rosalillita":{},"la-salina":{}},"los-cabos":{"bahia-chileno":{},"cerritos":{},"costa-azul":{},"las-frailes":{},"migrino":{},"monuments":{},"nine-palms":{},"pescadero":{},"shipwrecks":{},"punta-arenas":{},"todos-santos-mainland":{}},"northern-baja":{"isla-todos-santos-killers":{},"k55-campo-lopez":{},"k58-la-fonda":{},"las-gaviotas-baja":{},"punta-camalu":{},"quatro-casas":{},"salsipuedes":{},"santo-tomas":{},"baja-malibu":{},"rosarito-beach":{},"calafia-beach":{},"k-38":{},"rauls":{},"punta-cabras":{},"cabo-san-quintin":{},"punta-san-carlos":{},"cabo-colonet":{},"k38-k38-5-k39":{},"popotla":{},"mushrooms":{},"k-40":{},"dunes":{},"halfway-house":{},"stacks":{},"k-181":{},"freighters":{},"roberts-left":{},"punta-baja":{},"3ms":{}}},"central-america-south":{"nicaragua":{"rivas-province":{"manzanillo":{},"masachapa":{},"montelimar":{},"panga-drops":{},"the-boom":{},"playa-colorado":{},"popoyo":{},"playa-maderas":{},"el-yanke":{},"playa-rosada":{},"punta-miramar":{},"tamarind":{},"playa-amarillo":{},"casares":{},"el-transito":{},"las-penitas":{},"manzanillo-rivas-province":{},"sally-anns":{},"el-astillero":{}}},"costa-rica":{"guanacaste":{"playa-del-coco":{},"playa-negra":{},"punta-pelada":{},"playa-guiones":{},"bahia-garza":{},"isla-chora":{},"playa-camaronal":{},"playa-san-miguel":{},"ollies-point-potrero-grande":{},"samara":{},"playa-carrillo":{},"playa-bejuco":{},"avellana":{},"langosta":{},"marbella":{},"nosara":{},"ostional":{},"playa-grande-guanacaste":{},"tamarindo":{},"witches-rock-playa-naranjo":{},"playa-largarto":{},"punta-guiones":{},"punta-islita-west":{},"punta-islita-reef":{},"punta-islita-east":{}},"golfo-de-nicoya":{"playa-escondida":{},"boca-tusubres":{},"cedros":{},"esterillos-oeste":{},"playa-caletas":{},"playa-carmen":{},"playa-hermosa":{},"playa-coyote":{},"boca-barranca":{},"playa-jaco":{},"playa-manzanillo":{},"playa-santa-teresa":{},"puerto-caldera":{},"punta-barigona":{},"roca-loca":{},"tivives":{}},"golfo-dulce":{"pavones":{},"backwash-golfo-dulce":{},"carate":{},"eclipse":{},"hog-hole":{},"punta-banco":{},"punta-burica":{},"zancudo":{}},"limon":{"barco-quebrado":{},"cocaine-point":{},"isla-uvita":{},"little-shoal":{},"manzanillo-limon":{},"playa-bonita":{},"playa-cocles":{},"punta-uva":{},"roca-alta":{},"salsa-brava":{},"tortuguero-beach":{},"westfalia":{}},"central-puntarenas-province":{"rio-claro-rivermouth":{},"boca-damas":{},"dominicalito":{},"drakes-bay":{},"playa-ballena":{},"playa-dominical":{},"playa-el-rey":{},"playa-hermosa-osa-peninsula":{},"playitas":{},"punta-uvita":{},"quepos-bombie":{},"quepos-jetty":{},"rio-sierpe-rivermouth":{},"herradura-la-isla":{},"playa-matapalo":{}}}},"hotel-chancletas-surf-camp":{},"mexico-pacific":{"nayarit":{"la-lancha":{},"san-pancho":{},"stoners-point":{},"hammerhead":{}},"colima-and-michoacan":{"cuyutlan":{},"rio-nexpa":{}},"west-oaxaca":{"colotepec":{},"la-punta-playa-zicatela":{},"san-augustin":{},"puerto-escondido":{}},"west-guerrero":{"barra-de-potosi":{},"la-saladita":{},"playa-linda-2":{},"troncones-point":{},"petacalco":{},"playa-boca-chica":{},"playa-troncones":{}},"east-oaxaca":{"punta-chivo":{},"la-ventosa":{}}}},"new-zealand":{"waikato":{"raglan":{}}},"wavepools":{"waco-surf":{},"urbnsurf-melbourne":{},"shizunami-surf-stadium":{},"surf-ranch":{},"the-wave-at-bristol":{},"skudin-surf-at-american-drem":{},"adventure-parc-snowdonia":{},"boa-vista-surf-village":{},"wai-kai":{},"surf-lake-yeppoon":{}},"caribbean":{"leeward-islands":{"puerto-rico":{"tres-palmas":{},"north-west-puerto-rico":{"gas-chambers":{},"bridges":{},"domes":{},"marias":{},"middles":{},"montones":{},"sandy-beach-puerto-rico":{},"surfers-beach-puerto-rico":{},"bcs":{},"crash-boat":{},"dogmans":{},"dunes-puerto-rico":{},"indicators":{},"jobos":{},"little-malibu-rincon":{},"wilderness-puerto-rico":{},"margara":{}},"puerto-rico-central-caribbean":{"aviones":{},"cochino":{},"el-unico":{},"kikita-beach":{},"la-bomba":{},"la-ocho":{},"la-pared":{},"la-selva":{},"los-tubos":{},"pine-grove":{},"tocones":{}}}}},"south-america":{"brazil-south":{"rio-de-janeiro":{"geriba":{}}},"argentina":{"mar-del-plata":{"biologia":{},"diva":{},"el-muelle":{},"escollera-sur":{},"la-paloma":{},"la-pepita":{},"la-popular":{},"las-cuevas-la-popular":{},"mariano":{},"miramar-2":{},"monte-hermoso-el-espigon":{},"paradise":{},"waikiki-mar-del-plata":{},"cabo-raso":{},"cabo-corrientes":{},"yatch":{},"luna-roja":{}}}},"the-patch":{},"san-antonio-del-mar":{}}`;
    const messages = [
      {
        role: "system",
        content: `
        Based on the following exisiting locations' hierarchy,create a URL slug for a business based on its name and location, 
        ensuring accurate hierarchical representation based on the provided data. 
        If a parent location is not provided, infer it based on existing data.
         Maintain the structure "/continent/country/region/city/business" for each business.
         For instance, a business named "business" in "Essaouira" will have a slug of "/africa/morroco/essaouira/business".
        If the lowest level is the business itself, maintain its name in a slugified format.
         If a parent location is not explicitly provided, infer it from existing data. 
         For example, for a business in "Fuerteventura" in the "Canary Islands," 
         you would use "/europe/canary-islands/fuerteventura/business-name
         Return ONLY the resultng url, no need to add sentences.

         Structure: ${structure}
          `,
      },
      {
        role: "user",
        content: `The business name is ${businessName} and it's based in ${location}`,
      },
    ];
    var data = {
      messages: messages,
      model: "gpt-4-turbo-preview",
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
    });

    const responseInJson = await response.json();
    if (!response.ok) {
      throw new Error(
        responseInJson.error
          ? responseInJson.error.code + ": " + responseInJson.error.message
          : "Something went wrong trying to connect with the OpenAI API"
      );
    }

    const parsedResponse = responseInJson["choices"][0]["message"]["content"];
    console.log(parsedResponse);
    // Since our responses are also replied as JSON strings
    return parsedResponse;
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

//
// const testData = {
//   "Trip type":"Surfing in comfort convenience",
//   "Highlights/Top Amenities": "Yoga",
//   "Accom type ": "Hostel, Villa, Rental Accommodation",
//   "Trip Type": "Learn to Surf, Surfing in Comfort and Convenience, Family Holiday",
//   "location": "Fuerteventura,Canary Island",
//   "contact_name": "Tom and Sara Perry"
// }

// generateSEOContent("7 Island Surf", testData)
//

// generateDataFromSheet();

module.exports = generateBusinessData;
