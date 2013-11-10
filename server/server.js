var express = require('express');
var Firebase = require('firebase');
var constants = require('./constants.js');

var MAX_USERS_PER_GAME = 4;
var app = express();
var users_count = -1;

var server = new Firebase('https://labgoochallenge.firebaseio.com');
var games = server.child('games');
var currentGameRef;

var generatedMap = [
[constants.BLOCK_MYSELF,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_OTHER, constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FULL,constants.BLOCK_FULL,constants.BLOCK_FULL, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_OTHER_ON_BLOCK],
[constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FULL,constants.BLOCK_FULL,constants.BLOCK_FULL, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_OTHER_ON_BLOCK,constants.BLOCK_FREE,constants.BLOCK_FULL,constants.BLOCK_FULL,constants.BLOCK_FULL, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FULL,constants.BLOCK_FULL,constants.BLOCK_FULL, constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FULL,constants.BLOCK_FULL,constants.BLOCK_FULL, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE],
[constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_HOLLOW,constants.BLOCK_HOLLOW,constants.BLOCK_FREE, constants.BLOCK_FREE,constants.BLOCK_OTHER,constants.BLOCK_FREE,constants.BLOCK_FREE,constants.BLOCK_FREE]];


app.get('/register', function(req, res) {
  ++users_count;

  // Case of new game needed
  if (users_count % MAX_USERS_PER_GAME == 0) {
    createGame();
  };

  console.log(req.query.name);
  var new_player_ref = addPlayer(req.query.name);

  // Case of full gameresponse.setHeader("Access-Control-Allow-Origin", "*")
  if (users_count % MAX_USERS_PER_GAME == MAX_USERS_PER_GAME-1) {
    setGameInterval();
  };

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send([{user_id: new_player_ref.name() , game_id: currentGameRef.name()}]);
    // Add user to firebase
});

app.get('/games/:game_id/:user_id/move', function(req, res) {
  var player = req.params.user_id;
  var game_id = req.params.game_id;
  var x = req.query.x;
  var y = req.query.y;

  console.log(player + " " + game_id + " " + x);
  games.child(game_id).once('value', function(game) {
    var map = game.val().map;
    console.log("validating location");
    if(isValidLocation(map,x,y)){
      console.log("location is valid");
      var old_place = findOldPlace(map, player);
      console.log('old place: ' + old_place.x);
      map[old_place.y][old_place.x] = 3;
      map[y][x] = player;
      games.child(game_id + "/map").set(map);
    }
  });

  // get block type in pos(x,y)
  var block_type = 0

  if (block_type == 0) {
    // update firebase with user position
  };
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.send([]);
    // Add user to firebase
});


function findOldPlace(map, player_id) {
  var i, j = 0;
  for (i = 0; i < map.length; i++) {
    for (j = 0; j < map[i.toString()].length; j++) {
      var val = map[i.toString()][j.toString()];
      if (val == player_id) {
        return {x:j, y:i};
      }
    }
  }
}

function isValidLocation(map,x,y){
  var result =  map[y.toString()][x.toString()] == constants.BLOCK_HOLLOW ||
            map[y.toString()][x.toString()] == constants.BLOCK_FREE;
   console.log("isvalid : " + result);
   return result;
}

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

  var stateRef = currentGameRef.child('state')
  stateRef.set('started');
  console.log("game started will call finish in 5 sec");
  var interval = setInterval(function(){
        console.log("finish game");
        stateRef.set('finito');
        clearInterval(interval);
      }, 5000 );
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
