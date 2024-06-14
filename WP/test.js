const url = "https://yeewdev3.wpengine.com/wp-json/wp/v2/job_listing/21520";

// Function to fetch data from a given endpoint
async function fetchData(url) {
  const login = "chris";
  const password = "4mjY F8I8 hSY7 M71p VVSk OIAf";

  const headers = new Headers();
  headers.set("Authorization", "Basic " + btoa(`${login}:${password}`));
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    headers: headers,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Function to fetch data from a given endpoint
async function editData(url, body) {
  const login = "chris";
  const password = "4mjY F8I8 hSY7 M71p VVSk OIAf";

  const headers = new Headers();
  headers.set("Authorization", "Basic " + btoa(`${login}:${password}`));
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const re = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

const trip_type_taxonomies = [60, 59, 65, 66, 61, 62, 63, 64];
const accommodation_type_taxonomies = [54, 55, 58, 281, 56, 57];
const job_listing_type_taxonomies = [193, 115];

var acfData = {
  meta: {
    _job_location: "ADS",
    geolocation_lat: "ASDnull",
    geolocation_long: "asdsad",
  },
}

const postData = await editData(url, acfData);
// const postData = await fetchData(url);

console.log(postData);
