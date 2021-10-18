require("dotenv").config();
const puppeteer = require("puppeteer");

let scrapingList = [];
let errorMessages = [];

let scrapEvents = async (list) => {
  scrapingList = list;
  try {
    console.log("running scapEvents function");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        '--disable-setuid-sandbox',
      ],
    });
    const page = await browser.newPage();

    // Login
    await loginFacebook(page);
    // Scrapping
    let scrapingResults = await scrapeFacebookEvents(browser, page);
    // close browser
    await browser.close();

    console.log("completed scapEvents function");
    return scrapingResults;
  } catch (error) {
    console.log(error)
    return [];
  }
};

async function loginFacebook(page) {
  // Go to the login page
  await page.goto("https://www.facebook.com/login/", {
    waitUntil: "networkidle0",
  });
  // username and password
  await page.type("#email", process.env.EMAIL, { delay: 30 });
  await page.type("#pass", process.env.PASSWORD, { delay: 30 });
  await page.click("#loginbutton");

  // Wait for navigation to finish
  await page.waitForNavigation({ waitUntil: "networkidle0" });
}

async function scrapeFacebookEvents(browser, page) {
  let singleEvent;
  let scrapingResults = [];

  // Scrape facebook groups one by one from scrapingList
  for (let i = 0; i < scrapingList.length; i++) {
    try {
      await page.goto(scrapingList[i] + "/events", {
        waitUntil: "networkidle0"
      });
    } catch (e) {
      console.log("Error: " + scrapingList[i]);
      console.log(e);
      continue;
    }

    // Ineract with the page directly in the page DOM environment
    const basicInfosFromOneGroup = await page.evaluate(async () => {
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
      let numberOfEvents
      if (document.querySelectorAll('.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi > .gm7ombtx').length > 0 || document.querySelectorAll('.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi > .gh3ezpug').length > 0){
        return basicResults;
      } else {        
        numberOfEvents = UpcomingEventsElement.children.length;
      }

      // scrape events one by one from current group event list.
      for (let j = 1; j < numberOfEvents; j++) {  
        // loop starts from 1 because first element of div is title => "Upcoming Events" text container
        let event = UpcomingEventsElement.children[j];
        let linkToOriginalPost, image, dateTime, title;
        // The sturcture of Facebook events pages are slightly different, This if statement helps build more consistency.
        if (event.childElementCount < 2) {
          linkToOriginalPost = event.children[0].children[0].children[0].getAttribute("href");
          image = event.children[0].children[0].children[0].children[0].style.backgroundImage.replace("url(\"", "").replace("\")", "");
          dateTime = event.children[0].children[1].children[0].children[0].children[0].innerText;
          title = event.children[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0].innerText;
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
    }).catch (error => {
        console.log("Evaluate Error: " + scrapingList[i]);
        console.log(error)
    })
     // End page.evaluate

    let resultsFromOneGroup = await scrapeIndividaulEvents(basicInfosFromOneGroup, browser);
    scrapingResults = scrapingResults.concat(resultsFromOneGroup);
  } // End for loop for scrapingList
  return scrapingResults;
}

// Scrape more information for events from a group.
async function scrapeIndividaulEvents(basicInfosFromOneGroup, browser) {
  let resultsFromOneGroup = [];
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
      pageForOriginalPost.on('console', msg => {
for (let i = 0; i < msg._args.length; ++i)
  console.log(`${i}: ${msg._args[i]}`);
});
// for test only ------------------------------------
      // Scrape - ineract with the page directly in the page DOM environment
      resultsFromOneEvent = await pageForOriginalPost.evaluate(async () => {
        const headingElement = document.querySelector(".k4urcfbm.nqmvxvec").children[0].children[0].children[0].children[0];
        let detailDateTime = headingElement.children[0].children[0].children[0].innerText;
        let address = headingElement.children[2].children[0].innerText;

        // description element - if some descriptions are hidden, scraper will click the "see more button" to expand the description
        const detailsElement = document.querySelectorAll(".discj3wi.ihqw7lf3 > .dwo3fsh8")[0].parentNode;
        let seeMoreBtn;
        if (detailsElement.lastChild.children[0].children[0].childNodes.length > 2) {
          seeMoreBtn = detailsElement.lastChild.children[0].children[0].children[0];
          await seeMoreBtn.click();
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
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

        // Split detailDateTime
        let dayOfTheWeek, month, dayOfTheMonth, year, startTime, am_pm;
        if (dayOfTheWeek = detailDateTime.split(", ").length === 1) {
          // let now = new Date();
          // let dayOfWeek = now.getDay(); 
          // let numDay = now.getDate();
        } else {
          dayOfTheWeek = detailDateTime.split(", ")[0];
          month = detailDateTime.split(", ")[1].split(" ")[0];
          dayOfTheMonth = detailDateTime.split(", ")[1].split(" ")[1];
          year = detailDateTime.split(", ")[2].split(" ")[0];
          startTime = detailDateTime.split(", ")[2].split(" ")[2];
          am_pm = detailDateTime.split(", ")[2].split(" ")[3];
        }


        let splitTime = { dayOfTheWeek, month, dayOfTheMonth, year, startTime, am_pm };


        return { detailDateTime, address, description, organizationInfo, splitTime, mapUrl };
      });
      await pageForOriginalPost.close();
    }
    // Combine "basic" data from group page and "additional" data from original post of the event
    let basicInfoOfCurrEvent = basicInfosFromOneGroup[i];
    let moreInfoOfCurrEvent = resultsFromOneEvent;
    let infoOfCurrEvent = {...basicInfoOfCurrEvent, ...moreInfoOfCurrEvent}
    resultsFromOneGroup.push(infoOfCurrEvent);
  } // end for loop - one by one for each event from current group.
  return resultsFromOneGroup;
}

// export functions
module.exports = { scrapEvents };

// for testing only, print out any console.log from page.evaluate
// page.on('console', msg => {
// for (let i = 0; i < msg._args.length; ++i)
//   console.log(`${i}: ${msg._args[i]}`);
// });
