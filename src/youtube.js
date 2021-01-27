const { google } = require("googleapis");
const moment = require("moment");

const WITHIN_DAYS_PUBLISHED = 1;
let videos = new Map();

module.exports = async function getVideos() {
  let nextPageToken = "";

  for (let i = 0; i < 3; i++) {
    nextPageToken = await getYoutubeVideos(nextPageToken);
  }
  await getSubscriberCount();
  await getVideoStatistics();

  return videos;
};

function getYoutubeVideos(nextPageToken = "") {
  console.log("Inside getYoutubeVideos()");
  return new Promise((resolve, reject) => {
    google
      .youtube("v3")
      .search.list({
        key: process.env.YOUTUBE_TOKEN,
        part: "snippet",
        q:
          "software developer|software engineer|programmer|computer science|coding",
        maxResults: 2,
        publishedAfter: calculatePublishAfterDate(),
        relevanceLanguage: "en",
        type: "video",
        pageToken: nextPageToken,
      })
      .then((response) => {
        const { data } = response;
        nextPageToken = data.nextPageToken;
        //   console.log(data);
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

function getVideoStatistics() {
  let promises = [];
  videos.forEach((video) => {
    promises.push(
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
