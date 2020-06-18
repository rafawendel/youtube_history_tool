const fs = require('fs');
const music = require('./music.json');
const video = require('./video.json');

function splitIntoMultipleArrays(array, name, size, destination = './GAS-prj') {
  const k = Math.ceil(array.length / size);
  const li = [...Array(k).keys()].map(i => i + 1);

  li.forEach(k => {
    fs.writeFile(
      `${destination}/${name}_${k}.js`,
      `const ${name}_${k} = ${JSON.stringify(array.slice((k - 1) * size, k * size) , null, 2)}`,
      console.error
    );
  })
}

splitIntoMultipleArrays(music, 'music', 500);
splitIntoMultipleArrays(video, 'video', 500);
