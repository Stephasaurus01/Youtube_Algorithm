require("dotenv").config();
const calculateMetrics = require("./metrics.js");
const emailVideos = require("./email.js");
const getVideos = require("./youtube.js");
const logger = require("./logger.js");

main();

async function main() {
  logger.info("----------------------------------");
  let emailText = "";
  let videos = await getVideos();
  logger.info(`Number of Videos returned by youtube: ${videos.size}`);
  videos = calculateMetrics(videos);
  logger.info(`Number of Videos after metrics: ${videos.size}`);
  videos.forEach((video) => {
    emailText += `https://www.youtube.com/watch?v=${video.videoId}\n`;
    console.log(`https://www.youtube.com/watch?v=${video.videoId}`);
  });
  emailVideos(emailText);
}
