const fs = require('fs');
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const Subscription = require("../models/subscription"); 
const Manually = require("../models/manually"); 
const Request = require("../models/request"); 
const Log = require("../models/log"); 

let { getScraping, getScrapeProgress } = require("../server/scraper.js");
let { scrapeAndUpdate, getManuallyAndScrapedList } = require("../server/utils");

const uploadsDirectory = 'controllers/uploads';
const offset = 300;
let logMessages;

// Subscription routes
const admin_get_subscription = async (req, res) => {
    await Log.find().then((result) => {
      logMessages = result;
    })
    Subscription.find().sort({ createdAt: 1 })
    .then((result) => {
      let scraping = getScraping();
      let scrapeProgress = getScrapeProgress();
      res.render("admin", {
        result,
        scraping,
        scrapeProgress,
        logMessages,
      });
    })
    .catch((err) => {
      console.log(err);
    })
}

const admin_post_subscription_update = (req, res) => {
    const { url, id, name } = req.body;
    if (name === "edit") {
        Subscription.findByIdAndUpdate(id, { groupURL: url }, (err, result) => {
            if (err) 
                res.send(err);
            else 
                res.redirect('/admin/subscription');
        })
    }
    if (name === "remove") {
        Subscription.findByIdAndDelete(id, (err, result) => {
            if (err)
                res.send(err);
            else 
                res.redirect('/admin/subscription');
        });
    } 
}

const admin_post_subscription_add = (req, res) => {
    const { newUrl, name } = req.body;
    if (name === "add") {
        let subscription = new Subscription({
            groupURL: newUrl,
        });
        subscription.save()
        .then((result) => {
            res.redirect('/admin/subscription');
        })
        .catch((err) => {
            console.log(err);
        })
    }
}

// Manually Add Event routes
const admin_get_manuallyAddEvent = (req, res) => {
    Manually.find()
    .then((result) => {
        res.render('manuallyAddEvent', { listOfManuallyAddedEvents: result });
    })
    .catch((err) => {
        console.log(err);
    })
}

const admin_post_manuallyAddEvent = async (req, res) => {
    let { inputTitle, inputAddress, inputDate, inputTime, inputEndTime, inputImage, inputLink, inputTicketLink, inputEventBy, inputCategories, inputDescription } = req.body;

    // Date Object
    let date = inputDate.split("-");
    let time = inputTime.split(":");
    dateObject = new Date(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], 0, 0));
    dateObject = new Date(dateObject.getTime() + offset*60*1000);
    let dateString = dateObject.toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: "full", timeStyle: "long" })
    dateString = dateString.toLowerCase();
    if (dateString.includes("edt")) 
        dateObject.setHours( dateObject.getHours() - 1 );

    // End Time
    let endTime;
    let meridian = "AM";
    if (inputEndTime) {
        let endTimeStrArr;
        endTimeStrArr = inputEndTime.split(":");
        hour = endTimeStrArr[0];
        minute = endTimeStrArr[1];
        if (hour >= 12) {
            meridian = "PM";
            if (hour > 12)
            hour %= 12;
        } 
        endTime = "" + hour + ":" + minute + " " + meridian;
    }

    // Organization
    let organization = [
        {
            name: inputEventBy,
            link: '',
        }
    ] 

    // Ticket
    let ticket;
    if (inputTicketLink)
        ticket = true;
    else {
        ticket = false;
        inputTicketLink = "";
    }

    // Image
    inputImage = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: 'image/*'
    }

    // Add to db
    let manually = new Manually({
        title: inputTitle,
        image: inputImage,
        endTime: endTime,
        dateTime: dateObject.toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: "long", timeStyle: "short" }),
        linkToOriginalPost: inputLink,
        detailDateTime: dateObject.toString(),
        address: inputAddress,
        description: inputDescription,
        organizationInfo: organization,
        ticket: ticket,
        ticketLink: inputTicketLink,
        eventBy: organization[0].name,
        location: inputAddress,
        category: [inputCategories],
        isManuallyAdded: true,
        dateObject: dateObject,
        uuid: uuidv4(),
    });
    await manually.save();

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

    // update list of events on user page
    await getManuallyAndScrapedList();

    res.redirect('/admin/manuallyAddEvent');
}

const admin_post_manuallyAddEvent_remove = async (req, res) => {
    const { manuallyId, btnName } = req.body;
    if (btnName === "remove") {
        Manually.findByIdAndDelete(manuallyId, async (err, result) => {
            if (err) {
                res.send(err);
            }
            else {
                // update list of events on user page
                await getManuallyAndScrapedList();
                res.redirect('/admin/manuallyAddEvent');
            }
        });
    } 
}

// Manage Requests
const admin_get_manageRequests = (req, res) => {
    Request.find()
    .then((result) => {
        res.render('manageRequests', { listOfRequestedEvents: result });
    })
    .catch((err) => {
        console.log(err);
    })
}

const admin_post_manageRequests = async (req, res) => {
    const { btnName, requestId } = req.body;
    if (btnName === "accept") {
        await Request.find({"_id": requestId}).then(async (result) => {
        result = result[0];
        // Add to db
        let manually = new Manually({
            title: result.title,
            image: result.image,
            endTime: result.endTime,
            dateTime: result.dateTime,
            linkToOriginalPost: result.linkToOriginalPost,
            detailDateTime: result.detailDateTime,
            address: result.address,
            description: result.description,
            organizationInfo: result.organizationInfo,
            ticket: result.ticket,
            ticketLink: result.ticketLint,
            eventBy: result.eventBy,
            location: result.location,
            category: result.category,
            isManuallyAdded: true,
            dateObject: result.dateObject,
            uuid: result.uuid,
        });
        await manually.save();
        })
    } 

    await Request.remove({_id:requestId});

    // update list of events on user page
    await getManuallyAndScrapedList();
    
    res.redirect('/admin/manageRequests');
}

// manually scrape
const admin_post_scrape = async (req, res) => {
    let scraping = getScraping();
    if (scraping) return;

    if (req.body.scrapeBtnVal === "scrape") {
        await scrapeAndUpdate();
    } 
}

const admin_post_progress = (req, res) => {
    let scraping = getScraping();
    let scrapeProgress = getScrapeProgress();
    res.send({ scrapeProgress, scraping })
}


module.exports = {
    admin_get_subscription,
    admin_post_subscription_update,
    admin_post_subscription_add,

    admin_get_manuallyAddEvent,
    admin_post_manuallyAddEvent,
    admin_post_manuallyAddEvent_remove,

    admin_get_manageRequests,
    admin_post_manageRequests,

    admin_post_scrape,
    admin_post_progress,
}