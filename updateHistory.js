const fs = require('fs');
const oldHistory = require('./histórico-de-visualização.json');
const musicSnippetsObj = require('./music_snippets_obj.json');

// Copying might not be best, but it is quick
let uniqueIdList = new Set();
function updateHistory(oldHistoryList, snippets) {
  const newHistory = oldHistoryList.reduce((acc, videoObj) => {
    if (!(typeof videoObj.titleUrl === 'string')) {
      return [...acc, { ...videoObj, error: 'No URL' }];
    }

    const videoId = videoObj.titleUrl.split('?v=')[1];
    if (uniqueIdList.has(videoId)) return acc;
    uniqueIdList.add(videoId);

    if (!(videoId in snippets)) {
      return [...acc, { ...videoObj, error: 'Not found' }];
    }

    return [...acc, { ...videoObj, ...snippets[videoId] }];
  }, []);

  fs.writeFile('./new_history.json', JSON.stringify(newHistory), err => { if (err) console.error(err) });
  console.log([...uniqueIdList].length)
  return newHistory;
}

updateHistory(oldHistory, musicSnippetsObj);
