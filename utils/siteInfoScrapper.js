import regularFetch from "./regularFetch.js";

const siteInfoScrapper = async (
  link,
  prompts,
  previousData,
  scrapeImages = false
) => {
  const apiKey = process.env.OPEN_AI_API_KEY;
  try {
    const cleanedContent = await regularFetch(link, scrapeImages);
    const messages = [
      {
        role: "system",
        content: prompts.adminPrompt[0],
      },
      { role: "user", content: prompts.fullScrapperPrompt[0] + cleanedContent },
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

export default siteInfoScrapper;
