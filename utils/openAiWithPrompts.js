const openAiWithPrompts = async (messages) => {
  const apiKey = process.env.OPEN_AI_API_KEY;
  try {
    var data = {
      messages: messages,
      // model: "gpt-4-turbo-preview",
      model: "gpt-4o",
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
    return parsedResponse;
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

export default openAiWithPrompts;
