https://cs410-web-scraper.herokuapp.com/
# WebScraper
<h4>Clone Repository</h4>
navigate to a directory in terminal and type <b>git clone https:<span></span>//github.com/ChenYang-Lin/WebScraper.git</b>

<h4>After Cloning Repository</h4>
navigate to the root directory. In this case <b>cd WebScraper</b>
<br>
then type <b>npm i</b> command and press enter to install all node modules used in this project.
<br>
then type <b>npm start</b> command and press enter to start server. The website will be up and running on localhost port 3000. So go to <b>http://localhost:3000/</b> to see results.
<br>
<hr>
It takes some time for server to srape events. If you visit localhost:3000 immediately after the server starts, there is a sentence telling you to revisit later.
<br>
<br>
For testing purposes, when the server starts, there will be a blue chromium icon pop up on the screen and start scraping. After the blue chromuim browser closed by itself, refresh or revisit localhost, and a list of upcoming events will be displayed on the website.
<br>
<br>
Keep in mind that there may have multiple blue chromuim brosers running at the same time. This is normal because we scheduled to run a scraping every minute for testing purposes. As long you don't manually close the browser, everything will proceed normally.

