// const request = require('request');
// const cheerio = require('cheerio');

// let gengerateProxy = async () => {

//     let ip_addresses = [];
//     let port_numbers = [];
//     let ip;

//     function doRequest() {
//         return new Promise((resolve, reject) => {
//             let url = "https://us-proxy.org/";
//             // let url = "https://sslproxies.org/";
//             request(url, (error, response, html) => {
//                 if (!error && response.statusCode == 200) {
//                     // let html = res.body;
//                     // console.log(res)
//                     // console.log(html);
//                     const $ = cheerio.load(html);

//                     $("td:nth-child(1)").each(function(index, value) {
//                         ip_addresses[index] = $(this).text();
//                     });

//                     $("td:nth-child(2)").each(function(index, value) {
//                         port_numbers[index] = $(this).text();
//                     });
                    
//                 } else {
//                     console.log("Error loading proxy, please try again");
//                     reject(error);
//                 }

//                 console.log("IP Addresses:", ip_addresses);
//                 console.log("Port Numbers:", port_numbers);
//                 resolve("body");
//             });
//         })
//     }

//     await doRequest();

//     let index = Math.floor(Math.random() * ip_addresses.length);
//     let randomIP = ip_addresses[index];
//     let randomPort = port_numbers[index];
//     ip = "" + randomIP + ":" + randomPort;
//     console.log(ip);
//     return ip;
// }

// // gengerateProxy();

// // export functions
// module.exports = { gengerateProxy };