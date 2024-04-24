import vision from "@google-cloud/vision";
import fs from "fs";
import request from "request";
import { categorizationLabels } from "../constants.js";

const downloadImgToLocal = function (url, fileName, callback) {
  request.head(url, function (err, res, body) {
    request(url).pipe(fs.createWriteStream(fileName)).on("close", callback);
  });
};

const deleteImgFromLocal = async function (filePath) {
  fs.unlink(filePath, (err) => {
    if (err) throw err;
    console.log("path/file.txt was deleted");
  });
};

async function quickstart() {
  const filePath = `./tests/file_${new Date().getTime()}.png`;
  downloadImgToLocal(
    "https://www.google.com/images/srpr/logo3w.png",
    filePath,
    async function () {
      console.log("done");
      const label = await getLabel(filePath);
      await deleteImgFromLocal(filePath);
    }
  );
}

const getLabel = async (filePath) => {
  const client = new vision.ImageAnnotatorClient({
    keyFilename: "./tests/cloudVisionkey.json",
  });
  const [result] = await client.labelDetection(filePath);
  const imageLabels = result.labelAnnotations;

  const label = imageLabels.find((label) => {
    let foundLabel;
    Object.keys(categorizationLabels).forEach((key) => {
      if (!foundLabel)
        foundLabel = categorizationLabels[key].find(
          (l) => l.toLowerCase() === label.description.toLowerCase()
        );
    });
    return foundLabel;
  });

  const returningLabel = label ? label.description.toLowerCase() : "others";
  return returningLabel;
};

quickstart();
