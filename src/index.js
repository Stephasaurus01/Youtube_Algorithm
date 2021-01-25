require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const moment = require('moment');
const puppeteer = require('puppeteer');

const WITHIN_DAYS_PUBLISHED = 1;

let videos = new Map();
main();

async function main() {
openYoutubeVideos();

  let nextPageToken = '';
  let emailText = '';

  for (let i = 0; i < 6; i++) {
    nextPageToken = await getYoutubeVideos(nextPageToken);
  }
  getSubscriberCount()
    .then(getVideoStatistics)
    .then(() => {
      calculateMetrics();
      videos.forEach((video) => {
        emailText += `https://www.youtube.com/watch?v=${video.videoId}\n`;
        console.log(`https://www.youtube.com/watch?v=${video.videoId}`);
      });
      // emailVideos(emailText);
      // openYoutubeVideos();
    });
}

function getYoutubeVideos(nextPageToken = '') {
  return new Promise((resolve, reject) => {
    google
      .youtube('v3')
      .search.list({
        key: process.env.YOUTUBE_TOKEN,
        part: 'snippet',
        q:
          'software developer|software engineer|programmer|computer science|coding',
        maxResults: 2,
        publishedAfter: calculatePublishAfterDate(),
        relevanceLanguage: 'en',
        type: 'video',
        pageToken: nextPageToken,
      })
      .then((response) => {
        const { data } = response;
        nextPageToken = data.nextPageToken;
        console.log(data);
        data.items.forEach((item) => {
          const { videoId } = item.id;
          const { channelId, title, publishedAt } = item.snippet;
          videos.set(videoId, {
            videoId: videoId,
            channelId: channelId,
            title: title,
            publishedDate: publishedAt,
          });
        });
        resolve(nextPageToken);
      });
  });
}

function getSubscriberCount() {
  return new Promise((resolve, reject) => {
    videos.forEach((video) => {
      google
        .youtube('v3')
        .channels.list({
          key: process.env.YOUTUBE_TOKEN,
          id: video.channelId,
          part: 'statistics',
        })
        .then((response) => {
          const { data } = response;
          data.items.forEach((item) => {
            let subscriberCount = item.statistics.subscriberCount;
            video['subscriberCount'] = subscriberCount;
            videos.set(video.videoId, video);
          });
        });
    });
    resolve();
  });
}

function getVideoStatistics() {
  let promises = [];
  videos.forEach((video) => {
    promises.push(
      google
        .youtube('v3')
        .videos.list({
          key: process.env.YOUTUBE_TOKEN,
          id: video.videoId,
          part: 'statistics, contentDetails',
        })
        .then((response) => {
          const { data } = response;
          data.items.forEach((item) => {
            const { viewCount, likeCount, dislikeCount } = item.statistics;
            const { duration } = item.contentDetails;
            let durationInSeconds = moment
              .duration(duration, moment.ISO_8601)
              .asSeconds();
            Object.assign(video, {
              viewCount,
              likeCount,
              dislikeCount,
              durationInSeconds,
            });
            videos.set(video.videoId, video);
          });
        })
    );
  });
  return Promise.all(promises);
}

function calculatePublishAfterDate() {
  //creates Date object with today's date
  let date = new Date();
  //Getting the date from 7 days ago
  date.setDate(date.getDate() - WITHIN_DAYS_PUBLISHED);

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${year}-${month}-${day}T00:00:00Z`;
}

function calculateMetrics() {
  videos.forEach((video) => {
    let validVideo = true;
    if (!hasValidViewCount(video.viewCount)) {
      validVideo = false;
    }
    if (!hasValidSubscriberCount(video.subscriberCount)) {
      validVideo = false;
    }
    if (!hasValidDuration(video.durationInSeconds)) {
      validVideo = false;
    }

    if (!validVideo) {
      let key = video.videoId;
      videos.delete(key);
    }
  });
}

function hasValidViewCount(viewCount) {
  return viewCount > 50 && viewCount < 5000;
}

function hasValidSubscriberCount(subscriberCount) {
  return subscriberCount > 200;
}

function hasValidDuration(duration) {
  return duration > 120;
}

function emailVideos(emailText) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.TO_EMAIL,
    subject: 'Youtube Videos for: ',
    text: emailText,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email has been sent!!');
    }
  });
}

async function openYoutubeVideos() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.youtube.com');
  await page.waitForSelector('#dismiss-button > yt-button-renderer > a')
  await page.click('#dismiss-button > yt-button-renderer > a')
  await page.waitForSelector('#introAgreeButton > span > span')
  if (await page.$('#introAgreeButton > span > span') !== null){ console.log('found')} else {console.log('not found')}
  // await page.waitForSelector('#introAgreeButton')
  // await page.click('#introAgreeButton')
}