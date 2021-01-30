module.exports = function calculateMetrics(videos) {
  let vids = videos;
  vids.forEach((video) => {
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
      vids.delete(key);
    }
  });
  return vids;
};

function hasValidViewCount(viewCount) {
  return viewCount > 50 && viewCount < 8000;
}

function hasValidSubscriberCount(subscriberCount) {
  return subscriberCount > 200;
}

function hasValidDuration(duration) {
  return duration > 120;
}
