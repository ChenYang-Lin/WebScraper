const express = require("express");
const app = express();
const cron = require("node-cron");
const path = require("path");

let { scrapEvents } = require("./server/scraper.js");
let { removeDuplicates } = require("./server/removeDuplicates.js");

let listOfEvents = [];
let scrapingList = [
  // "https://www.facebook.com/groups/444744689463060",
  // "https://www.facebook.com/groups/recoveryfriends717",
  // "https://www.facebook.com/groups/292737672143068",
  // 
  "https://www.facebook.com/gloriousrecovery",
  "https://www.facebook.com/CCAR4Recovery",
  // "https://www.facebook.com/NewCanaanParentSupportGroup",
  // "https://www.facebook.com/FairfieldCARES",
  // "https://www.facebook.com/kcmakesmusic",
  // "https://www.facebook.com/liberationprograms",
];

// Register view engine
app.set("view engine", "ejs");
// Middlewares
app.use(express.json());
app.use(express.urlencoded({  extended: true }));
app.use(express.static(__dirname + '/public'));

// Routes
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
app.get("/admin", async(req, res) => {
  res.render("admin", {
    scrapingList,
  });
});

app.post("/edit-remove", (req, res) => {
  const { url, index, name } = req.body;
  if (name === "edit") {
    scrapingList[index] = url;
  } else if (name === "remove") {
    if (index > -1) {
      scrapingList.splice(index, 1);
    }
  } else {
    return;
  }

  res.render("admin", {
    scrapingList,
  });
})

app.post("/add", (req, res) => {
  const { newUrl, name } = req.body;
  if (name === "add") {
    scrapingList.push(newUrl);
  } else {
    return;
  }

  res.render("admin", {
    scrapingList,
  });
})

// listen to port 3000 and start initial scraping immediately
app.listen(process.env.port || 3000, async () => {
  console.log("app is running on port 3000");
  listOfEvents = await scrapEvents(scrapingList);
  // listOfEvents = removeDuplicates(listOfEvents);
  console.log(listOfEvents);
  console.log(listOfEvents.length);
});

// Update list of events repeatly by doing new scrapes
// cron.schedule("*/5 * * * *", async () => {
//   console.log("running a task every minute");
//   listOfEvents = await scrapEvents(scrapingList);
//   console.log(listOfEvents);
//   console.log(listOfEvents.length);
// });

// cron.schedule(
//   "0 1 * * *",
//   async () => {
//     console.log("Running a job at 01:00 at America/New_York timezone");
//     listOfEvents = await scrapEvents(scrapingList);
//     console.log(listOfEvents);
//     console.log(listOfEvents.length);
//   },
//   {
//     scheduled: true,
//     timezone: "America/New_York",
//   }
// );

// prevent heroku sleep
var http = require("http");
  setInterval(function() {
    http.get("https://cs410-web-scraper.herokuapp.com");
}, 300000); // every 5 minutes (300000)