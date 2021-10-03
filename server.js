const express = require("express");
const app = express();
const cron = require("node-cron");
const path = require("path");

let { scrapEvents } = require("./server/scraper.js");
let { removeDuplicates } = require("./server/removeDuplicates.js");

let listOfEvents = [];

// Register view engine
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  // only render index page when there exist any event on listOfEvents object array.
  // console.log(listOfEvents.length);

  if (listOfEvents.length === 0) {
    res.send("no events, try again later");
  } else {
    res.render("index", {
      listOfEvents,
    });
  }
});

// listen to port 3000 and start initial scraping immediately
app.listen(process.env.port || 3000, async () => {
  console.log("app is running on port 3000");
  listOfEvents = await scrapEvents();
  // listOfEvents = removeDuplicates(listOfEvents);
  console.log(listOfEvents);
  console.log(listOfEvents.length);
});

// Update list of events repeatly by doing new scrapes
// cron.schedule("*/5 * * * *", async () => {
//   console.log("running a task every minute");
//   listOfEvents = await scrapEvents();
//   console.log(listOfEvents);
//   console.log(listOfEvents.length);
// });

// cron.schedule(
//   "0 1 * * *",
//   async () => {
//     console.log("Running a job at 01:00 at America/New_York timezone");
//     listOfEvents = await scrapEvents();
//     console.log(listOfEvents);
//     console.log(listOfEvents.length);
//   },
//   {
//     scheduled: true,
//     timezone: "America/New_York",
//   }
// );
