var express = require('express');
var Firebase = require('firebase');

var MAX_USERS_PER_GAME = 4;
var app = express();
var users_count = -1;

var server = new Firebase('https://labgoochallenge.firebaseio.com');
var games = server.child('games');
var currentGameRef;

// app.set('views', __dirname + '/../');
// app.engine('html', require('ejs').renderFile);

// app.get('/'), function (req, res) {
//   res.render("index.html");
// }

app.get('/register', function(req, res) {
  ++users_count;

  // Case of new game needed
  if (users_count % MAX_USERS_PER_GAME == 0) {
    createGame();
  };

  var new_player_ref = addPlayer(req.query.name);

  // Case of full game
  if (users_count % MAX_USERS_PER_GAME == MAX_USERS_PER_GAME-1) {
    setGameInterval();
  };

    res.send([{user_id: new_player_ref.name() , game_id: currentGameRef.name()}]);
    // Add user to firebase
});

app.get('/move/:user_id', function(req, res) {
  req.params.user_id
  req.params.x_pos
  req.params.y_pos

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
  currentGameRef.child('state').set(true);
}
function addPlayer(name){
  var players = currentGameRef.child("players");
  return players.push({"name": name});
}
function createGame(){
  console.log("creating game");
  currentGameRef = games.push({start:false,map: [1,2], players: []});
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
