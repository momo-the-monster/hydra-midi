let eventNames = require('./models/eventNames').names;
let models = require('./models/models.js');
let hydra = require('./hydra/hydra.js');
var roomStorage = require('node-persist');

function init(){
    roomStorage.init({
        dir:'.node-persist/storage',
        continuous: false,
        interval: 5000
    }).then(
        function(){
            console.log("Room Storage Initialized.")
        },
        function(error){
            console.log("Error initializing Room Storage: " + error)
        }
    );
}

init();

module.exports.respond = function(io, socket){

    /*
    // custom adminLogin, allowing creation of an original room
    socket.on(eventNames.adminLoginToRoom, function(roomID, callback){
        doAdminLogin(socket, roomID, callback);
    });

    function doAdminLogin(socket, roomID, callback){
        roomID = roomID.toUpperCase();
        socket.isAdmin = true;
        if(roomID) {
            console.log('adminLoginToRoom ' + roomID);
            socket.join(roomID);
            callback(roomID);
            socket.game = hydra.createGame(roomID, socket.id);
            startGame(socket.game);
        }
    }
    */

    socket.on(eventNames.noteOn, function(value){
       if(socket.game !== null && (typeof(socket.game) !== "undefined")){
           if(socket.game.roomID){
               // broadcast midi update to room
               socket.broadcast.to(socket.game.roomID).emit(eventNames.noteOn, value);
           }
       }
    });

    socket.on(eventNames.noteOff, function(value){
        if(socket.game !== null && (typeof(socket.game) !== "undefined")){
            if(socket.game.roomID){
                // broadcast midi update to room
                socket.broadcast.to(socket.game.roomID).emit(eventNames.noteOff, value);
            }
        }
    });
  
    socket.on('subscribeToPixels', function(){
      console.log('heard subscribeToPixels');
      var roomID = 'PIXELLED';
      var pixels = (roomStorage.getItemSync('PIXEL'));
      //socket.game = hydra.games[roomID];
      socket.join(roomID);
      sendCurrentPixelsToLed(socket, pixels);
    });
  
  function sendCurrentPixelsToLed(socket, pixels){

    var interval = 25;
    
    for(let row = 0; row < 16; row++){
      for(let col = 0; col < 16; col++){
        //console.log('row is ' + row + ' / ' + col);
        
        let i = (row * 16) + col;
        
        setTimeout( function (i) {
          var offset = i * 3;
          let red = pixels[offset];
          let green = pixels[offset + 1];
          let blue = pixels[offset + 2];
          let dataString = "" + row + "," + col + "," + red + "," +  green + "," +  blue;
        //  io.sockets.to(socket.id).emit(eventNames.pixelUpdateLed, dataString );
          io.sockets.to(socket.id).emit("pixelbin", new Buffer([row, col, red, green, blue]));  
        }, interval * i, i);
        
      }
    }
    
  }

    socket.on('playerJoinRoom', function (roomID, fn){
        roomID = roomID.toUpperCase();
        // If room exists, add user to room and game. store reference to game in user socket
        if(io.sockets.adapter.rooms[roomID]){
            socket.game = hydra.games[roomID];
            socket.join(roomID);
            fn({'success':true});
            console.log('player joins ' + roomID);
        } else {
            console.log('player makes ' + roomID);
            socket.game = hydra.createGame(roomID, socket.id);
            startGame(socket.game, roomID);
            socket.join(roomID);
            fn({'success':true});
        }
    });

    // Disconnected
    socket.on('disconnect', function () {

        if(!socket.game)
            return;

        if(socket.isAdmin) {
            if(socket.game.roomID){
                socket.game.inProgress = false; // maybe handle this from gameOver?
            }
        } else {
            if(socket.game.roomID){
                socket.game.numPlayers--;
            }
        }
    });

    function startGame(game) {
        game.numPlayers = 0;
        game.name = "pixel-midi";
        game.inProgress = false;
    }
};