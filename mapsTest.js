const axios = require("axios");

// Your Google Maps API key
const apiKey = "AIzaSyBatIoikNOYTXT-1PSAuffasP6sqoYd0mU";

// Address or location to search for
const address = "1600 Amphitheatre Parkway, Mountain View, CA";

// Google Maps Geocoding API endpoint
const geocodingEndpoint = "https://maps.googleapis.com/maps/api/geocode/json";

// Function to fetch geocode data
async function fetchGeocodeData(address) {
  try {
    const response = await axios.get(geocodingEndpoint, {
      params: {
        address: address,
        key: apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    const geocodeData = await fetchGeocodeData(address);
    console.log("Geocode data:", geocodeData);
    // You can parse the data here and use it as needed
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
