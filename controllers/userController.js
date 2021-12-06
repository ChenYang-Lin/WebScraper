const Request = require("../models/request"); 
const fs = require('fs');
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const { getListOfEvents } = require("../server/utils")

const uploadsDirectory = 'controllers/uploads';
const offset = 300;


const user_get_root = (req, res) => {
    res.render("index", {
        listOfEvents: getListOfEvents(),
    });
}

const user_get_requestEvent = (req, res) => {
    res.render("userRequestForm");
}

const user_post_requestEvent = async (req, res) => {
    let { inputTitle, inputAddress, inputDate, inputTime, inputEndTime, inputImage, inputLink, inputTicketLink, inputEventBy, inputCategories, inputDescription, inputEmail } = req.body;

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
    let endTimeStrArr;
    let meridian = "AM";
    if (inputEndTime) {
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

    inputImage = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: 'image/*'
    }

    // Add to db
    let request = new Request({
        title: inputTitle,
        image: inputImage,
        email: inputEmail,
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
    await request.save();

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

    res.redirect('/');
}


module.exports = {
    user_get_root,
    user_get_requestEvent,
    user_post_requestEvent,
}