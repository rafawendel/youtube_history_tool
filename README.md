This is a simple solution for listing all youtube videos from one's history which are categorized as "music".

This project runs in NodeJS. For details, check "package.json" file.

In order to use it, you must first fetch YouTubeAPI for your history or get the JSON file through Google Takout.

You will also need a GoogleAPI key with YouTubeDataAPI 3.0 reading scope.

You may check the code for variable reference. It is very short.

Every file runs as an individual snippet, for better performance and due to tiers.
However, there is an npm script that automates everything. Run "npm run dev" and check "organised*.json" files.
