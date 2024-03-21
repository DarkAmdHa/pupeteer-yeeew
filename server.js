const express = require("express");
require("dotenv").config();
const app = express();

app.use(express.json());

const generateBusinessData = require("./pupeteer-openai.js");

app.post("/getData", async (req, res) => {
  const businessName = req.body[0];
  const businessLink = req.body[1];

  const businessData = await generateBusinessData(businessLink, businessName);
  console.log(businessData);
  // const businessData = {
  //   contact_email: "7islandsurf@gmail.com",
  //   phone_number: "0034 660 43 96 86",
  //   whatsapp_number: "",
  //   accomodation_type: "",
  //   trip_type: "",
  //   contact_name: "Tom and Sara Perry",
  //   location: "Fuerteventura, Canary Islands",
  //   summary:
  //     "7 Island Surf, established in 2004 by Tom and Sara Perry, offers a memorable surfing experience in Fuerteventura. As an Official licensed Surf School recognised by the Canarian Surf Federation, it provides tailored surfing courses for all levels. The school prizes small group sizes for personalized attention, offering a range of experiences from beginner to family holidays. The team, boasting over 25 years of surfing experience and essential qualifications, ensures a friendly, fun, and safe environment. 7 Island Surf has won the TripAdvisor Certificate of Excellence consecutively in 2015, 2016, and 2017, underlining its quality service and customer satisfaction. Fuerteventura's year-round sunshine, warm turquoise waters, and picturesque beaches make it an ideal destination for surf enthusiasts.",
  //   name: "7 Island Surf",
  //   slug: "/europe/canary-islands/fuerteventura/7-island-surf",
  //   content:
  //     "Nestled among the pristine landscapes of Fuerteventura in the Canary Islands, 7 Island Surf emerges as a beacon for those passionately chasing the thrill of surfing. Established in 2004 by the intrepid duo Tom and Sara Perry, this surfing sanctuary beckons adventurers from all corners of the globe, promising an experience steeped in the sublime beauty of year-round sunshine, warm turquoise waters, and idyllic beaches that seem to stretch into infinity.\n" +
  //     "\n" +
  //     "As an Officially licensed Surf School recognized by the Canarian Surf Federation, 7 Island Surf takes pride in crafting tailored surfing courses that cater to all levels of proficiency. Whether you're experiencing the gentle caress of the surfboard for the first time or you're a seasoned surfer seeking to hone your skills, Tom, Sara, and their team bring over 25 years of surfing experience to ensure your journey on the waves is both exhilarating and safe.\n" +
  //     "\n" +
  //     "In Finnegan-esque reverence for the majestic powers of the ocean, the team at 7 Island Surf emphasizes small group sizes, ensuring each participant receives personalized attention worthy of the sport's profound connection between person and wave. The school's array of experiences, engagingly suitable from beginners to family holiday ventures, has garnered them the prestigious TripAdvisor Certificate of Excellence for three consecutive years - 2015, 2016, and 2017 - a testament to their unwavering commitment to high-quality service and customer satisfaction.\n" +
  //     "\n" +
  //     "Fuerteventura, this gem in the Canary Islands, is not just about breathtaking landscapes but is also a hub for incredible surf spots. Among these, [Playa De La Pared](https://www.yeeew.com/listing/europe/canary-islands/fuerteventura/playa-de-la-pared/) has etched itself as a must-visit locale for both novices and masters of the board. The spot guide reveals a canvas of ever-changing conditions - with wave heights, wind speeds, and other essential surf metrics updated regularly to keep you ahead of the tides. Daring surfers often find themselves drawn to its consistent breaks, promising an unforgettable adventure atop the rolling waves.\n" +
  //     "\n" +
  //     "7 Island Surf's commitment extends beyond the surfboard. Their close-knit bond with the Fuerteventura surf community and detailed knowledge of the [local surf spots](https://www.yeeew.com/listing/europe/canary-islands/fuerteventura/) enable a holistic surf adventure, ensuring you're always at the right place at the right time to catch the perfect wave.\n" +
  //     "\n" +
  //     "Connecting with the spirit of the island and the pulse of its waves becomes effortless under the guidance of Tom, Sara, and the 7 Island Surf team. Each course, each session in the water, is an invitation to immerse yourself in a lifestyle where each wave is not just ridden but deeply felt and respected. \n" +
  //     "\n" +
  //     `For those drawn to the call of the surf, seeking to weave their own narratives into the tapestry of Fuerteventura's legendary surf spots, 7 Island Surf stands ready, offering not just lessons, but a gateway into a profoundly transformative experience. Contact them at 7islandsurf@gmail.com or dial 0034 660 43 96 86 to embark on your surf journey. In the words of Tom and Sara Perry, "Welcome to our ocean, our community, and the beginning of your surf story."`,
  // };
  res.json({ businessData });
});

app.get("/", (req, res) => {
  console.log("Fetched");
  res.json({
    message: "Success",
  });
});

app.listen(3000, () => {
  console.log("sd");
});
