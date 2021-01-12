require('dotenv').config();

const { google } = require('googleapis');
let videos = new Map();

main();

function main() {
  getYoutubeVideos();
}

function getYoutubeVideos() {
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
        videos.set(item.id.videoId, {
          videoId: item.id.videoId,
          channelId: item.snippet.channelId,
          title: item.snippet.title,
        });
        console.log(videos);
      });
    })
    .then((response) => {
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
              console.log(videos);
            });
          });
      });
    })
    .then((response) => {
      videos.forEach((video) => {
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
              let viewCount = item.statistics.viewCount;
              let likeCount = item.statistics.likeCount;
              let dislikeCount = item.statistics.dislikeCount;
              video['viewCount'] = viewCount;
              video['likeCount'] = likeCount;
              video['dislikeCount'] = dislikeCount;
              videos.set(video.videoId, video);
              videos.set(video.videoId, video);
              videos.set(video.videoId, video);
            });
          });
      });
    })
    .catch((err) => console.log(err));
}

function getViewCount(videoId) {
  google
    .youtube('v3')
    .videos.list({
      key: process.env.YOUTUBE_TOKEN,
      id: videoId,
      part: 'statistics',
    })
    .then((response) => {
      const { data } = response;
      data.items.forEach((item) => {
        // return 'TESTING VIEW COUNT';
      });
    })
    .catch((err) => console.log(err));
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

function getVideoInfo(videoId) {
  google
    .youtube('v3')
    .videos.list({
      key: process.env.YOUTUBE_TOKEN,
      id: videoId,
      part: 'statistics',
    })
    .then((response) => {
      const { data } = response;
      data.items.forEach((item) => {
        //loop through each video and check the metrics
        console.log('====================================');
        console.log(item.id.channelId);
        console.log('====================================');
        calculateMetrics(item.statistics);
      });
    })
    .catch((err) => console.log(error));
}

function calculateMetrics(statistics, channelId) {
  //TODO - Implement Functions Below
  hasValidViewCount(statistics.viewCount);
  getSubscriberCount(channelId);
  // hasValidSubscriberCount();
  // hasValidViewsToSubscriberRatio();
}

function hasValidViewCount(viewCount) {
  return viewCount > 500;
}

function getSubscriberCount(channelId) {
  google
    .youtube('v3')
    .channels.list({
      key: process.env.YOUTUBE_TOKEN,
      id: channelId,
      part: 'statistics',
    })
    .then((response) => {
      const { data } = response;
      data.items.forEach((item) => {
        //loop through each video and check the metrics
      });
    })
    .catch((err) => console.log(error));
}

function hasValidSubscriberCount(subscriberCount) {
  return subscriberCount > 100;
}

function hasValidViewsToSubscriberRatio(viewCount, subscriberCount) {
  let ratio = viewCount / subscriberCount;
  let score = viewCount * min(ration, 5);
  return true;
}
