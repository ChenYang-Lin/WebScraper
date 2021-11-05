const express = require("express");
const app = express();
const cron = require("node-cron");
const path = require("path");
const mongoose = require("mongoose");
const Subscription = require("./server/models/subscription"); 
const Event = require("./server/models/event"); 

let { scrapEvents, getScraping, getScrapeProgress } = require("./server/scraper.js");
let { removeDuplicates } = require("./server/removeDuplicates.js");
let { chronologicalOrder } = require("./server/chronologicalOrder.js");

let listOfEvents = [];
let scrapingList = [
  // "https://www.facebook.com/groups/444744689463060",
  // "https://www.facebook.com/groups/recoveryfriends717",
  // "https://www.facebook.com/groups/292737672143068",
  //
  "https://www.facebook.com/gloriousrecovery",
  "https://www.facebook.com/CCAR4Recovery",
  "https://www.facebook.com/NewCanaanParentSupportGroup",
  "https://www.facebook.com/FairfieldCARES",
  "https://www.facebook.com/kcmakesmusic",
  "https://www.facebook.com/liberationprograms",
];
let lastUpdate = "";

// Register view engine
app.set("view engine", "ejs");
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));


// Mongoose and Mongo sandbox routes
// Initialize subscription database
app.get('/init-subscription', (req, res) => {
  for (let i = 0; i < scrapingList.length; i++) {
    let subscription = new Subscription({
      groupURL: scrapingList[i],
    }); 
    subscription.save()
      .then((result) => {
        res.redirect("/admin");
      })
      .catch((err) => {
        console.log(err);
      })
  }
  res.redirect('/admin');
})

// MongoDB database
// Connect to MondoDB
const dbURI = `mongodb+srv://ChenYang-Lin:${process.env.MongoDB_User_Password}@cluster0.cts13.mongodb.net/${process.env.MongoDB_myFirstDatabase}?retryWrites=true&w=majority`;
mongoose.connect(dbURI)
  .then((result) => {
    app.listen(process.env.PORT || 3000, async () => {
      console.log("app is running on port 3000");
      
      let testList = [
        // {
        //   groupURL: "https://www.facebook.com/gloriousrecovery",
        // },
        // {
        //   groupURL: "https://www.facebook.com/TipThePainScale",
        // },
        {
          groupURL: "https://www.facebook.com/CCAR4Recovery",
        },
      ];

      // listOfEvents = await scrapEvents(testList);
      // if (listOfEvents.length !== 0) {
      //   listOfEvents = removeDuplicates(listOfEvents);
      //   listOfEvents = chronologicalOrder(listOfEvents);
      //   listOfEvents = chronologicalOrder(listOfEvents);
      //   await eventDB(listOfEvents);
      //   let today = new Date();
      //   let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
      //   let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      //   console.log(date + "  " + time);
      // }
      // console.log(listOfEvents);
      // console.log(listOfEvents.length);

      // Subscription.find().then(async (result) => {
      //   let newList = await scrapEvents(result);
      //   if (newList.length !== 0) {
      //     listOfEvents = newList;
      //     listOfEvents = chronologicalOrder(listOfEvents);
      //     listOfEvents = chronologicalOrder(listOfEvents);
      //     // console.log(listOfEvents);
      //     await eventDB(listOfEvents);
      //     let today = new Date();
      //     let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
      //     let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      //     console.log(date + "  " + time);
      //   }
      //   console.log(listOfEvents.length);
      //   console.log(listOfEvents);
      // })
      Event.find().then((result) => {
        result = chronologicalOrder(result);
        listOfEvents = result;
      })
    }) // End app.listen
  })
  .catch((err) => console.log(err));


async function eventDB(list) {
  await Event.remove();
  // console.log(list);
  for (let i = 0; i < list.length; i++) {
    let event = new Event({
      title: list[i].title,
      image: list[i].image,
      dateTime: list[i].dateTime,
      linkToOriginalPost: list[i].linkToOriginalPost,
      detailDateTime: list[i].detailDateTime,
      address: list[i].address,
      description: list[i].description,

      organizationInfo: list[i].organizationInfo,
      splitTime: list[i].splitTime,
      ticket: list[i].ticket,
      category: list[i].category,
      keywords: list[i].keywords,
      dateObject: list[i].dateObject,
    });
    event.save()
    .then((result) => {
      // console.log(result);
    })
    .catch((err) => {
      console.log(err);
    })
  }
}

// Routes
app.get("/", async (req, res) => {
  res.render("index", {
    listOfEvents,
  });
});

app.get("/admin", async (req, res) => {
  Subscription.find().sort({ createdAt: 1 })
    .then((result) => {
      // console.log(result);
      let scraping = getScraping();
      let scrapeProgress = getScrapeProgress();
      res.render("admin", {
        result,
        scraping,
        scrapeProgress,
        lastUpdate,
      });
    })
    .catch((err) => {
      console.log(err);
    })

  // res.render("admin", {
  //   scrapingList,
  // });
});

app.post("/edit-remove", (req, res) => {
  const { url, id, name } = req.body;
  if (name === "edit") {
    Subscription.findByIdAndUpdate(id, { groupURL: url }, (err, result) => {
      if (err) {
        res.send(err);
        // console.log(err);
      }
      else {
        // console.log(result);
        res.redirect('/admin');
      }
    })
  } else if (name === "remove") {
    Subscription.findByIdAndDelete(id, (err, result) => {
      if (err) {
        res.send(err);
      }
      else {
        res.redirect('/admin');
      }
    });
  } else {
    return;
  }
});

app.post("/add", (req, res) => {
  const { newUrl, name } = req.body;
  if (name === "add") {
    let subscription = new Subscription({
      groupURL: newUrl,
    });
    subscription.save()
    .then((result) => {
      // res.send(result);
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log(err);
    })
  } else {
    return;
  }

});

app.post("/admin/scrape", (req, res) => {
  let scraping = getScraping();
  if (scraping) return;

  if (req.body.scrapeBtnVal === "scrape") {
    // console.log(req.body);
    Subscription.find().then(async (result) => {
      listOfEvents = await scrapEvents(result);
      listOfEvents = removeDuplicates(listOfEvents);
    })
  } 
})

app.post("/admin/progress", (req, res) => {
  // console.log(req.body);=
  let scraping = getScraping();
  let scrapeProgress = getScrapeProgress();
  res.send({ scrapeProgress, scraping })
  
  // res.redirect('/admin');
})

// Update list of events repeatly by doing new scrapes
let second = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
let minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
let hour = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
cron.schedule(`${second} ${minute} ${hour} * * *`, async () => {
    let today = new Date();
    let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    lastUpdate = "" + date + "  " + time + "..." + hour + ":" + minute + ":" + second;
    
  second = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
  minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
  hour = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
  console.log("running a task every day between 1 - 3 AM");
  Subscription.find().then(async (result) => {
    let newList = await scrapEvents(result);
    
    if (newList.length !== 0) {
      listOfEvents = newList;
      listOfEvents = removeDuplicates(listOfEvents);
      listOfEvents = chronologicalOrder(listOfEvents);
      await eventDB(listOfEvents);
      
    }
    console.log(lastUpdate);
    // console.log(listOfEvents);
    // console.log(listOfEvents.length);
  })
  // listOfEvents = await scrapEvents(scrapingList);
});




// Subscription.find().then(async (result) => {
//   listOfEvents = await scrapEvents(result);
//   listOfEvents = removeDuplicates(listOfEvents);
//   // console.log(listOfEvents);
//   console.log(listOfEvents.length);
// })



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
const https = require('https');
setInterval(function () {
  https.get("https://cs410-web-scraper.herokuapp.com", (res) => {
    console.log("ping every 20 min. to prevent heroku sleep")
  });
}, 20 * 60 * 1000); // every 20 minutes
