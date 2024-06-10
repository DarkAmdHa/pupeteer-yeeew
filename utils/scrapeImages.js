//This function will be run while the browser is open in order
//to scrape images that are above a certain threshold

export default async function scrapeImages(page) {
  const images = await page.evaluate(() => {
    const imagesArray = [];
    document.querySelectorAll("img").forEach((image, index) => {
      if (image.naturalWidth >= 1200 && index <= 20) {
        // Check image sizer
        imagesArray.push(image.src);
      }
    });
    return imagesArray;
  });
  return images;
}
