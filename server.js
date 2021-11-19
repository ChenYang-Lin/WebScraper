const express = require("express");
const app = express();
const cron = require("node-cron");
const path = require("path");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
require('dotenv/config');

const Subscription = require("./server/models/subscription"); 
const Event = require("./server/models/event"); 
const Manually = require("./server/models/manually"); 
const Request = require("./server/models/request"); 
const Log = require("./server/models/log"); 

let { scrapEvents, getScraping, getScrapeProgress, getErrorMessages } = require("./server/scraper.js");
let { removeDuplicates } = require("./server/removeDuplicates.js");
let { chronologicalOrder } = require("./server/chronologicalOrder.js");

let listOfEvents = [];
let scrapedList = [];
let listOfManuallyAddedEvents = [];
let listOfRequestedEvents = [];
let logMessages;
const uploadsDirectory = 'uploads';
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

      Subscription.find().then(async (result) => {
        let newList = await scrapEvents(result);
        if (newList.length !== 0) {
          listOfEvents = newList;
          listOfEvents = removeDuplicates(listOfEvents);
          listOfEvents = chronologicalOrder(listOfEvents);
          // console.log(listOfEvents);
          await eventDB(listOfEvents);
          let today = new Date();
          let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
          let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          console.log(date + "  " + time);

          lastUpdate = "" + date + "  " + time;
          // let errorMessages = getErrorMessages();

          // await Log.remove();
          // let log = new Log({
          //   lastUpdate: lastUpdate,
          //   errorMessages: errorMessages,
          // });
          // log.save()
          // .then((result) => {
          //   logMessages = result;
          //   // console.log(result);
          // })
          // .catch((err) => {
          //   console.log(err);
          // })
        }
        console.log(listOfEvents.length);
        console.log(listOfEvents);
      })
      await getManuallyAndScrapedList();
      await Request.find().then((result) => {
        listOfRequestedEvents = result;
      })
      await Log.find().then((result) => {
        logMessages = result;
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
      isManuallyAdded: false,
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

// Admin and list of subscription routes
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
        logMessages,
      });
    })
    .catch((err) => {
      console.log(err);
    })
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

// Manually add event routes
const multer = require('multer');
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  }
})
let upload = multer({ storage: storage })

app.get("/admin/manuallyAddEvent", (req, res) => {
  Manually.find()
    .then((result) => {
      listOfManuallyAddedEvents = result;
      res.render('manuallyAddEvent', { listOfManuallyAddedEvents: result });
    })
    .catch((err) => {
      console.log(err);
    })
});

app.post("/admin/manuallyAddEvent", upload.single('inputImage'), async (req, res) => {

  let event = {};
  let { inputTitle, inputAddress, inputDate, inputTime, inputImage, inputLink, inputTicketLink, inputEventBy, inputCategories, inputDescription } = req.body;


  let date = inputDate.split("-");
  let time = inputTime.split(":");
  const offset = 300;
  dateObject = new Date(date[0], date[1] - 1, date[2], time[0], time[1], 0, 0);
  dateObject = new Date(dateObject.getTime() + offset*60*1000);
  let organization = [
    {
      name: inputEventBy,
      link: '',
    }
  ] 
  let ticket;
  if (inputTicketLink)
    ticket = true;
  else {
    ticket = false;
    inputTicketLink = "";
  }

  inputImage = {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: 'image/*'
  }

  // Add to db
  let manually = new Manually({
    title: inputTitle,
    image: inputImage,
    dateTime: dateObject.toString(),
    linkToOriginalPost: inputLink,
    detailDateTime: dateObject.toString(),
    address: inputAddress,
    description: inputDescription,
    organizationInfo: organization,
    ticket: ticket,
    ticketLink: inputTicketLink,
    category: [inputCategories],
    isManuallyAdded: true,
    dateObject: dateObject,
    uuid: uuidv4(),
  });
  await manually.save()
  .then((result) => {
    // console.log(result)
  })
  .catch((err) => {
    console.log(err);
  })

  // console.log(listOfManuallyAddedEvents);

  // Remove files in uploads folder
  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) throw err;

    let firstFile = true;
    for (const file of files) {
      if (firstFile) {
        firstFile = false;
        continue;
      }
      fs.unlink(path.join(uploadsDirectory, file), err => {
        if (err) throw err;
      });
    }
  });

  await getManuallyAndScrapedList();

  res.redirect('/admin/manuallyAddEvent');
});

app.post("/admin/manuallyAddEvent-remove", async (req, res) => {
  // console.log(req.body);
  const { manuallyId, btnName } = req.body;
  if (btnName === "remove") {
    Manually.findByIdAndDelete(manuallyId, async (err, result) => {
      if (err) {
        res.send(err);
      }
      else {
        await getManuallyAndScrapedList();
        res.redirect('/admin/manuallyAddEvent');
      }
    });
  } 
});

// Manage Requests
app.get("/admin/manageRequests", (req, res) => {
  res.render("manageRequests", {
    listOfRequestedEvents,
  });
});

app.post("/admin/manageRequests", async(req, res) => {
  // console.log(req.body);
  const { btnName, requestId } = req.body;
  if (btnName === "accept") {
    // let event = await Request.find(requestId);
    await Request.find({"_id": requestId}).then(async (result) => {
      // console.log(result);
      result = result[0];
      // Add to db
      let manually = new Manually({
        title: result.title,
        image: result.image,
        dateTime: result.dateTime,
        linkToOriginalPost: result.linkToOriginalPost,
        detailDateTime: result.detailDateTime,
        address: result.address,
        description: result.description,
        organizationInfo: result.organizationInfo,
        ticket: result.ticket,
        ticketLink: result.ticketLint,
        category: result.category,
        isManuallyAdded: true,
        dateObject: result.dateObject,
        uuid: result.uuid,
      });
      await manually.save()
      .then((result) => {
        // console.log(result)
      })
      .catch((err) => {
        console.log(err);
      })
    })
  } 

  // else if (btnName === "remove") {}
  await Request.remove({_id:requestId});

  await Request.find().then((result) => {
    listOfRequestedEvents = result;
  })
  await getManuallyAndScrapedList();
  
  res.redirect('/admin/manageRequests');
});

// Request event routes
app.get("/requestEvent", (req, res) => {
  res.render("userRequestForm");
});


app.post("/requestEvent", upload.single('inputImage'), async (req, res) => {

  let { inputTitle, inputAddress, inputDate, inputTime, inputImage, inputLink, inputTicketLink, inputEventBy, inputCategories, inputDescription, inputEmail } = req.body;


  let date = inputDate.split("-");
  let time = inputTime.split(":");
  const offset = 300;
  dateObject = new Date(date[0], date[1] - 1, date[2], time[0], time[1], 0, 0);
  dateObject = new Date(dateObject.getTime() + offset*60*1000);
  let organization = [
    {
      name: inputEventBy,
      link: '',
    }
  ] 
  let ticket;
  if (inputTicketLink)
    ticket = true;
  else {
    ticket = false;
    inputTicketLink = "";
  }

  inputImage = {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: 'image/*'
  }

  // Add to db
  let request = new Request({
    title: inputTitle,
    image: inputImage,
    email: inputEmail,
    dateTime: dateObject.toString(),
    linkToOriginalPost: inputLink,
    detailDateTime: dateObject.toString(),
    address: inputAddress,
    description: inputDescription,
    organizationInfo: organization,
    ticket: ticket,
    ticketLink: inputTicketLink,
    category: [inputCategories],
    isManuallyAdded: true,
    dateObject: dateObject,
    uuid: uuidv4(),
  });
  await request.save()
  .then((result) => {
    // console.log(result)
  })
  .catch((err) => {
    console.log(err);
  })

  // console.log(listOfManuallyAddedEvents);

  // Remove files in uploads folder
  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) throw err;

    let firstFile = true;
    for (const file of files) {
      if (firstFile) {
        firstFile = false;
        continue;
      }
      fs.unlink(path.join(uploadsDirectory, file), err => {
        if (err) throw err;
      });
    }
  });

  await Request.find().then((result) => {
    listOfRequestedEvents = result;
  })

  res.redirect('/');
});


app.post("/admin/scrape", (req, res) => {
  let scraping = getScraping();
  if (scraping) return;

  if (req.body.scrapeBtnVal === "scrape") {
    // console.log(req.body);
    Subscription.find().then(async (result) => {
      result = chronologicalOrder(result);
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

      await getManuallyAndScrapedList();
        
      let today = new Date();
      let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      lastUpdate = "" + date + "  " + time;

      let errorMessages = getErrorMessages();

      await Log.remove();
      let log = new Log({
        lastUpdate: lastUpdate,
        errorMessages: errorMessages,
      });
      log.save()
      .then((result) => {
        logMessages = result;
        // console.log(result);
      })
      .catch((err) => {
        console.log(err);
      })
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


async function getManuallyAndScrapedList() {
  await Event.find().then((result) => {
    scrapedList = result;
    listOfEvents = scrapedList;
  })
  await Manually.find().then((result) => {
    listOfManuallyAddedEvents = result;
  })
  listOfEvents.push.apply(listOfEvents, listOfManuallyAddedEvents);
  listOfEvents = chronologicalOrder(listOfEvents);
  // console.log(listOfEvents);
}