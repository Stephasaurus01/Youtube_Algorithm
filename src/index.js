require('dotenv').config();
const { google } = require('googleapis');
const moment = require('moment');
let videos = new Map();

main();

async function main() {
  let nextPageToken = '';
  for (let i = 0; i < 4; i++) {
    nextPageToken = await getYoutubeVideos(nextPageToken);
  }
  getSubscriberCount()
    .then(getVideoStatistics)
    .then(() => {
      calculateMetrics();
      videos.forEach((video) =>
        console.log(`https://www.youtube.com/watch?v=${video.videoId}`)
      );
    });
}

function getYoutubeVideos(nextPageToken = '') {
  return new Promise((resolve, reject) => {
    google
      .youtube('v3')
      .search.list({
        key: process.env.YOUTUBE_TOKEN,
        part: 'snippet',
        q: 'software developer|software engineer|programmer',
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
  console.log(`Sub No of Videos: ${videos.size}`);
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
  console.log(`STATS No of Videos: ${videos.size}`);
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
            // console.log(videos);
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
    if (!hasValidDuration(video.durationInSeconds)) {
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
  return viewCount > 50 && viewCount < 5000;
}

function hasValidSubscriberCount(subscriberCount) {
  return subscriberCount > 200;
}

function hasValidViewsToSubscriberRatio(viewCount, subscriberCount) {
  let ratio = viewCount / subscriberCount;
  let score = viewCount * min(ration, 5);
  return true;
}

function hasValidDuration(duration) {
  return duration > 120;
}
