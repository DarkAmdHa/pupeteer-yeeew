function onOpen(){

  // This function adds a menu option to convert formulas to plain text. 

  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Functions');
  menu.addItem('Save', 'saveAsFixedValue');
  menu.addItem('Run Demo', 'runDemo');
  menu.addItem('Fetch Data', 'fetchData');
  menu.addToUi();
}

//const api = 'https://b52f-223-123-16-85.ngrok-free.app'+
const api = 'http://54.196.10.137:3000'

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

  const {contact_email,phone_number,whatsapp_number,accomodation_type,trip_type,contact_name,location,bookingData,tripData,trivagoData,slug,content} = finalData.businessData;

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

  if(bookingData){
    cellAndValue["bookingDataLink"] = {
      cell: 79,
      value: bookingData.link
    }
    cellAndValue["bookingDataSummary"] = {
      cell: 101,
      value: bookingData.textContent
    }
    cellAndValue["bookingDataImages"] = {
      cell: 102,
      value: bookingData.images
    }
     cellAndValue["bookingDataImages"] = {
      cell: 102,
      value: bookingData.images
    }
     cellAndValue["bookingDataHighlights"] = {
      cell: 103,
      value: bookingData.highlights
    }
  }
  if(tripData){
    cellAndValue["tripDataLink"] = {
      cell: 87,
      value: tripData.link
    }
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
    }
  }
/*
  if(trivagoData){
    cellAndValue["trivagoDataLink"] = {
      cell: 87,
      value: trivagoData.link
    }
    cellAndValue["trivagoDataSummary"] = {
      cell: 104,
      value: trivagoData.textContent
    }
    cellAndValue["trivagoDataImages"] = {
      cell: 105,
      value: trivagoData.images
    },
         cellAndValue["trivagoDataHighlights"] = {
      cell: 106,
      value: trivagoData.highlights
    }
  }*/
  console.log(cellAndValue)
  Object.keys(cellAndValue).forEach(key=>{
    const item = cellAndValue[key];
    activeSheet.getRange(rowNumber,item.cell).setValue(item.value);
  })
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
