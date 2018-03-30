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

    socket.on(eventNames.rawMidi, function(value){
        if(socket.game !== null && (typeof(socket.game) !== "undefined")){
            if(socket.game.roomID){
            //    console.dir(value);
                // broadcast midi update to room
                socket.broadcast.to(socket.game.roomID).emit(eventNames.rawMidi, new Buffer(value));
            }
        }
    });

    socket.on('playerJoinRoom', function (roomID, fn){
        roomID = roomID.toUpperCase();
        fn = fn || function(){};
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