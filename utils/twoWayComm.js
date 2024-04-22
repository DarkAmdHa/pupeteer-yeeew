import siteInfoScrapper from "./siteInfoScrapper.js";
const twoWayComm = async (link, prompts) => {
  const maxIterations = +process.env.MAX_CRAWL_ITERATIONS || 6;
  let iteration = 1;
  const visitedLinks = [];

  let response = await siteInfoScrapper(link, prompts, undefined, false);
  console.log(`Scraped ${link}`.green);
  visitedLinks.push(link);
  while (
    response.nextLink &&
    response.nextLink != "" &&
    iteration < maxIterations
  ) {
    iteration++;
    const previousData = { previousReturnedData: response.data, visitedLinks };
    console.log(`Scraping Next Link: ${response.nextLink}`.green);
    response = await siteInfoScrapper(
      response.nextLink,
      prompts,
      previousData,
      false
    );
    visitedLinks.push(response.nextLink);
  }

  console.log(`Final Data after scraping site: ${JSON.stringify(response)}`.green);
  return response.data;
};

export default twoWayComm;
