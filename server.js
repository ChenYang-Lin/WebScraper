require('dotenv/config');

const express = require("express");
const app = express();
const cron = require("node-cron");
const mongoose = require("mongoose");

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

let { scrapeAndUpdate, getManuallyAndScrapedList } = require("./server/utils.js");
let { setUser } = require("./passport-config.js");
const Admin = require("./models/admin"); 


// Register view engine
app.set("view engine", "ejs");
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Connect to MondoDB
const dbURI = `mongodb+srv://ChenYang-Lin:${process.env.MongoDB_User_Password}@cluster0.cts13.mongodb.net/${process.env.MongoDB_myFirstDatabase}?retryWrites=true&w=majority`;
mongoose.connect(dbURI)
  .then(async (result) => {
    app.listen(process.env.PORT || 3000, async () => {
      await getManuallyAndScrapedList();
      await Admin.find().then((result) => {
        setUser(result);
      })
      console.log("app is running on port 3000");
    }) 
  })
  .catch((err) => console.log(err));

// Routes
app.use('', userRoutes);
app.use('', authRoutes);
app.use('/admin', adminRoutes);

// Cron Job - Update list of events repeatly by doing new scrapes
let second = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
let minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
let hour = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
cron.schedule(`${second} ${minute} ${hour} * * *`, async () => {
  second = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
  minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
  hour = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
  console.log("running a task every day between 1 - 3 AM");
  await scrapeAndUpdate();
},
{
  scheduled: true,
  timezone: "America/New_York",
});

// prevent heroku sleep
const https = require('https');
setInterval(function () {
  https.get("https://cs410-web-scraper.herokuapp.com", (res) => {
    console.log("ping every 15 min. to prevent heroku sleep")
  });
}, 15 * 60 * 1000); // every 15 minutes





