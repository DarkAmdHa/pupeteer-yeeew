import sanitizeHTML from "./sanitizeHTML.js";

const regularFetch = async (link) => {
  let response;
  try {
    // const scraperAPIUrl = "https://api.scraperapi.com/?api_key=fe563d2e2531c760d454cbc530b12f96&url=" + encodeURIComponent(link);
    const scraperAPIUrl = link;
    response = await fetch(scraperAPIUrl);

    let htmlContent = await response.text();

    return sanitizeHTML(htmlContent);
  } catch (e) {
    console.log(`Issue with URL ${link}: ${e.message}`.red);
    throw new Error(
      "Link " + link + " not valid or not reachable: " + e.message
    );
  }
};

export default regularFetch;
