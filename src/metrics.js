module.exports =  async function calculateMetrics(videos) {
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

  