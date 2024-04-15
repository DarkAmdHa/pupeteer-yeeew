// Import the axios library
import axios from "axios";

// Define your API key
const apiKey = "AIzaSyAay3qv5mTLHKE9y52Ut6vlpU7VF1sMf78"; // Replace 'YOUR_API_KEY_HERE' with your actual API key

// Define the request body
const requestBody = {
  requests: [
    {
      // Define your AnnotateImageRequest object here
      // For example:
      image: { source: { imageUri: "https://picsum.photos/500" } },
      features: [{ type: "LABEL_DETECTION" }, { type: "TEXT_DETECTION" }],
    },
  ],
};

// Make the HTTP request
axios
  .post(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    requestBody
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  });
