import puppeteerLoadFetch from "./puppeteerLoadFetch.js";

const communicateWithOpenAi = async (link, prompt) => {
  const apiKey = process.env.OPEN_AI_API_KEY;
  try {
    const result = await puppeteerLoadFetch(link, true);

    const cleanedContent = result.sanitizedData;
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
    console.log(`Open AI Response: ${parsedResponse}`.green);
    // Since our responses are also replied as JSON strings
    return JSON.parse(parsedResponse);
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

export default communicateWithOpenAi;
