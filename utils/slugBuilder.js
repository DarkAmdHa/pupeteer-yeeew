const slugBuilder = async (businessName, location, prompt) => {
  const apiKey = process.env.OPEN_AI_API_KEY;

  try {
    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `The business name is ${businessName} and it's based in ${location}`,
      },
    ];
    var data = {
      messages: messages,
      model: "gpt-4-turbo-preview",
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
    return parsedResponse;
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};
export default slugBuilder;
