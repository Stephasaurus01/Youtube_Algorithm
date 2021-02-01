const { google } = require("googleapis");
const moment = require("moment");
const queryTerms = require("./query-terms.js");

const WITHIN_DAYS_PUBLISHED = 1;
let videos = new Map();

async function getVideos() {
  let nextPageToken = "";
  let currentDayOfWeek = getCurrentDayOfWeek();

  for (let i = 0; i < 3; i++) {
    nextPageToken = await getVideosFromYoutube(nextPageToken, currentDayOfWeek);
  }
  // await getSubscriberCount();
  // await getVideoStatistics();
  console.log("Here");
  return videos;
}

function getVideosFromYoutube(nextPageToken = "", currentDayOfWeek) {
  return new Promise((resolve, reject) => {
    google
      .youtube("v3")
      .search.list({
        key: process.env.YOUTUBE_TOKEN,
        part: "snippet",
        q: queryTerms[currentDayOfWeek],
        maxResults: 2,
        publishedAfter: calculatePublishAfterDate(),
        relevanceLanguage: "en",
        type: "video",
        pageToken: nextPageToken,
      })
      .then((response) => {
        const { data } = response;
        nextPageToken = data.nextPageToken;
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
        .youtube("v3")
        .channels.list({
          key: process.env.YOUTUBE_TOKEN,
          id: video.channelId,
          part: "statistics",
        })
        .then((response) => {
          const { data } = response;
          data.items.forEach((item) => {
            let subscriberCount = item.statistics.subscriberCount;
            video["subscriberCount"] = subscriberCount;
            videos.set(video.videoId, video);
          });
        });
    });
    resolve();
  });
}

function getVideoStatistics(vids) {
  let promises = [];
  console.log("=====================");
  console.log(vids);
  console.log("=====================");
  return Promise.all(
    vids.forEach(function (video) {
      // vids.forEach((video) => {
      // promises.push(
      google
        .youtube("v3")
        .videos.list({
          key: process.env.YOUTUBE_TOKEN,
          id: video.videoId,
          part: "statistics, contentDetails",
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
            // vids.set(video.videoId, video);
            // https://stackoverflow.com/questions/34813147/promise-all-is-returning-an-array-of-undefined
            return Promise.resolve(video);
          });
        });
    })
  );

  // );
}

function calculatePublishAfterDate() {
  let date = new Date();
  date.setDate(date.getDate() - WITHIN_DAYS_PUBLISHED);

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${year}-${month}-${day}T00:00:00Z`;
}

function getCurrentDayOfWeek() {
  let currentDayOfWeek = new Date().getDate();
  return currentDayOfWeek;
}

module.exports = { getVideos, getVideoStatistics };
