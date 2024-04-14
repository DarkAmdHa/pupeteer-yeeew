const express = require("express");
require("dotenv").config();
const app = express();

app.use(express.json());

const generateBusinessData = require("./pupeteer-openai.js");

app.post("/getData", async (req, res) => {
  const businessName = req.body[0];
  const businessLink = req.body[1];

  const businessData = await generateBusinessData(businessLink, businessName);
  console.log(businessData);
  res.json({ businessData });
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
