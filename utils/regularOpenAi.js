import regularFetch from "./regularFetch.js";

const regularOpenAi = async (link, prompt, returnAsJson = false) => {
  const apiKey = process.env.OPEN_AI_API_KEY;
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

    if (returnAsJson) data["response_format"] = { type: "json_object" };

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
    console.log(`Open AI Response: ${parsedResponse}`.green);
    // Since our responses are also replied as JSON strings
    return parsedResponse;
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

export default regularOpenAi;
