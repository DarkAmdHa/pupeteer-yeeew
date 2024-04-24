import AWS from "aws-sdk";
import axios from "axios";
import path from "path";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";
dotenv.config();

import { downloadImgToLocal, deleteImgFromLocal } from "./tempStorage.js";
import categorizeImage from "./categorizeImage.js";

const saveImagesToS3 = async (images, businessSlug) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const bucketName = process.env.S3_BUCKET_NAME;
  const folderName = businessSlug; // Change this to your desired folder name

  const uploadedImageLocations = [];

  // Loop through each image URL
  for (const imageUrl of images) {
    try {
      // Remove query parameters from URL
      const cleanImageUrl = imageUrl.split("?")[0];

      // Download the image from the URL
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const imageData = Buffer.from(response.data, "binary");

      // Extract the file extension from the URL
      const fileExtension = path.extname(cleanImageUrl);

      /****Detect Image Labels With Cloud Vision API: */
      const tempFilePath = `./temp/file_${new Date().getTime()}${fileExtension}`;
      let imageLabel;

      try {
        // await downloadImgToLocal(imageUrl, tempFilePath);
        //Save file locally for processing, and delete afterwards:
        await writeFile(tempFilePath, imageData);
        imageLabel = await categorizeImage(tempFilePath);
        await deleteImgFromLocal(tempFilePath);
      } catch (error) {
        console.error("Error:", error);
      }

      // Set the S3 parameters
      const params = {
        Bucket: bucketName,
        Key: `${folderName}/${imageLabel}/${Date.now()}_image${fileExtension}`, // Use a unique key for the image file
        Body: imageData,
      };

      // Upload the image file to S3
      const uploadResult = await s3.upload(params).promise();
      console.log(
        `File uploaded successfully. Location:${uploadResult.Location}`.green
      );
      uploadedImageLocations.push(uploadResult.Location); // Add the upload location to the array
    } catch (error) {
      console.error(`Error uploading file:${error}`.red);
    }
  }

  return uploadedImageLocations; // Return the array of uploaded image locations
};

export default saveImagesToS3;
