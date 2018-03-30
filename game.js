let eventNames = require('./models/eventNames').names;
let models = require('./models/models.js');
let hydra = require('./hydra/hydra.js');
let ndarray = require('ndarray');
let colorString = require('color-string');
let NDPixels = require('ndpixels');
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

    socket.on(eventNames.pixelUpdate, function(value){
       if(socket.game !== null && (typeof(socket.game) !== "undefined")){
           //io.sockets.to(socket.game.adminID).emit(eventNames.pixelUpdate, socket.username, value);
           if(socket.game.roomID){
               // broadcast pixel update to room
               io.sockets.to(socket.game.roomID).emit(eventNames.pixelUpdate, socket.username, value);

               // update pixel store on socket.game
               let color = colorString.get.rgb(value.rgba);
               socket.game.pixels.set(value.row, value.col, 0, color[0]);
               socket.game.pixels.set(value.row, value.col, 1, color[1]);
               socket.game.pixels.set(value.row, value.col, 2, color[2]);

               roomStorage.setItem(socket.game.roomID,socket.game.pixels.data);
           }
         var ledRoom = socket.game.roomID + "LED";
     //    if(socket.game.ledRoom){
           let color = colorString.get.rgb(value.rgba);
        //   io.sockets.to(ledRoom).emit(eventNames.pixelUpdateLed, "" + value.row + "," + value.col + "," + color[0]+ "," +  color[1]+ "," +  color[2]  );
           io.sockets.to(ledRoom).emit("pixelbin", new Buffer([value.row, value.col, color[0], color[1], color[2]]));
         //console.log("sending x");
        //   console.log("sending pixelUpdate with " + value.row + "," + value.col + "," + color[0]+ "," +  color[1]+ "," +  color[2]);
       //  }
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
  
  socket.on('getCurrentPixels', function(){
    var pixels = (roomStorage.getItemSync('PIXEL'));
      //socket.game = hydra.games[roomID];
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
            fn({'success':true, 'pixels':socket.game.pixels.data});
            console.log('player joins ' + roomID);
        } else {
            console.log('player makes ' + roomID);
            socket.game = hydra.createGame(roomID, socket.id);
            startGame(socket.game, roomID);
            socket.join(roomID);
            fn({'success':true, 'pixels':socket.game.pixels.data});
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

    function startGame(game, roomID) {
        game.numPlayers = 0;
        game.name = "pixel-sketch";
        game.inProgress = false;

        // construct pixel array
        let width = 16;
        let height = 16;
        let numChannels = 3;
        let blackPixelArray = new Uint8ClampedArray(width * height * numChannels);
        socket.game.pixels = ndarray(blackPixelArray,[width,height,numChannels]);
        var pixels = (roomStorage.getItemSync(roomID));
        if(pixels != null && (typeof(pixels) !== "undefined")){
            socket.game.pixels.data = pixels;
        }
    }
};