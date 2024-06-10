import axios from "axios";
export default async function fetchGeocodeData(address) {
  const apiKey = process.env.GEOCODE_API_KEY;
  const geocodingEndpoint = "https://maps.googleapis.com/maps/api/geocode/json";

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
