var localPlayer,
    remotePlayers,      
    winner = false,
    trackLength;

function init() {
  socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});
  localPlayer = new Player();
  remotePlayers = [];
  setEventHandlers();
};

var Player = function(){
 var id;
};
Player.prototype.position = 0;

var setEventHandlers = function() {
  socket.on("connect", onSocketConnected);
  socket.on("config", setupEnv);
  socket.on("new player", onNewPlayer);
  socket.on("local id", localTrackRender);
  socket.on("move player", onMovePlayer);
  socket.on("remove player", onRemovePlayer);
  socket.on("winner", onWinner);
  socket.on("count down", onCountDown);
  socket.on("onStartGame", onStartGame);
};

var setupEnv = function(data) {
  trackLength = data.trackLength;
}

var onSocketConnected = function() {
  socket.emit("new player");
};

var localTrackRender = function(player){
  localPlayer.id = player.id;
  drawTrack(localPlayer);
};

var onStartGame = function(){
  game(localPlayer);
}

var onCountDown = function(count) {
  if (count.num === 1 ){
    $('#info').html('GO!');
  }
  else {
    $('#info').html(count.num);
  }
};

var onNewPlayer = function(data) {
  console.log("New player connected: " + data.id);
  newPlayer = new Player();
  newPlayer.id = data.id;
  remotePlayers.push(newPlayer);
  drawTrack(newPlayer);
}

var onMovePlayer = function(player) {
  $('#' + player.id + ' td.active').removeClass('active').next().addClass('active');
}

var onRemovePlayer = function(player) {
  var removePlayer = playerById(player.id);

  if(!removePlayer) {
    console.log("Player not found: " + player.id)
    return;
  }
  $('.racer_table').find('#' + player.id).hide();
  remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

var onWinner = function(player) {
  if (player.id === localPlayer.id){
    $('#info').html('You is the winner!!!!!');
  }
  else {
    $('#info').html('Die Loser!!!!!');
  }
  $(document).unbind('keyup');
  placePlayerStart('#' + localPlayer.id);
  for(var i = 0; i < remotePlayers.length; i++){
    placePlayerStart('#' + remotePlayers[i].id);
  }
};

function playerById(id) {
  for(var i = 0; i < remotePlayers.length; i++) {
    if (remotePlayers[i].id == id)
      return remotePlayers[i];

  };

  return false;
};


var drawTrack = function(newPlayer) {
  var id = newPlayer.id,
     row = $("<tr id=" + id + "></tr>"),
     player = '#' + id
  $('.racer_table').append(row);
  for(var tile = 0; tile < trackLength; tile++) {
    $(player).append(drawTile());
  }
  placePlayerStart(player);
};

var drawTile = function(player) {
  var tile = $('<td></td>')
  return tile
};

var placePlayerStart = function(player_id) {
  var track = $("table " + player_id);
  var start = track.find("td:first");
  var all = track.find("td");
  all.removeClass('active');
  start.addClass('active');
};

var game = function(player) {
  $(document).on("keyup", function() {
    var key = event.keyIdentifier; 
    if (key === "Right") {
      $('#' + player.id + ' td.active').removeClass('active').next().addClass('active');
      player.position += 1;
      socket.emit("move player", {id: player.id});
    }
  })
};


$('document').ready(function() {
  $(document).unbind('keyup');
  init();
});


// $(otherSelector).bind('cssClassChanged', data, function(){ do stuff });

