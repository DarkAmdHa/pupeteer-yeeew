const express = require("express");
require("dotenv").config();
const app = express();

app.use(express.json());

app.post("/getData", (req, res) => {
  console.log(req.body);
  const apiKey = process.env.OPEN_AI_API_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = "Sheet1";
  res.end();
});

app.get("/", (req, res) => {
  console.log("Fetched");
  res.json({
    message: "Success",
  });
});

app.listen(3000, () => {
  console.log("sd");
});
