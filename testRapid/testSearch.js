import axios from "axios";

if (process.argv.length < 3) {
  console.error("Please provide a hotel name argument ");
  process.exit(1);
}

const hotelName = process.argv[3];

const options = {
  method: "GET",
  url: "https://booking-com.p.rapidapi.com/v1/hotels/locations",
  params: {
    name: hotelName,
    locale: "en-gb",
  },
  headers: {
    "X-RapidAPI-Key": "63f8fe4b41mshbf40e25981cf3d1p1962dejsnc4a1628cb080",
    "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
  },
};

try {
  const response = await axios.request(options);
  console.log(response.data);
} catch (error) {
  console.error(error);
}
