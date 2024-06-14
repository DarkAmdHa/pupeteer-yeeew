import fetchRelevantGoogleLinks from "./fetchRelevantGoogleLinks.js";
import puppeteerLoadFetch from "./puppeteerLoadFetch.js";
import regularOpenAi from "./regularOpenAi.js";

const generateSEOContentWithGoogle = async (
  data,
  prompt,
  returnAsJson = false
) => {
  //Get relevant google data:
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    data.data.business_name + " " + "site:yeeew.com"
  )}`;
  const links = await fetchRelevantGoogleLinks(googleUrl, 4);

  //Fetch each link:
  const relevantLinks = [];
  for (let i = 0; i < links.length; i++) {
    // const linkData = await regularFetch(links[i]);
    try {
      const result = await puppeteerLoadFetch(links[i], true);
      const linkData = result.sanitizedData;
      relevantLinks.push({
        link: links[i],
        linkHTML: linkData,
      });
    } catch (error) {
      console.log(`Error while accessing ${links[i]} : ${error}`);
    }
  }

  //This prompt needs to be filled with data:
  let prompt2 = prompt;
  prompt2 = prompt2.replace("{{ businessData }}", JSON.stringify(data));
  prompt2 = prompt2.replace(
    "{{ relevantLinks }}",
    JSON.stringify(relevantLinks)
  );

  const content = await regularOpenAi("", prompt2, returnAsJson);
  return content;
};

export default generateSEOContentWithGoogle;
