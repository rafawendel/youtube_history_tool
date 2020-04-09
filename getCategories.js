const axios = require('axios');
const fs = require('fs');
const KEY = require('./key.json');

function mock(id) {
  return new Promise((resolve, reject) => (
    Math.random() < 0.2
    ? resolve({
      data: {
        items: [{
          id,
          snippet: {
            categoryId: '1'
          }
        }]
      }
    })
    : Math.random() < 0.01
    ? reject(new Error(403))
    : Math.random() < 0.04
    ? resolve({})
    : resolve({
      data: {
        items: [{
          id,
          snippet: {
            categoryId: '10'
          }
        }]
      }
    })
  ));
}

async function batchFetchIds(idList, request, errorsArr = [], onSuccessCb = i => i) {
  const { key } = KEY;
  return await Promise.all(idList.map((id, _i) => {
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

function generateVideoSnippetsObjs(rawVideosList) {
  return rawVideosList.reduce(([accMusic, accOther], response) => {
    if (!response || response instanceof Error) return [accMusic, accOther];
    const video = response.items[0];
    if (!video) return [accMusic, accOther];

    //Splits videos that are not categorized as "music"
    return video.snippet.categoryId !== '10'
      ? [accMusic, { ...accOther, [video.id]: video.snippet }]
      : [{ ...accMusic, [video.id]: video.snippet }, accOther];
  }, [{},{}])
}

async function requestVideoApi() {
  const videoIdList = require('./video_ids.json');
  const request = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    headers: {
      Accept: 'application/json'
    }
  });

  const alreadyListedMusicSnippets = fs.existsSync('./music_snippets_obj.json') ? require('./music_snippets_obj.json') : {};
  const alreadyListedVideoSnippets = fs.existsSync('./video_snippets_obj.json') ? require('./video_snippets_obj.json') : {};
  const remaininigVideoIdList = videoIdList.filter(id => !(id in alreadyListedMusicSnippets || id in alreadyListedVideoSnippets));
  
  try {
    let errors = [];
    const responses = await batchFetchIds(
      remaininigVideoIdList,
      request,
      errors,
      res => res && res.data || new Error('No response')
    );

    const [musicSnippetsObj, videoSnippetsObj] = generateVideoSnippetsObjs(responses);
    const remainingVideos = remaininigVideoIdList.filter(id => !(id in musicSnippetsObj || id in videoSnippetsObj));

    fs.writeFile('video_ids.json', JSON.stringify(remainingVideos), err => { if (err) throw err });
    fs.writeFile('music_snippets_obj.json', JSON.stringify({ ...alreadyListedMusicSnippets, ...musicSnippetsObj }, null, 2), err => { if (err) throw err });
    fs.writeFile('video_snippets_obj.json', JSON.stringify({ ...alreadyListedVideoSnippets, ...videoSnippetsObj }, null, 2), err => { if (err) throw err });

    if (errors.length > 0) console.error(errors.map(e => e.message));
    fs.writeFile('errors.json', JSON.stringify(errors, null, 2), _p => null);

    return musicSnippetsObj;
  } catch(err) {
    console.error(err.message);
  }
}

requestVideoApi();
