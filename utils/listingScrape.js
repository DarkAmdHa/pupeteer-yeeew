import openAiWithPrompts from "./openAiWithPrompts.js";

async function listingScrape(
  platformName,
  businessName,
  listingCode,
  prompts,
  prompt = ""
) {
  //Get summary from chatgpt of the result:
  let listingPrompt;
  if (prompt != "") listingPrompt = prompt;
  else listingPrompt = prompts.platformDataRetreivalPrompt;

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

  if (platformName == "Booking.com") {
    messages.push({
      role: "user",
      content: `Given that this is a booking.com listing, we also need the business' room types details as well as it's property surroundings and all amenities.
      The data needs to be returned in a specific way assuming it figures on the page. With regard to these three specific fields, please do not assume anything. Only reflect data that already figures on the page. 
      For the room type, within the data field, return the a 'rooms' key containing an array of objects of the format 
      [
        {
            "roomName":"string",
            "maxOccupancy": "string",
            "priceWhenScraped":"string",
            "roomFacilities": ["string","string"]
        },
        {
            "roomName":"string",
            "maxOccupancy": "string",
            "priceWhenScraped":"string",
            "roomFacilities": ["string","string"]
        },
      ]

      Property surroundings need to be returned as a key called 'surroundings' which will be an array having the format: 
        [
          {
              "surroundingType": "string",
              "suroundings": [
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  },
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  }
              ]
          },
          {
              "surroundingType": "string",
              "suroundings": [
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  },
                  {
                      "type": "string",
                      "name": "string",
                      "distance": "string"
                  }
              ]
          }
      ]

      And the property amenities need to be returned as the key "amenities" which will also be an array of amenities in the format:
      [
        {
            type: "string",
            amenities: ["string", "string"]
        },
        {
            type: "string",
            amenities: ["string", "string"]
        },
      ]
      `,
    });
  }
  const response = await openAiWithPrompts(messages);
  return JSON.parse(response);
}

export default listingScrape;
