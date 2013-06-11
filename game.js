var connect = require('connect');
connect.createServer(
  connect.static(__dirname+'/public')
).listen(8080);

var  util = require("util"),
       io = require("socket.io"),
       trackLength = 30;

var socket,
    players;

var Player = function() {
  var id;
};
Player.prototype.position = 0;

function init() {
  players = [];
   socket = io.listen(8000);
   socket.configure(function() {
    socket.set("tranpsorts", ["websocket"]);
    socket.set("log level", 2);
   });
   setEventHandlers();
};

var setEventHandlers = function() {
  socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
  util.log("New player has connected!!:) "+ client.id);
  client.on("new player", onNewPlayer);
  client.on("move player", onMovePlayer);
  client.on("disconnect", onClientDisconnect);
};

function onNewPlayer(data) {
  var newPlayer = new Player();
  newPlayer.id = this.id;
  this.emit("config", {trackLength: trackLength});
  this.emit("local id", {id: newPlayer.id})
  this.broadcast.emit("new player", {
    id: newPlayer.id
  });
  var existingPlayer;
  util.log(players.length);
  for(i=0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit("new player", {
      id: existingPlayer.id
    });
  };
  if (players.length < 1){
    startCountdown(this);
  }

  players.push(newPlayer)
  util.log(players.length);
};

function onMovePlayer(player) {
  currentPlayer = playerById(player.id);
  currentPlayer.position += 1

  if(currentPlayer.position >= trackLength - 1) {
    this.emit("winner", {id: player.id});
    this.broadcast.emit("winner", {id: player.id});
    resetPosition(); 
    startCountdown(this);
  }

  this.broadcast.emit("move player", {id: player.id});
};

function resetPosition(){
  for(var i = 0; i < players.length; i++) {
    players[i].position = 0;
  }
}

function startCountdown(_this) {
  util.log('counter Started')
  // a = setInterval(function() {
  //   _this.emit("count down", {num: count} );
  //   _this.broadcast.emit("count down", {num: count});
  //   count--;
  // if (count < 1){
  //   clearInterval(a);
  //   _this.emit("onStartGame")
  //   _this.broadcast.emit("onStartGame")
  //   count = 10;
  // } 
  // }, 1000)
  var count=10;

  var counter=setInterval(timer, 1000); //1000 will  run it every 1 second

  function timer()
  {
    count=count-1;
    if (count <= 0)
    {
       clearInterval(counter);
        _this.emit("onStartGame")
        _this.broadcast.emit("onStartGame")
       return;
    }
    _this.emit("count down", {num: count} );
    _this.broadcast.emit("count down", {num: count});
  }
};

function onClientDisconnect(player) {
  util.log('Player has disconnected: ' + this.id);
  var removePlayer = playerById(this.id);

  if (!removePlayer) {
    util.log("Player not found: " + this.id)
    return;
  };

  players.splice(players.indexOf(removePlayer), 1);
  this.broadcast.emit("remove player", {id: this.id});
};

function playerById(id) {
  for(var i = 0; i < players.length; i++) {
    if (players[i].id === id)
      return players[i];
  };

  return false;
};








init();
