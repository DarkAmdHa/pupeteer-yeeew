import siteInfoScrapper from "./siteInfoScrapper.js";
const twoWayComm = async (link, prompts) => {
  const maxIterations = +process.env.MAX_CRAWL_ITERATIONS || 6;
  let iteration = 1;
  const visitedLinks = [];

  let response = await siteInfoScrapper(link, prompts, undefined, false);
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
      prompts,
      previousData,
      false
    );
    visitedLinks.push(response.nextLink);
  }

  console.log(response);
  return response.data;
};

export default twoWayComm;