
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
        
        let startTime24 = parseInt(splitTime.startTime);
        if (splitTime.am_pm === "PM") {
            startTime24 += 12;
        }
        startTime24 %= 12;
        let year = splitTime.year;
        let month = months.indexOf(objectMonth);
        let day = splitTime.dayOfTheMonth;
        let hour = startTime24;
        
        dateObject = new Date(year, month, day, hour, 0, 0, 0);
        if (splitTime.isUTC) {
            dateObject = new Date(Date.UTC(year, month, day, hour, 0, 0, 0));
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