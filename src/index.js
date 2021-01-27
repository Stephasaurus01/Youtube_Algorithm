require("dotenv").config();
const calculateMetrics = require("./metrics.js");
const emailVideos = require("./email.js");
const getVideos = require("./youtube.js");

main();

async function main() {
  let emailText = "";
  let videos = await getVideos();

  videos = calculateMetrics(videos);

  videos.forEach((video) => {
    emailText += `https://www.youtube.com/watch?v=${video.videoId}\n`;
    console.log(`https://www.youtube.com/watch?v=${video.videoId}`);
  });

  emailVideos(emailText);
}
