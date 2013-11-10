var express = require('express');

var app = express();
var user_id = 0;

app.get('/register', function(req, res) {
    res.send([{user_id: user_id++}]);
});
app.get('/get_game/:user_id', function(req, res) {
    res.send({game_id:req.params.user_id / 4});
});

app.listen(3000);
console.log('Listening on port 3000...');
