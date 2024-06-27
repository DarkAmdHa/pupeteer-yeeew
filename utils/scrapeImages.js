//This function will be run while the browser is open in order
//to scrape images that are above a certain threshold

const scrapeImagesFromBooking = async (page) => {
  const bookingImages = await page.evaluate(() => {
    const imagesArr = [];
    document.querySelector(".bh-photo-grid img").click();
    document
      .querySelectorAll(".bh-photo-modal .bh-photo-modal-grid-item-wrapper")
      .forEach((a,index) => {
        a.click();
        const activeImg = document.querySelector(
          ".bh-photo-modal-image-element img"
        ).src;
        //Max 15 images:
        if(index<15)
          imagesArr.push(activeImg);
      });

    return imagesArr;
  });
  return bookingImages;
};

export default async function scrapeImages(page, customPlatform = "") {
  let images;
  if (customPlatform === "booking") {
    images = await scrapeImagesFromBooking(page);
  } else {
    images = await page.evaluate(() => {
      const imagesArray = [];
      document.querySelectorAll("img").forEach((image, index) => {
        if (image.naturalWidth >= 1200 && index <= 20) {
          // Check image sizer
          imagesArray.push(image.src);
        }
      });
      return imagesArray;
    });
  }
  return images;
}
