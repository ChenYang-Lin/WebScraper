require("dotenv").config();
const puppeteer = require("puppeteer");
const { splitTime } = require("./scraperFunctions/splitTime");
const { dateObject } = require("./scraperFunctions/dateObject");
const { gengerateProxy } = require("./proxy.js");

let scrapingList = [];
let errorMessages = [];
let scrapeProgress = 0;
let scrapeIndex = 0;
let scraping = false;

let scrapEvents = async (list) => {
  if (scraping === true) return;
  scraping = true;
  scrapeProgress = 0;
  scrapeIndex = 0;

  scrapingList = list;
  try {
    console.log("running scapEvents function");

    const browser = await puppeteer.launch({
      // headless: false,
      headless: true,
      args: [
        "--no-sandbox",
        // `--proxy-server=${ip}`,
        // '--disable-setuid-sandbox',
        // `--proxy-server=${ProxyUrl}`,
        // '--ignore-certificate-errors',
        // '--ignore-certificate-errors-spki-list ',
      ],
      // defaultViewport: {
      //   width: 1920,
      //   height: 1080,
      // },
      // userDataDir: "./cache"
    });
    const page = await browser.newPage();
    
    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0);

    // const version = await page.browser().version();
    // console.log("browser version:---------------------------------------------------------------------------")
    // console.log("browser version: " + version)


    // Login
    await loginFacebook(page);
    // Scrapping
    let scrapingResults = await scrapeFacebookEvents(browser, page);
    // Create and add Date object to each event
    scrapingResults = dateObject(scrapingResults);
    // close browser
    await browser.close();

    console.log("completed scapEvents function");
    scrapeProgress = 100;
    scraping = false;
    return scrapingResults;
  } catch (error) {
    console.log("Error running scrapEvents function: " + error);
    scraping = false;
    return [];
  }
};

async function loginFacebook(page) {
  // Go to the login page
  // await page.goto("https://google.com", {
  //   waitUntil: "networkidle0",
  // });
  await page.goto("https://www.facebook.com/login/", {
    waitUntil: "networkidle0",
  });
  try {
    // username and password
    await page.type("#email", process.env.EMAIL, { delay: 30 });
    await page.type("#pass", process.env.PASSWORD, { delay: 30 });
    await page.click("#loginbutton");

    // Wait for navigation to finish
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  }
  catch (e) {
    console.log("no login");
  }
}

async function scrapeFacebookEvents(browser, page) {
  let singleEvent;
  let scrapingResults = [];

  // Scrape facebook groups one by one from scrapingList
  for (let i = 0; i < scrapingList.length; i++) {
    // See if url exist
    let eventsURL;
    if (scrapingList[i].groupURL.slice(-1) === "/") {
      eventsURL = "events";
    } else {
      eventsURL = "/events";
    }

    try {
      await page.goto(scrapingList[i].groupURL + eventsURL, {
        waitUntil: "networkidle0",
        // Remove the timeout
        timeout: 0,
      });
    } catch (e) {
      console.log("Error: " + scrapingList[i].groupURL);
      console.log(e);
      continue;
    }
// for test only ------------------------------------
page.on('console', consoleObj => console.log(consoleObj.text()));
// for test only ------------------------------------

    let basicInfosFromOneGroup;
    // Ineract with the page directly in the page DOM environment
    try {
      basicInfosFromOneGroup = await page.evaluate(async () => {
        let basicResults = [];
        const UpcomingEventsDiv = ".dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi";
        let UpcomingEventsElement = document.querySelectorAll(UpcomingEventsDiv)[0];

        // expand see more
        const seeMoreBtn = document.querySelector('.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi > [aria-label="See More"]')
        if (seeMoreBtn) {
            await seeMoreBtn.click();    
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        // if there is no upcoming events, just return
        let text;
        try {
          text = document.querySelectorAll('.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi > .gm7ombtx')[0].parentNode.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].textContent;
          if (text !== "Past Events") {
            return basicResults;
          }
        } catch (e) {
          // do nothing
        }
        let numberOfEvents;
        if (!text) {
          if (document.querySelectorAll('.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi > .gm7ombtx').length > 0 || document.querySelectorAll('.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi > .gh3ezpug').length > 0){
            return basicResults;
          }
        }
        numberOfEvents = UpcomingEventsElement.children.length;
        

        // scrape events one by one from current group event list.
        for (let j = 1; j < numberOfEvents; j++) {  
          // loop starts from 1 because first element of div is title => "Upcoming Events" text container
          let event = UpcomingEventsElement.children[j];
          let linkToOriginalPost, image, dateTime, title;
          // The sturcture of Facebook events pages are slightly different, This if statement helps build more consistency.
          if (event.childElementCount < 2) {
            // html structure different
            if (event.children[0].children[0].href !== undefined) {
              linkToOriginalPost = event.children[0].children[0].getAttribute("href");
              image = event.children[0].children[0].children[0].children[0].src;
              dateTime = event.children[1].children[0].children[0].children[0].children[0].children[0].innerText;
              title = event.children[1].children[0].children[0].children[0].children[0].children[1].innerText
            } else {
              linkToOriginalPost = event.children[0].children[0].children[0].getAttribute("href");
              image = event.children[0].children[0].children[0].children[0].style.backgroundImage.replace("url(\"", "").replace("\")", "");
              dateTime = event.children[0].children[1].children[0].children[0].children[0].innerText;
              title = event.children[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0].innerText;
            }
          } else { // event.childElementCount >= 2
            // linkToOriginalPost
            try {
              linkToOriginalPost = event.children[0].children[0].getAttribute("href");
              if (linkToOriginalPost.substring(0, 5) !== "https") {
                linkToOriginalPost = "#";
              }
            } catch (error) {
              linkToOriginalPost = "#"
            }
            image = event.children[0].children[0].children[0].children[0].src;
            let timeTitleAddressDiv = event.children[1].children[0].children[0].children[0].children[0];
            dateTime = timeTitleAddressDiv.children[0].children[0].innerText;
            // title
            try {
              title = timeTitleAddressDiv.children[1].children[0].children[0].children[0].children[0].innerText;
            } catch (error) {
              title = "null";
            }
          }

          // scrape data based on the structure of Facebook page.

          // let organization = event.children[0].children[1].children[1].children[1].children[0];
          // organizationLink = organization.children[0].getAttribute("href");
          // organizationName = organization.children[0].children[0].innerText;

          
          // singleEvent = { title, image, dateTime, organizationName, organizationLink, linkToOriginalPost };
          singleEvent = { title, image, dateTime, linkToOriginalPost };

          basicResults.push(singleEvent);
        } // End for loop for current group event list
        return basicResults;
      })
    } catch (e) {
      console.log("Evaluate Error: " + scrapingList[i].groupURL);
      console.log(e);
      continue;
    }
     // End page.evaluate

    let resultsFromOneGroup = await scrapeIndividaulEvents(basicInfosFromOneGroup, browser);
    scrapingResults = scrapingResults.concat(resultsFromOneGroup);

    // Progress bar update
    scrapeProgress = Math.floor(((i + 1) / scrapingList.length) * 90);
    scrapeIndex = i + 1;
    // console.log("progress: " + scrapeProgress);
  } // End for loop for scrapingList
  return scrapingResults;
}

// Scrape more information for events from a group.
async function scrapeIndividaulEvents(basicInfosFromOneGroup, browser) {
  let resultsFromOneGroup = [];
  let screenshot;
  // one by one for each event from current group.
  for (let i = 0; i < basicInfosFromOneGroup.length; i++) {
    let resultsFromOneEvent;
    if (basicInfosFromOneGroup[i].linkToOriginalPost === "#") {
      resultsFromOneEvent= { detailDateTime: "null", address: "null", description: "null" }
    } else { // exist link to original post
      // create new page and navigate to the original post of current event to scrape more information
      const pageForOriginalPost = await browser.newPage();
      await pageForOriginalPost.goto(basicInfosFromOneGroup[i].linkToOriginalPost, {
        waitUntil: "networkidle0"
      });
// for test only ------------------------------------
pageForOriginalPost.on('console', consoleObj => console.log(consoleObj.text()));
// for test only ------------------------------------

      // screenshot
      // screenshot = await pageForOriginalPost.screenshot({ encoding: 'base64' });

      // Scrape - ineract with the page directly in the page DOM environment
      await pageForOriginalPost.exposeFunction("splitTime", splitTime);
      resultsFromOneEvent = await pageForOriginalPost.evaluate(async (basicInfosFromOneGroup, i) => {
        const headingElement = document.querySelector(".k4urcfbm.nqmvxvec").children[0].children[0].children[0].children[0];
        let detailDateTime = headingElement.children[0].children[0].children[0].innerText;
        let address = headingElement.children[2].children[0].innerText;

        // description element - if some descriptions are hidden, scraper will click the "see more button" to expand the description
        const detailsElement = document.querySelectorAll(".discj3wi.ihqw7lf3 > .dwo3fsh8")[0].parentNode;

        // document.querySelectorAll(".oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w div[role=button]").forEach(async (seeMoreBtn) => {
        // document.querySelectorAll(".oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w").forEach(async (seeMoreBtn) => {
        //   if (seeMoreBtn.textContent == "See More") {
        //     console.log("see more")
        //     await pageForOriginalPost.click(seeMoreBtn);
        //     await new Promise(resolve => setTimeout(resolve, 2000));
        //   }
        // })
        // See more button for description
        try {
          if (document.querySelectorAll(".discj3wi.ihqw7lf3 > .dwo3fsh8")[0].parentNode.lastChild.children[0].children[0].children.length > 1) {
            document.querySelectorAll(".discj3wi.ihqw7lf3 > .dwo3fsh8")[0].parentNode.lastChild.children[0].children[0].children[1].children[0].click();
          } else {
            document.querySelectorAll(".discj3wi.ihqw7lf3 > .dwo3fsh8")[0].parentNode.lastChild.children[0].children[0].children[0].children[0].click();
          }
          await new Promise(resolve => setTimeout(resolve, 4000));
        } catch (e) {
          console.log(e);
        }

        
        // await new Promise(resolve => setTimeout(resolve, 14000));

        let description = detailsElement.lastChild.children[0].children[0].innerText;

        // organization 
        let organizationInfo = []
        let organizationsStrongDiv = document.querySelectorAll(".qzhwtbm6.knvmm38d > .d2edcug0 > strong")
        organizationsStrongDiv.forEach((element) => {
          let currOrganizationInfo = {};
          currOrganizationInfo.name = element.innerText;
          currOrganizationInfo.link = element.children[0].getAttribute("href");
          // console.log(currOrganizationInfo.link)
          organizationInfo.push(currOrganizationInfo);
        })

        // Map Town State
        let mapUrl;
        // let town;
        // let state;
        try {
          let mapDiv = document.querySelector(".ihqw7lf3 > .oajrlxb2 > .l9j0dhe7.stjgntxs.ni8dbmo4.do00u71z > .kr520xx4.j9ispegn.pmk7jnqg");
          mapUrl = mapDiv.style.backgroundImage.replace("url(\"", "").replace("\")", "");

          let townStateElement = document.querySelector(".j83agx80 > .qzhwtbm6 > .d2edcug0 > .a8c37x1j > .nc684nl6").innerText;
          // town = townStateElement.split(", ")[0];
          // state = townStateElement.split(", ")[1];
        } catch (error) {
          mapUrl = "null";
          // town = "null";
          // state = "null";
        }


        // Ticket
        let ticket = false;
        let ticketLink;
        try {
          // document.querySelectorAll(".d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.ns63r2gh.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.o3w64lxj.b2s5l15y.hnhda86s.oo9gr5id.hzawbc8m").forEach((element) => {
          document.querySelectorAll(".d2edcug0.hpfvmrgz").forEach((element) => {
            if (element.textContent == "Tickets") {
              ticket = true;
              // let ticketDiv = element.parentNode.parentNode.parentNode.parentNode.parentNode;
              // ticketLink = ticketDiv.children[1].children[0].getAttribute("href");
              // console.log(ticketLink);
            }
          })
        } catch (e) {
          console.log("Catch Error (ticket): " + e);
        }


        // Split detailDateTime
        let splittedTime = await splitTime(detailDateTime);

        // Category
        let category = [];
        if (detailsElement.lastChild.children[0].children.length > 1) {
          let categoryDiv = detailsElement.lastChild.children[0].children[1];
          for (let e = 0; e < categoryDiv.children.length; e++) {
            let tag = categoryDiv.children[e].children[0].children[0].children[0].innerText;
            category.push(tag);
          }
        }


        let keywords = "" + detailDateTime + " " + address + " " + description + " " + basicInfosFromOneGroup[i].dateTime + " " + basicInfosFromOneGroup[i].title;

        return { detailDateTime, address, description, organizationInfo, splitTime: splittedTime, mapUrl, ticket, ticketLink, category, keywords };
      }, basicInfosFromOneGroup, i);
      await pageForOriginalPost.close();
    }
    // Combine "basic" data from group page and "additional" data from original post of the event
    let basicInfoOfCurrEvent = basicInfosFromOneGroup[i];
    let moreInfoOfCurrEvent = resultsFromOneEvent;
    let infoOfCurrEvent = {...basicInfoOfCurrEvent, ...moreInfoOfCurrEvent }
    // let infoOfCurrEvent = {...basicInfoOfCurrEvent, ...moreInfoOfCurrEvent, screenshot }
    resultsFromOneGroup.push(infoOfCurrEvent);
    
    // Progress bar update
    let scrapeProgressGroup = (scrapeIndex / scrapingList.length) * 100 
    let scrapeProgressEvent = (((i + 1) / basicInfosFromOneGroup.length) * 90) * (1 / scrapingList.length);
    scrapeProgress = Math.floor(scrapeProgressGroup + scrapeProgressEvent);
  } // end for loop - one by one for each event from current group.
  return resultsFromOneGroup;
}

function getScrapeProgress() {
  return scrapeProgress;
}

function getScraping() {
  return scraping;
}

// export functions
module.exports = { scrapEvents, getScraping, getScrapeProgress };

// for testing only, print out any console.log from page.evaluate
// page.on('console', msg => {
// for (let i = 0; i < msg._args.length; ++i)
//   console.log(`${i}: ${msg._args[i]}`);
// });
