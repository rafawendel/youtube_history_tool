const fs = require('fs');
const videoHistoryList = require('./histórico-de-visualização.json');

function processVideoList(size = process.argv[2] || Infinity) {
  const videoIdList = videoHistoryList.reduce((acc, videoObj, i) => (
      i >= size ? acc :
      typeof videoObj.titleUrl === 'string'
      ? [...acc, videoObj.titleUrl.split('?v=')[1]]
      : [...acc, 'Error: not found']
    ), []);
  const uniqueIds = new Set(videoIdList);
  fs.writeFile('./video_ids.json', JSON.stringify([...uniqueIds]), err => { if (err) console.error(err) });
  return videoIdList;
}

processVideoList();
