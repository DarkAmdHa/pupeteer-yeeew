import fs from "fs";
import request from "request";

export const downloadImgToLocal = async function (url, fileName) {
  return new Promise((resolve, reject) => {
    request.head(url, function (err, res, body) {
      if (err) {
        reject(err);
      } else {
        const writeImage = fs.createWriteStream(fileName);
        writeImage.on("finish", resolve);
        writeImage.on("error", reject);
        request(url).pipe(writeImage);
      }
    });
  });
};

export const deleteImgFromLocal = async function (filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`${filePath} was deleted`.green);
        resolve();
      }
    });
  });
};
