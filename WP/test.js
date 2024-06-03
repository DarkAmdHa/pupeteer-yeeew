const url = "https://yeewdev3.wpengine.com/wp-json/wp/v2/job_listing/21472";

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

const postData = await fetchData(url);
// const custom = {};
// if (postData._links && postData._links["wp:term"]) {
//   const terms = postData._links["wp:term"];
//   for (let i = 0; i < terms.length; i++) {
//     const taxonomy = terms[i].taxonomy;
//     const href = terms[i].href;
//     const data = await fetchData(href);
//     custom[taxonomy] = data;
//   }
// }
// console.log(custom);

// const body = JSON.stringify({
//   title: "SADASDASDASDAD",
//   status: "draft",
//   slug: "tavarua-island-resort",
//   link: "https://www.yeeew.com/listing/africa/south-africa/west-coast-district/cape-st-martin-reef/",
//   type: "job_listing",
//   content: "SADASDASDASDAD",
//   excerpt: "ASDASDADS",
// });

// fetch(url, {
//   method: "GET",
//   headers: headers,
//   //   body: body,
// })
//   .then((response) => response.json())
//   .then((data) => {
//     console.log("Success:", data);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

// const baseUrl = "https://www.yeeew.com/wp-json/wp/v2";
// const postId = 15332; // Replace with your post ID

// // Function to fetch data from a given endpoint
// async function fetchData(endpoint) {
//   const response = await fetch(`${baseUrl}${endpoint}`);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   return response.json();
// }

// // Function to fetch all taxonomies
// async function fetchTaxonomies() {
//   return await fetchData("/taxonomies");
// }

// // Function to fetch terms for a given taxonomy and post ID
// async function fetchTermsForTaxonomy(taxonomy, postId) {
//   return await fetchData(`/${taxonomy}?post=${postId}`);
// }

// // Function to fetch custom fields (meta data) for a given post ID
// async function fetchCustomFields(postId) {
//   return await fetchData(`/posts/${postId}/meta`);
// }

// // Main function to fetch and combine all post-related data
// async function fetchPostDetails(postId) {
//   try {
//     // Step 1: Fetch post data
//     const postData = await fetchData(`/surf-listings/${postId}`);

//     // Step 2: Fetch all taxonomies
//     const taxonomiesData = await fetchTaxonomies();

//     // Step 3: Fetch terms for each taxonomy
//     const termsData = {};
//     for (const taxonomy in taxonomiesData) {
//       termsData[taxonomy] = await fetchTermsForTaxonomy(taxonomy, postId);
//     }

//     // Step 4: Fetch custom fields (meta data)
//     const metaData = await fetchCustomFields(postId);

//     // Combine all data
//     const postDetails = {
//       postData,
//       taxonomies: termsData,
//       metaData,
//     };

//     console.log(postDetails);
//     return postDetails;
//   } catch (error) {
//     console.error("Error fetching post details:", error);
//   }
// }

// // Fetch and log the post details
// fetchPostDetails(postId);
