require('dotenv').config();
const calculateMetrics = require('./metrics.js');
const emailVideos = require('./email.js');
const getVideos = require('./youtube.js');




main();

async function main() {
  let emailText = '';
  let videos = getVideos();
  videos.then((ret) => {
    console.log('ret is: ')
    console.log(ret)
  })
  
  // getSubscriberCount()
  //   .then(getVideoStatistics)
  //   .then(async () => {
  //     await calculateMetrics(videos);
  //     videos.forEach((video) => {
  //       emailText += `https://www.youtube.com/watch?v=${video.videoId}\n`;
  //       console.log(`https://www.youtube.com/watch?v=${video.videoId}`);
  //     });
  //     emailVideos(emailText);
    // });
}






