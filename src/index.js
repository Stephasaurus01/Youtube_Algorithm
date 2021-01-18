require('dotenv').config();
const { google } = require('googleapis');
let videos = new Map();

main();

function main() {
  getYoutubeVideos()
    .then(getSubscriberCount)
    .then(getVideoStatistics)
    .then(() => {
      calculateMetrics();
      videos.forEach((video) =>
        console.log(`https://www.youtube.com/watch?v=${video.videoId}`)
      );
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
        maxResults: 20,
        publishedAfter: calculatePublishAfterDate(),
        relevanceLanguage: 'en',
        type: 'video',
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
  return Promise.all(promises);
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
    let validVideo = true;
    if (!hasValidViewCount(video.viewCount)) {
      validVideo = false;
    }
    if (!hasValidSubscriberCount(video.subscriberCount)) {
      validVideo = false;
    }

    if (!validVideo) {
      let key = video.videoId;
      videos.delete(key);
    }
  });
  //TODO - Implement Functions Below
  // hasValidViewsToSubscriberRatio();
}

function hasValidViewCount(viewCount) {
  return viewCount > 500 && viewCount < 5000;
}

function hasValidSubscriberCount(subscriberCount) {
  return subscriberCount > 300;
}

function hasValidViewsToSubscriberRatio(viewCount, subscriberCount) {
  let ratio = viewCount / subscriberCount;
  let score = viewCount * min(ration, 5);
  return true;
}
