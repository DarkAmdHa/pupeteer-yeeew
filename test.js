const puppeteer = require("puppeteer");
(async () => {
  console.log("Starting Browser");
  const newBrowser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });
  console.log("Browser Started");

  const page = await newBrowser.newPage();
  await page.goto("https://google.com");

  page.screenshot({ path: "photo.png" });
  console.log("finished");
})();
