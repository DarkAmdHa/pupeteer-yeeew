import pt from "puppeteer";

const fetchRelevantGoogleLinks = async (link, max) => {
  const browser = await pt.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 500 });

  await page.goto(link);

  const links = await page.$$eval(`a[href^="https://www.yeeew.com/"]`, (as) =>
    as.map((a) => a.href)
  );
  await browser.close();

  console.log(`Relevant Yeew Links:${links}`.green);

  return links.slice(0, max);
};
export default fetchRelevantGoogleLinks;
