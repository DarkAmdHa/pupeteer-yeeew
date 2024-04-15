import openAiWithPrompts from "./openAiWithPrompts.js";

async function listingScrape(platformName, businessName, listingCode, prompts) {
  //Get summary from chatgpt of the result:
  let listingPrompt = prompts.platformDataRetreivalPrompt;

  listingPrompt = listingPrompt.replace("{{ platformName }}", platformName);
  listingPrompt = listingPrompt.replace("{{ businessName }}", businessName);
  listingPrompt = listingPrompt.replace("{{ businessData }}", listingCode);

  const messages = [
    {
      role: "system",
      content: `
          You will go through a provided code and look for the requested data.
          If the data is found, return a JSON response with data in 
          {data: FOUND DATA HERE}
          If instead the data is nowhere to be found, write a nice message saying something like "The email could not be found on this site (Or something along those line) in JSON as 
          {error: YOU RESPONSE HERE}
          Only reply in the above fashion.
        `,
    },
    { role: "user", content: listingPrompt },
  ];
  const response = await openAiWithPrompts(messages);
  return JSON.parse(response);
}

export default listingScrape;
