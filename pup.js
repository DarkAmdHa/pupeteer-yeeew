import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-GB,en;q=0.9",
    "cache-control": "max-age=0",
    "if-none-match": '"33b8d-s7De4i5NPsZKZJ335/x1uyYvu2I"',
    "sec-ch-ua":
      '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
  });

  await page.goto(
    "https://www.tripadvisor.com/Hotel_Review-g308255-d590913-Reviews-Funky_Fish_Beach_Surf_Resort-Malolo_Island_Mamanuca_Islands.html",
    { waitUntil: "networkidle2" }
  );

  // Further actions on the page can be performed here

  await new Promise((resolve) => {
    setTimeout(() => resolve, 5000);
  });
  await browser.close();
})();
