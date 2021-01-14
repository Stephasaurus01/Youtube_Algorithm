require('dotenv').config();

const { google } = require('googleapis');
let videos = new Map();

main();

async function main() {
  getYoutubeVideos()
    .then(getSubscriberCount)
    .then(getVideoStatistics)
    .then((res) => {
      Promise.all(res).then(() => {
        calculateMetrics();
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function getYoutubeVideos() {
  return new Promise((resolve, reject) => {
    google
      .youtube('v3')
      .search.list({
        key: process.env.YOUTUBE_TOKEN,
        part: 'snippet',
        q: 'software developer',
        maxResults: 2,
        publishedAfter: calculatePublishAfterDate(),
      })
      .then((response) => {
        const { data } = response;
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
        resolve();
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
          part: 'statistics',
        })
        .then((response) => {
          const { data } = response;
          data.items.forEach((item) => {
            const { viewCount, likeCount, dislikeCount } = item.statistics;
            Object.assign(video, { viewCount, likeCount, dislikeCount });
            videos.set(video.videoId, video);
            console.log(videos);
          });
        })
    );
  });
  return promises;
}

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

function calculateMetrics() {
  videos.forEach((video) => {
    if (!hasValidViewCount(video.viewCount)) return false;
    if (!getSubscriberCount(video.subscriberCount)) return false;
  });

  //TODO - Implement Functions Below
  // hasValidSubscriberCount();
  // hasValidViewsToSubscriberRatio();
}

function hasValidViewCount(viewCount) {
  return viewCount > 500;
}

function hasValidSubscriberCount(subscriberCount) {
  return subscriberCount > 100;
}

function hasValidViewsToSubscriberRatio(viewCount, subscriberCount) {
  let ratio = viewCount / subscriberCount;
  let score = viewCount * min(ration, 5);
  return true;
}
