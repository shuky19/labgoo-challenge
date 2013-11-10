var dataBase = new Firebase('https://labgoochallenge.firebaseio.com');
var serverAddress = "http://10.0.0.14:3000"
var game_id = null;
var player_id = null;


// server.child("players").child("Shuky").on("game", function(game_id) {
//   game.setGrid(server.child("games").child(game_id).grid);

//   server.child("games").child(game_id).on("change", function(grid) {
//     game.setGrid(server.child("games").child(game_id).grid);
//   })
// })

// server.child("players").child("Shuky").on("game", function(game_id) {

// server.child("players").push("Shuky");


var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var game;

// Colors
var COLOR_MYSELF_BLOCK = "#FF0000";
var COLOR_OTHER_BLOCK = "#216475";
var COLOR_HOLLOW_BLOCK = "#C0C0C0";
var COLOR_FREE_BLOCK = "#FFFFFF";
var COLOR_FULL_BLOCK = "#192823";
var COLOR_MYSELF_ON_BLOCK = "#800000";
var COLOR_OTHER_ON_BLOCK = "#3399FF";

var COLORS = [];

COLORS[BLOCK_MYSELF] = COLOR_MYSELF_BLOCK;
COLORS[BLOCK_OTHER] = COLOR_OTHER_BLOCK;
COLORS[BLOCK_HOLLOW] = COLOR_HOLLOW_BLOCK;
COLORS[BLOCK_FREE] = COLOR_FREE_BLOCK;
COLORS[BLOCK_FULL] = COLOR_FULL_BLOCK;
COLORS[BLOCK_MYSELF_ON_BLOCK] = COLOR_MYSELF_ON_BLOCK;
COLORS[BLOCK_OTHER_ON_BLOCK] = COLOR_OTHER_ON_BLOCK;

game = {

  grid: [],
  score: 0,
  fps: 8,
  over: true,
  block_height: null,
  block_width: null,
  time: null,
  interval: null,

  setGrid: function (grid) {
    game.grid = grid;
    game.block_height =canvas.height / grid[0].length;
    game.block_width =canvas.width / grid.length;
  },

  start: function() {
    game.over = false;
    game.message = null;
    game.score = 0;
    game.fps = 8;
    myself.prev_block = BLOCK_FREE;
    game.time = 5;
    game.interval = setInterval(function(){game.decreaseTime()},1000);
  },

  decreaseTime: function() {
    if (game.time != null) {
      --game.time;

      if (game.time == 0) {
        game.stop();
        clearInterval(game.interval);
      };
    }
  },

  stop: function() {
    game.over = true;
    game.drawMessage("Game over! Score: " + game.score + ", Press space to start new game");
    game.resetCanvas();
  },

  drawMessage: function(message) {
      var timeP = document.getElementById('time');
      timeP.innerText = message;
  },

  drawBox: function(x, y, color) {
    context.fillStyle = color;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + game.block_height, y);
    context.lineTo(x + game.block_height, y + game.block_width);
    context.lineTo(x, y + game.block_width);
    context.closePath();
    context.fill();
  },

  drawScore: function() {
    context.fillStyle = '#999';
    context.font = (canvas.height) + 'px Impact, sans-serif';
    context.textAlign = 'center';
    context.fillText(game.score, canvas.width / 2, canvas.height * 0.9);
  },

  drawTime: function() {
    if (game.time !== null) {
      game.drawMessage("Time left: " + game.time);
    }
  },

  drawGrid: function () {
    if (game.grid) {
      for (var i = 0; i < game.grid.length; i++) {
        for (var j = 0; j < game.grid[i].length; j++) {
          var block_type = game.grid[i][j];
          game.drawBox(j*game.block_height,i*game.block_width, COLORS[block_type]);
          if (block_type == BLOCK_MYSELF) {
            myself.setPosition(j,i);
          }
        };
      };
    }
  },

  resetCanvas: function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

};

myself = {
  x: null,
  y: null,
  prev_block: null,
  users_id: null,

  setPosition: function(x,y) {
    myself.x = x;
    myself.y = y;
  },

  move: function(direction) {
    var prev_x = myself.x;
    var prev_y = myself.y;

    switch(direction) {
      case "up":
        --myself.y;
        break;
      case "down":
        ++myself.y;
        break;
      case "left":
        --myself.x;
        break;
      case "right":
        ++myself.x;
        break;
    }

      grid = game.grid

      // Validations
      if (myself.x == -1 || myself.y == -1 ||
        myself.y == game.grid.length || myself.x == game.grid[0].length ||
        grid[myself.y][myself.x] == BLOCK_OTHER || grid[myself.y][myself.x] == BLOCK_OTHER_ON_BLOCK ||
         grid[myself.y][myself.x] == BLOCK_FULL) {
        myself.x = prev_x;
        myself.y = prev_y;
        return;
      }

      // Saveing prev block
      grid[prev_y][prev_x] = myself.prev_block;
      myself.prev_block = grid[myself.y][myself.x];

      // Setting new position
      grid[myself.y][myself.x] = BLOCK_MYSELF;
  },
};

var keys = {
  up: [38, 75, 87],
  down: [40, 74, 83],
  left: [37, 65, 72],
  right: [39, 68, 76],
  start_game: [13, 32]
};

function getKey(value){
  for (var key in keys){
    if (keys[key] instanceof Array && keys[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
}

addEventListener("keydown", function (e) {
    var lastKey = getKey(e.keyCode);
    if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0) {
      // Request change from server and than:
      myself.move(lastKey);
    } else if (['start_game'].indexOf(lastKey) >= 0 && game.over) {
      game.start();
    }
}, false);

var requestAnimationFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;

function loop() {
  if (game.over == false) {
    game.resetCanvas();
    game.drawTime();
    game.drawGrid();
  }
  setTimeout(function() {
    requestAnimationFrame(loop);
  }, 1000 / game.fps);
}

requestAnimationFrame(loop);

$.getJSON(serverAddress+"/register?name=asdasd", function( data ) {
  game_id = data[0].game_id;
  player_id = data[0].player_id;


  dataBase.child("games").on("child_changed", function(data) {
    if (data.name() == game_id) {
      server_game = data.val();
      game.setGrid(server_game.map);

      if (server_game.state == "started" && game.over == true) {
        console.log("Starting game");
        game.start();
      }

      if (server_game.state == "not started" && server_game.over == false) {
        console.log("Stopping game");
        game.stop();
      }
    }
  });
});