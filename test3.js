const openAiWithPrompts = async (messages) => {
  const apiKey = process.env.OPEN_AI_API_KEY;
  try {
    var data = {
      messages: messages,
      // model: "gpt-4-turbo-preview",
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
    });

    const responseInJson = await response.json();
    if (!response.ok) {
      throw new Error(
        responseInJson.error
          ? responseInJson.error.code + ": " + responseInJson.error.message
          : "Something went wrong trying to connect with the OpenAI API"
      );
    }

    const parsedResponse = responseInJson["choices"][0]["message"]["content"];
    console.log(parsedResponse);
    // Since our responses are also replied as JSON strings
    return parsedResponse;
  } catch (er) {
    throw new Error(er.message + er.stack);
  }
};

let bookingPrompt = `Use the following content of a {{ platformName }} listing, to get all information and make a summary about the business {{ businessName }}. Make sure to also return the Highlights/Top Amenities of this business. This could be specifically listed on the page. If so, return that as well. The final response should be a JSON, looking like: { highlights: "", summary: ""}. If highlights are not found, return an empty string.  Here is the content of the listing: {{ businessData }}`;

bookingPrompt = bookingPrompt.replace("{{ platformName }}", "Booking.com");
bookingPrompt = bookingPrompt.replace("{{ businessName }}", "99 Surf Lodge");
bookingPrompt = bookingPrompt.replace(
  "{{ businessData }}",
  `"Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#basiclayout Skip to main content
  Link: https://www.booking.com/index.html
  
  USD
  
  
  Link: https://secure.booking.com/help.en-us.html
  Link: https://join.booking.com/?utm_source=topbar List your property Link: https://account.booking.com/auth/oauth2?client_id=vO1Kblk7xX9tUn2cpZLS&redirect_uri=https%3A%2F%2Fsecure.booking.com%2Flogin.html%3Fop%3Doauth_return&response_type=code&lang=en-us&aid=304142&bkng_action=hotel&prompt=signin&state=Us4BOGnDijWXtatEXOfmDLUebVM-Js4Km1Yemt4omDzLebhSE3GCRntKCzLXnzeg_f6ct5OOyUM9IKefXreDb18iIMNXn6Q3cdY7b5EvVTyB8Q_C44bdgChNslXlFzLbADfhiaNd2OtH_2LjdX__EOnQ-lh3iwVKndGU7CAUG8NTN3E2FnyqScijXsbzDrBIR-1l5JvR8U27gAnfg0My0GSczYZNoqahGaEMKX3meH16zs_Kat5Hgs3o6kcT8AjCCERVJYodGK6xGBV8lisNXXI%3D*eyJpZCI6InRyYXZlbGxlcl9oZWFkZXIifQ%3D%3D Register
  Link: https://account.booking.com/auth/oauth2?client_id=vO1Kblk7xX9tUn2cpZLS&redirect_uri=https%3A%2F%2Fsecure.booking.com%2Flogin.html%3Fop%3Doauth_return&response_type=code&lang=en-us&aid=304142&bkng_action=hotel&prompt=signin&state=Us4BOGnDijWXtatEXOfmDLUebVM-Js4Km1Yemt4omDzLebhSE3GCRntKCzLXnzeg_f6ct5OOyUM9IKefXreDb18iIMNXn6Q3cdY7b5EvVTyB8Q_C44bdgChNslXlFzLbADfhiaNd2OtH_2LjdX__EOnQ-lh3iwVKndGU7CAUG8NTN3E2FnyqScijXsbzDrBIR-1l5JvR8U27gAnfg0My0GSczYZNoqahGaEMKX3meH16zs_Kat5Hgs3o6kcT8AjCCERVJYodGK6xGBV8lisNXXI%3D*eyJpZCI6InRyYXZlbGxlcl9oZWFkZXIifQ%3D%3D Sign in
  Link: https://www.booking.com/index.html Stays Link: https://booking.com/flights/index.html Flights Link: https://www.booking.com/packages.html Flight + Hotel Link: https://www.booking.com/cars/index.html Car rentals Link: https://booking.com/pxgo?url=https%3A%2F%2Fcruises.booking.com%2F%3Fsid%3Db1c219ee833b424ac88f613a26b2e558%26label%3Dgen000nr-10CAsoqAFCDTk5LXN1cmYtbG9kZ2VIM1gEaOwBiAEBmAEzuAEF0gEOaGVhZGxlc3NjaHJvbWXYAQPoAQH4AQGIAgGoAgG4At2DqLAGwAIB0gIkNzM3MDZhNmMtNjgxYi00YTIxLWJiNGItNGQzNzJmOWY1Zjcz2AIB4AIB%26aid%3D304142%26uvi%3D00660a01dd42e1cd71f9e7a50ed6435389&lang=en&label=gen000nr-10CAsoqAFCDTk5LXN1cmYtbG9kZ2VIM1gEaOwBiAEBmAEzuAEF0gEOaGVhZGxlc3NjaHJvbWXYAQPoAQH4AQGIAgGoAgG4At2DqLAGwAIB0gIkNzM3MDZhNmMtNjgxYi00YTIxLWJiNGItNGQzNzJmOWY1Zjcz2AIB4AIB&aid=304142&token=UmFuZG9tSVYkc2RlIyh9Yek6N0IyIDltSndU7UA7CIMgkeKa2M32DsbzYOyWA3tMTKzMTNTTnO1Q25S7DOuzlRddwqE4-E7QtTJlFH4wUbkjRGUV_nXi3PV74L7V18SZSqeqZsasNnkyL4-a_W8ozLu3eWtqFkB5HivowHSsHdA8ujKuVQ2ccp0wZfFPDSXa8UWynQeXK8RiZw4CJu0ZrKI5A8Au3rnDFlcYJrMSRcOyU1_b166r1ptwRtERGbarmGkwkoHfEYgj5Cra--D9uawy3khBUl-7m5nLkTBSEA95Ev8vkNp7J5YzGlVrSACKDKS-tXRIuKj6vHiwbaDPXZGHbzuONkkZ4NPFHNZ-OZeh4H83eSe9i8gDsxTsbS-y86_nCxt2_4pJnOrmg9Vz4AyAnAu6rZynVKgWQI0CbZxsyZmX4uC1E4NnNXH_xMBKKKy4N_qtuMHmamuIWMj9E5rulNu6Yff9KAxDQyAAMZOemh9XADyZ9ZWnpB1bZxL0tBBtlObo370AC0mQwziZ1cjPeeXTCjdEi22Tbfm4jDI Cruises Link: https://www.booking.com/attractions/index.html Attractions Link: https://www.booking.com/taxi/index.html Airport taxis
  Link: https://www.booking.com/index.html Home
  Link: https://www.booking.com/hotel/index.html Hotels
  Link: https://www.booking.com/lodges/index.html All lodges
  Link: https://www.booking.com/lodges/country/ni.html Nicaragua
  Link: https://www.booking.com/lodges/region/ni/rivas.html Rivas Region
  Link: https://www.booking.com/lodges/city/ni/el-limon.html El Limón
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html 99 Surf Lodge (Lodge), El Limón (Nicaragua) Deals
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#hotelTmpl Overview
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#availability Info & prices
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#hp_facilities_box Amenities
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#policies House rules
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#important_info The fine print
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#blockdisplay4 Guest reviews (126)
  Search
  Destination/property name:
  
  Check-in date
  
  +Check-in Date
  Check-out date
  
  +Check-out Date
  
  2 adults · 0 children · 1 room
  
  I'm traveling for work
  
  Search
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#map_opened-hotel_sidebar_static_map Show on map
  
   
  
   
  Reserve
  
  We Price Match
  Beachfront
  Airport shuttle
  99 Surf Lodge
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#availability 99 Surf Lodge
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#map_opened-hotel_address Playa Santana, 00111 El Limón, Nicaragua – Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#map_opened-hotel_header Great location - show map
  
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#blockdisplay4 8.4Scored 8.4 Very Good Rated very good 126 reviews
  This is a carousel with rotating slides. It displays featured reviews of the property. Use the Next and Previous buttons to navigate.
  Most comfortable bed across all places. AC is not over head but somewhere away from the bed, which is great for AC sensitive people like me. In room dining is available and …
  
  Xiaoxia  United States of America
  Wow I’m so happy I found this hidden gem of peace! Looks exactly like the pictures and the communication with the resort before arriving was excellent. Me and my …
  
  Martinez  United States of America
  the location was beautiful, as was the pool. the rooms were good and the bed was comfortable. The food was very good, as was the service. the staff were very …
  
  Ajay  Canada
  Location Location Location Service Service Service Food Food Food
  
  Soydemencia  Peru
  it looked exactly like the photos. it was remote. it was peaceful and beautiful.
  
  Jennifer  United States of America
  Absolutely perfect spot to getaway from it all, the surf break is only like a 10 min walk down the beach, the staff was great, and the hotel itself actually looks like it …
  
  Marvin  United States of America
  The building, the pool, the attention was excellent as well.
  
  Norwin  Nicaragua
  Great design lodges and pool area with fantastic views of the sea. Pool was clean at all times and restaurant/ bar had great options of food&drinks. We had a …
  
  Tereze  Ireland
  breathtaking view! great customer experience. definitely coming back pretty soon
  
  Dharma  United States of America
  beautiful location right on the beach. awesome pool and restaurant the staff treated us incredibly well
  
  Brad  United States of America
  9.29.2
  Top-rated beach nearby Top-rated beach nearby
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#        Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#        Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#        Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#        Link: https://www.booking.com/hotel/ni/99-surf-lodge.html# +36 photos
  Located a 10-minute walk from Santana Beach, 99 Surf Lodge offers an outdoor swimming pool, a fitness center and air-conditioned accommodations with a terrace and free WiFi.
  
  At the lodge you'll find a restaurant serving American, Australian and Asian cuisine. Vegetarian, dairy-free and vegan options can also be requested.
  
  The nearest airport is Augusto Cesar Sandino International, 60 miles from 99 Surf Lodge, and the property offers a paid airport shuttle service.
  
  Couples in particular like the location – they rated it 9.0 for a two-person trip.
  
  Distance in property description is calculated using © OpenStreetMap
  
  Most popular amenities
  Outdoor swimming pool
  Airport shuttle
  Non-smoking rooms
  Beachfront
  Fitness center
  Free WiFi
  Restaurant
  Room service
  Free parking
  Bar
  Property Highlights
  Top Location: Highly rated by recent guests (8.9)
  Free Private Parking Available On Site
  
  Reserve
  Link:
  Availability
  
  We Price Match
  Select dates to see this property's availability and prices
  
  
  Check-in Date
  —
  
  Check-out Date
  
  2 adults · 0 children · 1 room
  
  Search
  Room Type
  Number of guests
   
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#RD225502701 Ocean Suite
  2 twin bedsor1 king bed
  
  Show prices
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#RD225502702 Double or Twin Room with Side Sea View
  1 king bedor2 twin beds
  
  Show prices
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#RD225502705 Apartment with Sea View
  2 twin bedsand1 king bed
  × 4
  
  Show prices
  Link: https://www.booking.com/hotel/ni/99-surf-lodge.html#RD225502706 Double or Twin Room
  1 king bedor2 twin beds
  
  Show prices
  Property practices
  This property told us they've implemented certain practices across some or all of these categories: waste, water, energy and greenhouse gases, destination and community, and nature.
  Learn more
  Guest reviews
  
  See availability
  
  8.4Scored 8.4
  Very GoodRated very good · 126 reviews
  Read all reviews
  Categories:
  Staff
  8.9
  Facilities
  8.4
  Cleanliness
  8.5
  Comfort
  8.6
  Value for money
  8.1
  Location
  8.9
  Free WiFi
  6.3
  High score for El Limón
  Select topics to read reviews:
  
  Location
  
  Swimming pool
  
  Dinner
  
  Breakfast
  
  View
  See what guests loved the most:
  
  Xiaoxia
  United States of America
  “Most comfortable bed across all places. AC is not over head but somewhere away from the bed, which is great for AC sensitive people like me. In room dining is available and all meals I tried is exceptional except pizza”
  Read more
  
  Martinez
  United States of America
  “Wow I’m so happy I found this hidden gem of peace! Looks exactly like the pictures and the communication with the resort before arriving was excellent. Me and my Dad had a great time doing yoga, massages, surfing and the food was so good! All the...”
  Read more
  
  Ajay
  Canada
  “the location was beautiful, as was the pool. the rooms were good and the bed was comfortable. The food was very good, as was the service. the staff were very accommodating and a pleasure to deal with.”
  Read more
  
  Soydemencia
  Peru
  “Location Location Location
  
  Service Service Service
  
  Food Food Food”
  Read more
  
  Jennifer
  United States of America
  “it looked exactly like the photos. it was remote. it was peaceful and beautiful.”
  Read more
  
  "`
);

const messages = [
  {
    role: "system",
    content: `
          You will go through a provided code and look for the requested data.
          If the data is found, return a JSON response with data in 
          {data: FOUND DATA HERE}
          If instead the data is nowhere to be found, write a nice message saying something like "The email could not be found on this site (Or something along those line) in JSON as 
          {error: YOU RESPONSE HERE}
          Only reply in the above fashion.
        `,
  },
  { role: "user", content: bookingPrompt },
];

const data = await openAiWithPrompts(messages);
