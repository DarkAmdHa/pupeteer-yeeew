function onOpen(){

  // This function adds a menu option to convert formulas to plain text. 

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Functions');
  menu.addItem('Save', 'saveAsFixedValue');
  menu.addItem('Run Demo', 'runDemo');
  menu.addItem('Fetch Data', 'fetchData');
    menu.addItem('Run All From Regional Overview', 'runRegionalOverview');
  menu.addToUi();
}

//const api = 'https://342c-2402-ad80-137-7632-38f1-50f3-f007-48ef.ngrok-free.app'
const api = 'http://18.208.128.246:3000'


function runRegionalOverview() {
 var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var regionalOverview = spreadsheet.getSheetByName("REGIONAL OVERVIEW");
  
  let lastRow = regionalOverview.getLastRow()

  let dataRange = regionalOverview.getRange(1,1, lastRow, regionalOverview.getLastColumn());
  let values = dataRange.getValues();

  var adminPrompt = spreadsheet.getRangeByName("adminPrompt").getValue()
  var fullScrapperPrompt = spreadsheet.getRangeByName("fullScrapperPrompt").getValue()
  var slugBuilderPrompt = spreadsheet.getRangeByName("slugBuilderPrompt").getValue()
  var contentGenerationPrompt = spreadsheet.getRangeByName("contentGenerationPrompt").getValue()
  var contentGenerationPromptWithJson = spreadsheet.getRangeByName("contentGenerationPromptWithJson").getValue()
  var platformDataRetreivalPrompt = spreadsheet.getRangeByName("platformDataRetreivalPrompt").getValue()


  var prompts = {
    adminPrompt,
    fullScrapperPrompt,
    slugBuilderPrompt,
    contentGenerationPrompt,
    contentGenerationPromptWithJson,
    platformDataRetreivalPrompt
  };

  for(let i=1;i<values.length;i++){
  //for(let i=1;i<2;i++){
    try{
      runUpdateOnRow(values[i], prompts, i+1,regionalOverview)
    }catch(err){
      Logger.log("ERROR: ", err)
    }
  }
}

function runUpdateOnRow(rowData,prompts,rowNumber, mainSheet){
  var payload = {
    data: rowData,
    prompts: prompts
  };

  var apiUrl = `${api}/api/data`;

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

//Scrape main site pages to collect data:
let response = UrlFetchApp.fetch(`${apiUrl}/scrape-site`, options);
let businessData;
const responseData = JSON.parse(response.getContentText())
businessData = responseData.businessData;

const moreRequests = ['/scrape-platforms', '/slug-build', '/content-generation']

console.log("Begining Scrape")

for(let i = 0;i < moreRequests.length;i++){
  //append previous data back to get subsequent data:
  payload["businessData"] = businessData;
  options.payload = JSON.stringify(payload)

//Fetch further data
  const response = UrlFetchApp.fetch(`${apiUrl}${moreRequests[i]}`, options);
  const responseData = JSON.parse(response.getContentText())
  businessData = responseData.businessData;
}
console.log("FINAL DATA ", businessData)


const {
  contact_email,
  phone_number,
  whatsapp_number,
  accomodation_type,
  trip_type,
  contact_name,
  location,
  region,
  address,
  slug,
  content,
  platformSummaries
} = businessData.data;

  const cellAndValue = {
        accomodation_type:{
        name: "accomodationType",
        value: accomodation_type
    },
        trip_type:{
        name: "tripType2",
        value: trip_type
    },

        location:{
        name: "location",
        value: location
    },
    region:{
        name: "region",
        value: region
    },
    address:{
        name: "address",
        value: address
    },
    contact_name:{
        name: "contactName",
        value: contact_name
    },
    contact_email: {
      name: "email",
      value: contact_email
    },
    phone_number: {
      name: "phoneNumber",
      value: phone_number
    },
    whatsapp_number: {
      name: "whatsappNumber",
      value: whatsapp_number
    },
    slug: {
      name: "customSlug",
      value: slug
    },
    overview: {
      name: "overview",
      value: content.overview
    },
        aboutAccomodation: {
      name: "aboutAccomodation",
      value: content.aboutAccomodation
    },
        foodInclusions: {
      name: "foodInclusions",
      value: content.foodInclusions
    },
        specificSurfSpots: {
      name: "specificSurfSpots",
      value: content.specificSurfSpots
    },
        gettingThere: {
      name: "gettingThere",
      value: content.gettingThere
    },
    faq: {
      name: "faq",
      value: JSON.stringify(content.faq)
    },
  }

let scrapedImagesArray = []
let platformContent = []
 var dataToProcess = [
  { data: platformSummaries["bookingData"], name: "booking" },
  { data: platformSummaries["tripData"], name: "trip" },
  { data: platformSummaries["expediaData"], name: "expedia" },
  { data: platformSummaries["agodaData"], name: "agoda" },
  { data: platformSummaries["trivagoData"], name: "trivago" },
  { data: platformSummaries["perfectWaveData"], name: "perfectWave" },
  { data: platformSummaries["luexData"], name: "luex" },
  { data: platformSummaries["waterWaysTravelData"], name: "waterways" },
  { data: platformSummaries["worldSurfarisData"], name: "worldSurfaris" },
  { data: platformSummaries["awaveData"], name: "awave" },
  { data: platformSummaries["atollTravelData"], name: "atollTravel" },
  { data: platformSummaries["surfHolidaysData"], name: "surfHolidays" },
  { data: platformSummaries["surflineData"], name: "surfline" },
  { data: platformSummaries["lushPalmData"], name: "lushPalm" },
  { data: platformSummaries["thermalTravelData"], name: "thermal" },
  { data: platformSummaries["bookSurfCampsData"], name: "bookSurfCamps" },
  { data: platformSummaries["nomadSurfersData"], name: "nomadSurfers" },
  { data: platformSummaries["stokedSurfAdventuresData"], name: "stokedSurfAdventures" },
  { data: platformSummaries["soulSurfTravelData"], name: "soulSurfTravel" },
  { data: platformSummaries["surfersHypeData"], name: "surfersHype" }
];

// Loop through the array and process the data
dataToProcess.forEach(function(item) {
  if (item.data) {
    cellAndValue[item.name + "DataLink"] = {
      name: item.name,
      value: item.data.link
    };
    scrapedImagesArray.push(item.data.images);
    platformContent.push({
      highlights: item.data.highlights,
      text: item.data.textContent,
      name: item.name
    })
  }
});


  Object.keys(cellAndValue).forEach(key=>{
    const item = cellAndValue[key];
    const namedRange = mainSheet.getRange(item.name);
    const cell = mainSheet.getRange(rowNumber, namedRange.getColumn())
    cell.setValue(item.value);
  })

  let imagesLinks = ""
  scrapedImagesArray.forEach(imageS3=>{
    imagesLinks += JSON.stringify(imageS3) + "\n"
  })
  mainSheet.getRange(rowNumber,mainSheet.getRange("scrapedImages").getColumn()).setValue(imagesLinks);

  let platformContentText = ""
  platformContent.forEach(item=>{
  console.log(`---- ${item.name} ---- \n ----`);
    platformContentText += `---- ${item.name} ---- \n ----`;
    platformContentText += `Highlights: ${item.highlights} \n ----`
    platformContentText += `Summary: ${item.text} \n ----`
  })
  console.log(platformContentText);
  mainSheet.getRange(rowNumber,mainSheet.getRange("platformContent").getColumn()).setValue(platformContentText);
  
  
  let errors = "";
  businessData.errors.forEach(error=>{
    errors+= error + '\n'
  })
  mainSheet.getRange(rowNumber,mainSheet.getRange("errors").getColumn()).setValue(errors);
}


function runDemo() {
 var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = spreadsheet.getActiveSheet();
  var rowNumber = activeSheet.getRange('A1').getValue();

  var rowData = activeSheet.getRange(rowNumber, 1, 1, activeSheet.getLastColumn()).getValues()[0];

 var adminPrompt = spreadsheet.getRangeByName("adminPrompt").getValue()
  var fullScrapperPrompt = spreadsheet.getRangeByName("fullScrapperPrompt").getValue()
  var slugBuilderPrompt = spreadsheet.getRangeByName("slugBuilderPrompt").getValue()
  var contentGenerationPrompt = spreadsheet.getRangeByName("contentGenerationPrompt").getValue()
  var platformDataRetreivalPrompt = spreadsheet.getRangeByName("platformDataRetreivalPrompt").getValue()


  var prompts = {
    adminPrompt,
    fullScrapperPrompt,
    slugBuilderPrompt,
    contentGenerationPrompt,
    platformDataRetreivalPrompt
  };

  var payload = {
    data: rowData,
    prompts: prompts
  };

  var apiUrl = `${api}/api/data/demo`;

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  const finalData= JSON.parse(response.getContentText())

  console.log(finalData)

  const finalContent = finalData.data.finalData;
  const platformBasedSummaries = JSON.stringify(finalData.data.platformSummaries)

  let errors = "";
  finalData.errors.forEach(error=>{
    errors+= error + '\n'
  })

  const finalContentCellIndex = 16,
        platformSummaryCellIndex = 17,
        errorCellIndex = 18;

  activeSheet.getRange(rowNumber,finalContentCellIndex).setValue(finalContent);
  activeSheet.getRange(rowNumber,platformSummaryCellIndex).setValue(platformBasedSummaries);
  activeSheet.getRange(rowNumber,errorCellIndex).setValue(errors);
}

function fetchData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = spreadsheet.getActiveSheet();
  var rowNumber = activeSheet.getRange('A1').getValue();

  var rowData = activeSheet.getRange(rowNumber, 1, 1, activeSheet.getLastColumn()).getValues()[0];

 var adminPrompt = spreadsheet.getRangeByName("adminPrompt").getValue()
  var fullScrapperPrompt = spreadsheet.getRangeByName("fullScrapperPrompt").getValue()
  var slugBuilderPrompt = spreadsheet.getRangeByName("slugBuilderPrompt").getValue()
  var contentGenerationPrompt = spreadsheet.getRangeByName("contentGenerationPrompt").getValue()
  var platformDataRetreivalPrompt = spreadsheet.getRangeByName("platformDataRetreivalPrompt").getValue()


  var prompts = {
    adminPrompt,
    fullScrapperPrompt,
    slugBuilderPrompt,
    contentGenerationPrompt,
    platformDataRetreivalPrompt
  };

  var payload = {
    data: rowData,
    prompts: prompts
  };
  var apiUrl = `${api}/api/data`;

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(apiUrl, options);

  const finalData= JSON.parse(response.getContentText())

const {
  contact_email,
  phone_number,
  whatsapp_number,
  accomodation_type,
  trip_type,
  contact_name,
  location,
  bookingData,
  tripData,
  agodaData,
  trivagoData,
  perfectWaveData,
  luexData,
  waterWaysTravelData,
  worldSurfarisData,
  awaveData,
  atollTravelData,
  surfHolidaysData,
  surflineData,
  lushPalmData,
  thermalTravelData,
  bookSurfCampsData,
  nomadSurfersData,
  stokedSurfAdventuresData,
  soulSurfTravelData,
  surfersHypeData,
  slug,content
} = finalData.businessData;

  const cellAndValue = {
      accomodation_type:{
       cell: 8,
        value: accomodation_type
    },
        trip_type:{
       cell: 10,
        value: trip_type
    },
        location:{
       cell: 18,
        value: location
    },
        contact_name:{
       cell: 23,
        value: contact_name
    },
    contact_email: {
     cell: 25,
      value: contact_email
    },
    phone_number: {
     cell: 27,
      value: phone_number
    },
    whatsapp_number: {
     cell: 29,
      value: whatsapp_number
    },
    slug: {
     cell: 30,
      value: slug
    },
    content: {
     cell: 31,
      value: content
    },
  }

let scrapedImagesArray = []
  if(bookingData){
    cellAndValue["bookingDataLink"] = {
     cell: 79,
      value: bookingData.link
    }
    scrapedImagesArray.push(bookingData.images)
    /*cellAndValue["bookingDataSummary"] = {
     cell: 101,
      value: bookingData.textContent
    }
    cellAndValue["bookingDataImages"] = {
     cell: 102,
      value: bookingData.images
    }
     cellAndValue["bookingDataHighlights"] = {
     cell: 103,
      value: bookingData.highlights
    }*/
  }
  if(tripData){
    cellAndValue["tripDataLink"] = {
     cell: 87,
      value: tripData.link
    }
    scrapedImagesArray.push(tripData.images)
    /*
    cellAndValue["tripDataSummary"] = {
     cell: 104,
      value: tripData.textContent
    }
    cellAndValue["tripDataImages"] = {
     cell: 105,
      value: tripData.images
    },
         cellAndValue["tripDataHighlights"] = {
     cell: 106,
      value: tripData.highlights
    }*/
  }

  if(agodaData){
    cellAndValue["agodaDataLink"] = {
     cell: 81,
      value: agodaData.link
    }
    scrapedImagesArray.push(agodaData.images)
  }

  if(trivagoData){
    cellAndValue["trivagoDataLink"] = {
     cell: 99,
      value: trivagoData.link
    }
    scrapedImagesArray.push(trivagoData.images)
  }


  if (perfectWaveData) {
    cellAndValue["perfectWaveDataLink"] = {
       cell: 32,
        value: perfectWaveData.link
    };
    scrapedImagesArray.push(perfectWaveData.images);
}

// luexData
if (luexData) {
    cellAndValue["luexDataLink"] = {
       cell: 35,
        value: luexData.link
    };
    scrapedImagesArray.push(luexData.images);
}

// waterWaysTravelData
if (waterWaysTravelData) {
    cellAndValue["waterWaysTravelDataLink"] = {
       cell: 38,
        value: waterWaysTravelData.link
    };
    scrapedImagesArray.push(waterWaysTravelData.images);
}

// worldSurfarisData
if (worldSurfarisData) {
    cellAndValue["worldSurfarisDataLink"] = {
       cell: 41,
        value: worldSurfarisData.link
    };
    scrapedImagesArray.push(worldSurfarisData.images);
}

if (awaveData) {
    cellAndValue["awaveDataLink"] = {
       cell: 42,
        value: awaveData.link
    };
    scrapedImagesArray.push(awaveData.images);
}
if (atollTravelData) {
    cellAndValue["atollTravelDataLink"] = {
       cell: 45,
        value: atollTravelData.link
    };
    scrapedImagesArray.push(atollTravelData.images);
}
if (surfHolidaysData) {
    cellAndValue["surfHolidaysDataLink"] = {
       cell: 48,
        value: surfHolidaysData.link
    };
    scrapedImagesArray.push(surfHolidaysData.images);
}
if (surflineData) {
    cellAndValue["surflineDataLink"] = {
       cell: 51,
        value: surflineData.link
    };
    scrapedImagesArray.push(surflineData.images);
}
if (lushPalmData) {
    cellAndValue["lushPalmDataLink"] = {
       cell: 54,
        value: lushPalmData.link
    };
    scrapedImagesArray.push(lushPalmData.images);
}
if (thermalTravelData) {
    cellAndValue["thermalTravelDataLink"] = {
       cell: 57,
        value: thermalTravelData.link
    };
    scrapedImagesArray.push(thermalTravelData.images);
}
if (bookSurfCampsData) {
    cellAndValue["bookSurfCampsDataLink"] = {
       cell: 60,
        value: bookSurfCampsData.link
    };
    scrapedImagesArray.push(bookSurfCampsData.images);
}
if (nomadSurfersData) {
    cellAndValue["nomadSurfersDataLink"] = {
       cell: 63,
        value: nomadSurfersData.link
    };
    scrapedImagesArray.push(nomadSurfersData.images);
}
if (stokedSurfAdventuresData) {
    cellAndValue["stokedSurfAdventuresDataLink"] = {
       cell: 66,
        value: stokedSurfAdventuresData.link
    };
    scrapedImagesArray.push(stokedSurfAdventuresData.images);
}
if (soulSurfTravelData) {
    cellAndValue["soulSurfTravelDataLink"] = {
       cell: 69,
        value: soulSurfTravelData.link
    };
    scrapedImagesArray.push(soulSurfTravelData.images);
}
if (surfersHypeData) {
    cellAndValue["surfersHypeDataLink"] = {
       cell: 72,
        value: surfersHypeData.link
    };
    scrapedImagesArray.push(surfersHypeData.images);
}

  
  console.log(cellAndValue)
  Object.keys(cellAndValue).forEach(key=>{
    const item = cellAndValue[key];
    activeSheet.getRange(rowNumber,item.cell).setValue(item.value);
  })

  let imagesLinks = ""
  scrapedImagesArray.forEach(imageS3=>{
    imagesLinks += JSON.stringify(imageS3) + "\n"
  })
    activeSheet.getRange(rowNumber,102).setValue(imagesLinks);

}


function saveAsFixedValue(){
  // This function prevents the API being called each time the sheet is refreshed or updated to save your API credits. 

  var ss = SpreadsheetApp.getActiveSheet()
  var data = ss.getDataRange().getValues()
  ss.getRange(1,1,data.length,data[0].length).setValues(data)
}


function openaiSlug(prompt){
// This function will use your API settings to request copy for the product/service and goal specified. 

// Gets OPENAI API key from Cell B2 of Settings sheet
var setsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
var apiKey = setsheet.getRange(2,2).getValue()


var data = {
	messages: [
      {
        role: "system",
        content: `You will refer to the following classification to classify resorts and provide a url in the format /central-america/nicaragua/sluggified-resort-name with however many locations in between as possible based on the provided array. You will be fed with the resort's name, location and any other necessary google maps api data occasionally. Only return the url, with no extra text. The classification is:
          let globalHierarchy = [...]
        `,
      },
      { role: "user", content: prompt },
    ],
     "model": "gpt-4",
    "temperature": 0.1,
    "max_tokens": 250,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "stop": ["##"]
  };

const options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data),
    'headers': {
      Authorization: 'Bearer ' + apiKey,
    },
  };

try{
 var response = UrlFetchApp.fetch(
    'https://api.openai.com/v1/chat/completions' ,
    options,
  );

  
 var article = JSON.parse(response.getContentText())['choices'][0]['message']['content'].trim()
 
  return article;  
}catch(er){
 var errorDetails = {
    name: er.name,       
    message: er.message,  
    stack: er.stack      
  };
  return JSON.stringify({ error: errorDetails });
}
}

function openaiScrape(prompt, link){

  var response = UrlFetchApp.fetch(link);
  var htmlContent = response.getContentText();

  // Regular expressions to remove various non-textual elements
  var cleanedContent = htmlContent
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
    .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, '')  
    .replace(/<!--[\s\S]*?-->/g, '')                   
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gmi, '')      
    .replace(/<[^>]*>/g, '')                            
    .replace(/(onclick|onload)="[^"]*"/gmi, '')        
    .replace(/style="[^"]*"/gmi, '')                  
    .replace(/\s+/g, ' ')                              
    .trim();                                          




  var setsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  var apiKey = setsheet.getRange(2,2).getValue()

var data = {
	messages: [
      {
        role: "system",
        content: "You will retreive data from websites",
      },
      { role: "user", content: prompt + cleanedContent },
    ],
     "model": "gpt-4",
    "temperature": 0.1,
    "max_tokens": 250,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "stop": ["##"]
  };

const options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data),
    'headers': {
      Authorization: 'Bearer ' + apiKey,
    },
  };

try{
 var response = UrlFetchApp.fetch(
    'https://api.openai.com/v1/chat/completions' ,
    options,
  );

  
 var article = JSON.parse(response.getContentText())['choices'][0]['message']['content'].trim()
 
  return article;  
}catch(er){
 var errorDetails = {
    name: er.name,       
    message: er.message,  
    stack: er.stack      
  };
  return JSON.stringify({ error: errorDetails });
}



}

function ai21(prompt){
// This function will use your API settings to request copy for the product/service and goal specified. 

// Gets AI21 API key from Cell B3 of Settings sheet
var setsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
var apiKey = setsheet.getRange(3,2).getValue()


// Exit function if no outline specified
if (prompt == "" ) {
    return prompt
}

// Make API request

var data = {

	"prompt": prompt,
    
    
    "numResults":1,
    "maxTokens":250,
    "temperature":0.7,
    "topKReturn": 0,
    "topP":1,
    "countPenalty": {
    "scale": 0,
    "applyToNumbers": false,
    "applyToPunctuations": false,
    "applyToStopwords": false,
    "applyToWhitespaces": false,
    "applyToEmojis": false
  },
  "frequencyPenalty": {
    "scale": 225,
    "applyToNumbers": false,
    "applyToPunctuations": false,
    "applyToStopwords": false,
    "applyToWhitespaces": false,
    "applyToEmojis": false
  },
  "presencePenalty": {
    "scale": 1.2,
    "applyToNumbers": false,
    "applyToPunctuations": false,
    "applyToStopwords": false,
    "applyToWhitespaces": false,
    "applyToEmojis": false
  },
  "stopSequences":["##"]
  };

   var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data),
    'headers': {
      Authorization: 'Bearer ' + apiKey,
    },
  };
  var response = UrlFetchApp.fetch(
    'https://api.ai21.com/studio/v1/j1-jumbo/complete',
    options,
  );
    
  
 var article = JSON.parse(response.getContentText())['completions'][0]['data']['text'].trim()
 
return article
}
