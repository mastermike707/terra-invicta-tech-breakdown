const express = require('express');
const path = require('path'); // Added
const port = 3000;
const app = express();
app.use(express.static('app'));
// Serve game files under the "/game-data" path
const gameAssetsPath = "./app/game/";
app.use('/game-data', express.static(gameAssetsPath));
app.listen(port, () => console.log(`App listening on port ${port}.`));