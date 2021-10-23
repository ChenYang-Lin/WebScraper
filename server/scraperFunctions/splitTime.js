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
    let dayOfTheWeek, month, dayOfTheMonth, year, startTime, am_pm;
    
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

        let time = detailDateTime.split("AT")[1].split(" ");
        startTime = time[1].toString();
        am_pm = time[2].toString();
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


    let splitTime = { dayOfTheWeek, month, dayOfTheMonth, year, startTime, am_pm };
    return splitTime;
}

// export functions
module.exports = { splitTime };