// Constants - Replace with your values for the doc you're using.
const API_KEY = 'your gemini api key'; 
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+API_KEY; 
const SHEET_ID = 'get sheetid from url';
const SHEET_NAME = 'Sheet1';
const PROMPT_COLUMN = '3'; 
const RESPONSE_COLUMN = '4'; 

function callGeminiProAPI(prompt) {
    Logger.log("callGeminiAi prompt: ", prompt);
    var messages = {
        "contents": [
            {
                "parts": [
                    {"text": "You are an engineer working at Splunk. You are responding to a request for proposal and need to answer yes or no along with an explanation."}, //set the context and instruction
                    {"text": "Does your product have the ability to monitor VMs?"}, //example question
                    {"text": "Yes. Splunk can monitor server performance and events and gather all kinds of logs on virtual machines."}, //example answer
                    {"text": prompt}
                ]
            }
        ]
    }

    var payload = messages;

    var params = {
        "method": "post",
        "headers": {
        "Content-Type": "application/json"
        },
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
    };
    
    // Get the response
    var response = UrlFetchApp.fetch(GEMINI_API_ENDPOINT, params);

    // Extract the text from the response (Assuming a JSON response)
    var responseText = response.getContentText(); // Get the response as a text string
    var response_data = JSON.parse(response); // Parse the JSON string
    var text = response_data.candidates[0].content.parts[0].text;

    return text;
}
// Read prompts from a specific column in the sheet
function readPromptsFromSheet(sheetId, sheetName, columnName) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(columnName + "1:" + columnName + lastRow);
  return range.getValues();
}

// Write prompts to a specific column in the sheet
function writeResponseToSheet(response, sheetId, sheetName, responseColumn, row) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  sheet.getRange(responseColumn + row).setValue(response);
}

// Main execution function
function useGeminiOnSpreadsheet() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getActiveSheet();
  var dataRange = sheet.getDataRange(); // Get entire data range 
  var lastRow = dataRange.getLastRow();

  for (var row = 2; row <= lastRow; row++) {
    var inputText = sheet.getRange(row, PROMPT_COLUMN).getValue();

    // Call the Gemini Pro API function
    var geminiResponse = callGeminiProAPI(inputText, API_KEY); 

    // Set the response
    sheet.getRange(row, RESPONSE_COLUMN).setValue(geminiResponse); 
  }
}

// Custom Menu Setup
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Gemini Actions')
      .addItem('Generate Responses', 'useGeminiOnSpreadsheet')
      .addToUi();
}

//add functionality for API key, prompt instructions and example Q&A to to UI