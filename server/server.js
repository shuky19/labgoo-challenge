var express = require('express');
var Firebase = require('firebase');

var MAX_USERS_PER_GAME = 4;
var app = express();
var users_count = -1;

var server = new Firebase('https://labgoochallenge.firebaseio.com');
var games = server.child('games');
var currentGameRef;

// Block types
var BLOCK_MYSELF = 0;
var BLOCK_OTHER = 1;
var BLOCK_HOLLOW = 2;
var BLOCK_FREE = 3;
var BLOCK_FULL = 4;
var BLOCK_MYSELF_ON_BLOCK = 5;
var BLOCK_OTHER_ON_BLOCK = 6;

var generatedMap = [
[3,3,3,3],
[3,2,3,3],
[3,3,3,3],
[3,3,3,3]];

app.get('/register', function(req, res) {
  ++users_count;

  // Case of new game needed
  if (users_count % MAX_USERS_PER_GAME == 0) {
    createGame();
  };

  console.log(req.query.name);
  var new_player_ref = addPlayer(req.query.name);

  // Case of full game
  if (users_count % MAX_USERS_PER_GAME == MAX_USERS_PER_GAME-1) {
    setGameInterval();
  };

    res.send([{user_id: new_player_ref.name() , game_id: currentGameRef.name()}]);
    // Add user to firebase
});

app.get('/games/:game_id/:user_id/move', function(req, res) {
  var player = req.params.user_id;
  var game = req.params.game_id;
  var x = req.query.x;
  var y = req.query.y;

  console.log(player + " " + game + " " + x);
  // get block type in pos(x,y)
  var block_type = 0

  if (block_type == 0) {
    // update firebase with user position
  };
    res.send([]);
    // Add user to firebase
});


function startGame(){
  console.log("Startig game: " + currentGameRef.name());
  currentGameRef.once('value',function(data){
    var gameData = data.val();
    var map = gameData.map;
    randomPlaces = [[0, 0], [0, 3], [3, 0], [3, 3]];
    var i = 0;
    for (var key in gameData.players) {
      map[randomPlaces[i][0]][randomPlaces[i][1]] = key;
      i++;
    }
    currentGameRef.child('map').set(map);
    console.log(map);
  });

  currentGameRef.child('state').set('started');
}
function addPlayer(name){
  var players = currentGameRef.child("players");
  return players.push({"name": name});
}
function createGame(){
  console.log("creating game");
  currentGameRef = games.push({state:'not_started',map: generatedMap , players: []});
  console.log("game created" + currentGameRef.name());
}
function setGameInterval(){
  var interval = setInterval(function() {
      // Start game
      startGame();

        clearInterval(interval);
      }, 5000 );
}
app.listen(3000);
console.log('Listening on port 3000...');
