JSON.cleanParse = (strObj) => {
  try {
    return JSON.parse(strObj);
  } catch(e) {
    return null;
  } 
}
function myFunction() {
  const header = Object.keys(videos[0]);
  let uniqueUrls = new Set();
  const matrix = videos.reduce((videos, video) => {
    header.forEach(key => { if(!(key in video)) video[key] = null });
    if (uniqueUrls.has(video.titleUrl)) return videos;
    uniqueUrls.add(video.titleUrl);
    return [...videos,
      Object.entries(video)
        .reduce((acc, [key, val]) => !header.includes(key) ? acc : [...acc,
            (key === 'time' || key === 'publishedAt') && val ? (new Date(val)).toDateString() : 
            val instanceof Array ? val.join() : 
            val && typeof val === 'object' ? JSON.stringify(val) :
            val]
          , [])
        .sort((a, b) => header.indexOf(a) - header.indexOf(b))
    ]
  }, []);
  console.log([header, ...matrix]);
  const ss = SpreadsheetApp.getActiveSheet();
  ss.getRange(1, 1, matrix.length + 1, header.length).setValues([header, ...matrix]);
  const thumbCol = ss.getRange(2, header.indexOf('thumbnails') + 1, ss.getDataRange().getLastRow())
  const images = thumbCol.getValues().map(row => [row[0] && JSON.cleanParse(row[0]) && `=IMAGE("${JSON.cleanParse(row[0])['default']['url']}")`]);
  thumbCol.setFormulas(images);
}
