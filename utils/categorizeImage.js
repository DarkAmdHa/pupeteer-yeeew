import vision from "@google-cloud/vision";
import { categorizationLabels } from "../constants.js";

const categorizeImage = async (filePath) => {
  const client = new vision.ImageAnnotatorClient({
    keyFilename: "./keys/cloudVisionkey.json",
  });
  const [result] = await client.labelDetection(filePath);
  const imageLabels = result.labelAnnotations;

  const label = Object.keys(categorizationLabels).find((key) => {
    const category = categorizationLabels[key];
    return category.find((catLabel) => {
      const foundLabel = imageLabels.find(
        (imgLabel) =>
          imgLabel.description.toLowerCase() === catLabel.toLowerCase()
      );
      if (foundLabel) return true;
    });
  });

  const returningLabel = label ? label : "others";
  return returningLabel;
};
export default categorizeImage;
