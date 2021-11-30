const MONTH = [
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

const MONTH_ABBR = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
]

const DAY = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
]

let splitTime = (detailDateTime) => {
    let dayOfTheWeek, month, dayOfTheMonth, year, startTime, endTime, am_pm, isUTC;
    
    if (detailDateTime.indexOf('TODAY') > -1) {
        // console.log("today");
        const date = new Date();

        dayOfTheWeek = DAY[date.getDay()];
        month = MONTH[date.getMonth()];
        dayOfTheMonth = date.getDate().toString();
        year = date.getFullYear().toString();

        let time = detailDateTime.split("AT")[1].split(" ");
        startTime = time[1].toString();
        am_pm = time[2].toString();
    } else if (detailDateTime.indexOf('TOMORROW') > -1) {
        // console.log("tomorrow");
        const date = new Date();
        date.setDate(date.getDate() + 1);

        dayOfTheWeek = DAY[date.getDay()];
        month = MONTH[date.getMonth()];
        dayOfTheMonth = date.getDate().toString();
        year = date.getFullYear().toString();

        let time = detailDateTime.split("AT")[1].split(" ");
        startTime = time[1].toString();
        am_pm = time[2].toString();
    } else if ((detailDateTime.match(/\,/g) || []).length === 0) {
        let word = detailDateTime.split(" ")[0];
        // if first word is day of the week e.g. Sunday
        if (DAY.indexOf(word) > -1) {
            const date = new Date();

            let givenDay = DAY.indexOf(detailDateTime.split(" ")[0]);
            dayOfTheWeek = date.getDay();

            if (dayOfTheWeek < givenDay) {
                date.setDate(date.getDate() + (givenDay - dayOfTheWeek));
            } else if (dayOfTheWeek > givenDay) {
                date.setDate(date.getDate() + ((7 - dayOfTheWeek) + givenDay));
            } else {
                date.setDate(date.getDate());
            }

            dayOfTheWeek = DAY[date.getDay()];
            month = MONTH[date.getMonth()];
            dayOfTheMonth = date.getDate().toString();
            year = date.getFullYear().toString();

            let time = detailDateTime.split(" AT ")[1].split(" ");
            startTime = time[0].toString();
            // console.log(detailDateTime.split(" AT ")[1]);
            am_pm = time[1].toString();
        }
        // if first word is abbr month e.g. JAN
        if (MONTH_ABBR.indexOf(word) > -1) {
            let str = detailDateTime.split(" ");
            const date = new Date();

            dayOfTheWeek = "Monday";
            month = MONTH[MONTH_ABBR.indexOf(str[0])];
            dayOfTheMonth = str[1];
            year = date.getFullYear().toString();
            startTime = str[3];
            am_pm = str[4];
        }
    } else {
        try {
            dayOfTheWeek = detailDateTime.split(", ")[0];
            month = detailDateTime.split(", ")[1].split(" ")[0];
            dayOfTheMonth = detailDateTime.split(", ")[1].split(" ")[1];
            year = detailDateTime.split(", ")[2].split(" ")[0];
            startTime = detailDateTime.split(", ")[2].split(" ")[2];
            am_pm = detailDateTime.split(", ")[2].split(" ")[3];
        } catch (e) {
            console.log(e);
        }
    }

    // check if time is UTC
    let s = detailDateTime.split(" ");
	if (s[s.length - 1] === "UTC") {
        isUTC = true;
    } else {
        isUTC = false;
    }

    // Figure out endtime
    if (detailDateTime.includes("–")) {
        let endTimeStrArr = detailDateTime.split("–")[1].split(" ");
        endTimeStrArr.forEach((element, index) => {
            if (element === "AM" || element === "PM") {
                endTimeStr = endTimeStrArr[index - 1];
                endTimeStr = (endTimeStr + 12 - 5) % 12;
                endTime = endTimeStr;
                if (!endTimeStr.includes(":")) {
                    endTime = endTime + ":00" + " " + element;
                }
                return;
            }
        })
    } 

    let splitTime = { dayOfTheWeek, month, dayOfTheMonth, year, startTime, endTime, am_pm, isUTC };
    return splitTime;
}

// export functions
module.exports = { splitTime };