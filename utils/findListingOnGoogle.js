import communicateWithOpenAi from "./communicateWithOpenAi.js";

const findListingOnGoogle = async (businessName, platform) => {
  const prompt = `Use the following Google.com code to look for ${businessName}'s listing on ${platform}. Make sure you return the actual link. There might be ads, or similar looking pages, or reviews or other pages. We only want the listing on the ${platform}, not reviews or other pages related to it.If not found, return an error in json i.e error: "not found"`;
  const link = `https://www.google.com/search?q=${encodeURIComponent(
    businessName + " " + platform
  )}`;
  return await communicateWithOpenAi(link, prompt);
};

export default findListingOnGoogle;
