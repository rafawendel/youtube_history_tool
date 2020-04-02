const fs = require('fs');
const videoHistory = require('./new_history.json');

function arrGroupBy(array, testCb) {
  return array.reduce((acc, curr) => (
    testCb(curr) ?  [[...acc[0], curr], [...acc[1]]] : [[...acc[0]], [...acc[1], curr]]
  ), [[], []])
}

function videoSortCb(a, b) {
  return (new Date(a.time)) > (new Date(b.time))
} 

function organiseVideos(videoHistory) {
  const [successfullVideosArr, failVideosArr] = arrGroupBy(videoHistory, video => !('error' in video));
  successfullVideosArr.sort(videoSortCb);
  failVideosArr.sort(videoSortCb);

  fs.writeFile('./organised_updated_videos.json', JSON.stringify(successfullVideosArr), err => { if (err) console.error(err) });
  fs.writeFile('./organised_outdated_videos.json', JSON.stringify(failVideosArr), err => { if (err) console.error(err) });
  return [successfullVideosArr, failVideosArr];
}

organiseVideos(videoHistory);
