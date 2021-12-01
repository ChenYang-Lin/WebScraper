
let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

let dateObject = (scrapingResults) => {
    for (let i = 0; i < scrapingResults.length; i++) {
        // console.log(scrapingResults);
        let splitTime = scrapingResults[i].splitTime;
        // console.log(splitTime);
        let dateObject;
        
        let objectMonth = splitTime.month.charAt(0).toUpperCase() + splitTime.month.slice(1).toLowerCase();
        let timeHour, timeMin;
        if (splitTime.startTime.includes(":")) {
            let timeStrArr = splitTime.startTime.split(":");
            timeHour = parseInt(timeStrArr[0]);
            timeMin = parseInt(timeStrArr[1]);
        } else {
            timeHour = parseInt(splitTime.startTime);
            timeMin = 0;
        }
        timeHour %= 12;
        if (splitTime.am_pm === "PM") {
            timeHour += 12;
        }
        timeHour %= 24;
        let year = splitTime.year;
        let month = months.indexOf(objectMonth);
        let day = splitTime.dayOfTheMonth;
        let hour = timeHour;
        let minute = timeMin;
        
        dateObject = new Date(year, month, day, hour, minute, 0, 0);
        if (splitTime.isUTC) {
            dateObject = new Date(Date.UTC(year, month, day, hour, minute, 0, 0));
        }
        
        // dateObject = JSON.stringify(dateObject);
        // console.log(dateObject);

        let dateTime = dateObject.toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: "long", timeStyle: "short" });

        
        scrapingResults[i] = {...scrapingResults[i], dateObject, dateTime} ;
    }
    return scrapingResults;
}

// export functions
module.exports = { dateObject };