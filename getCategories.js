const axios = require('axios');
const fs = require('fs');
const KEY = require('./key.json');

async function batchFetchIds(idList, request, errorsArr = [], onSuccessCb = i => i) {
  return await Promise.all(idList.map((id, i) => {
    if (i < 0 || i >= 50) return null;
    const { key } = KEY;
    if (typeof id !== 'string' || id.length !== 11) return new Error(`ID "${id}" is invalid`);
    return request.get('/videos', {
      params: {
        part: 'snippet',
        key,
        id
      }
    }).catch(err => { errorsArr.push(err) })
      .then(onSuccessCb);
  }));
}

function generateVideoSnippetsObj(rawVideosList) {
  return rawVideosList.reduce((acc, response) => {
    if (!response || response instanceof Error) return acc;
    const video = response.items[0];
    if (!video) return acc;

    //Filters out videos that are not categorized as "music"
    if (video.snippet.categoryId !== '10') return acc;

    return { ...acc, [video.id]: video.snippet };
  }, {})
}

async function requestVideoApi() {
  const videoIdList = require('./video_ids.json');
  const alreadyListedSnippets = require('./video_snippets_obj.json') || {};
  const request = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    headers: {
      Accept: 'application/json'
    }
  });

  try {
    const remaininigVideoIdList = videoIdList.filter(id => !(id in alreadyListedSnippets));
    
    let errors = [];
    const responses = await batchFetchIds(
      remaininigVideoIdList,
      request,
      errors,
      res => res && res.data || new Error('No response'));

    const videoSnippetsObj = generateVideoSnippetsObj(responses);
    const remainingVideos = remaininigVideoIdList.filter(id => !(id in videoSnippetsObj)); //&& !(responses[i] instanceof Error) removed bc it would cause removal of absent responses

    fs.writeFile('video_ids.json', JSON.stringify(remainingVideos), err => { if (err) throw err });
    fs.writeFile('video_snippets_obj.json', JSON.stringify(videoSnippetsObj), err => { if (err) throw err });

    if (errors.length > 0) console.error(errors.map(e => e.message));
    fs.writeFile('errors.json', JSON.stringify(errors, null, 2), (_p) => null);

    return videoSnippetsObj;
  } catch(err) {
    console.error(err.message);
  }
}

requestVideoApi();
