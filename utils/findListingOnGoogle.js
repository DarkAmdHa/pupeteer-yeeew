import communicateWithOpenAi from "./communicateWithOpenAi.js";

const findListingOnGoogle = async (businessName, platform) => {
  const prompt = `Use the following Google.com code to look for ${businessName}'s listing on ${platform}. Make sure you return the actual link if it only partains to the platform ${platform}. There might be ads, or similar looking pages, or even the business' main site, or reviews or other pages but these should all be ignored. We only want the listing of ${businessName} on the ${platform}, not reviews or other pages related to the business.If such a listing is not found in the provided code, return an error in json i.e error: "not found"`;
  const link = `https://www.google.com/search?q=${encodeURIComponent(
    businessName + " " + platform
  )}`;
  return await communicateWithOpenAi(link, prompt);
};

export default findListingOnGoogle;
