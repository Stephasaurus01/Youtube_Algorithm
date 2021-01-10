require('dotenv').config();

const { google } = require('googleapis');

google
  .youtube('v3')
  .search.list({
    key: process.env.YOUTUBE_TOKEN,
    part: 'snippet',
    q: 'software developer',
    maxResults: 50,
    publishedAfter: calculatePublishAfterDate(),
  })
  .then((response) => {
    const { data } = response;
    data.items.forEach((item) => {
      //loop through each video and check the metrics
      console.log('====================================');
      console.log(item.snippet.title);
      console.log('====================================');
    });
  })
  .catch((err) => {
    console.log(err);
  });

function calculatePublishAfterDate() {
  //creates Date object with today's date
  let date = new Date();
  //Getting the date from 7 days ago
  date.setDate(date.getDate() - 7);

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${year}-${month}-${day}T00:00:00Z`;
}
