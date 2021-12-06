const Subscription = require("../models/subscription"); 
const Manually = require("../models/manually"); 
const Event = require("../models/event"); 
const Log = require("../models/log"); 

let { removeDuplicates } = require("./removeDuplicates.js");
let { chronologicalOrder } = require("./chronologicalOrder.js");
let { scrapEvents, getErrorMessages } = require("./scraper.js");

let listOfEvents = [];
let scrapedList = [];
let listOfManuallyAddedEvents = [];

// Multer for save images to database
const multer = require('multer');
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'controllers/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  }
})
let upload = multer({ storage: storage })

// Run scraper and update global variables
let scrapeAndUpdate = async () => {
  await Subscription.find().then(async (result) => {
    let newList = await scrapEvents(result);
    if (newList.length !== 0) {
      listOfEvents = newList;
      listOfEvents = removeDuplicates(listOfEvents);
      listOfEvents = chronologicalOrder(listOfEvents);
      console.log(listOfEvents);
      await eventDB(listOfEvents);
        
      let today = new Date();
      let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      lastUpdate = "" + date + "  " + time + " UTC";

      let errorMessages = getErrorMessages();

      await Log.remove();
      let log = new Log({
        lastUpdate: lastUpdate,
        errorMessages: errorMessages,
      });
      await log.save();
    }
  })
  await getManuallyAndScrapedList();
}

// Update list of events for user page 
let getManuallyAndScrapedList = async () => {
  await Event.find().then((result) => {
    scrapedList = result;
    listOfEvents = scrapedList;
  })
  await Manually.find().then((result) => {
    listOfManuallyAddedEvents = result;
  })
  listOfEvents.push.apply(listOfEvents, listOfManuallyAddedEvents);
  listOfEvents = chronologicalOrder(listOfEvents);
  listOfEvents = chronologicalOrder(listOfEvents);
  // console.log(listOfEvents);
}

// Add scraped events to database
async function eventDB(list) {
  await Event.remove();
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
      endTime: list[i].endTime,
      ticket: list[i].ticket,
      eventBy: list[i].eventBy,
      location: list[i].location,
      category: list[i].category,
      isManuallyAdded: false,
      dateObject: list[i].dateObject,
    });
    await event.save();
  }
}


const getListOfEvents = () => {
  return listOfEvents;
}

const setListOfEvents = (list) => {
  listOfEvents = list;
}

module.exports = {
    upload,
    scrapeAndUpdate,
    getListOfEvents,
    setListOfEvents,
    getManuallyAndScrapedList,
}