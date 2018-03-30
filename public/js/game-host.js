$(function () {

    // Initialize variables
    var $window = $(window);

    // Socket Vars
    var socket = io();
    let connected = false;


    ////////////

    initSocketEvents();
    reset();

    ///////////

    function startGame(){
        if(connected){
            socket.emit("requestStartGame");
        }
    }

    function showIntro(value){
       console.log('showIntro ' + value);
    }

    function onRoomReady(newRoomID){
        roomID = newRoomID;
        showIntro(true);
    }

    function initSocketEvents(){

        socket.on('connect', function(){
            reset();
            showMessage("");
            connected = true;

            // Room selection
            var roomParam = getUrlParameter('room');
            if (roomParam.length > 0) {
                console.log("Auto-Joining room " + roomParam);
                socket.emit("adminLoginToRoom", roomParam, onRoomReady);
            } else {
                socket.emit("adminLogin", onRoomReady);
            }
        });

        socket.on('startGame', function(){
            showMessage('startGame');
            showIntro(false);
        });

        socket.on('playerJoined', function(username){
            addPlayer(username);
        });

        socket.on('playerLeft', function (username){
            removePlayer(username);
        });

        socket.on('disconnect', function(){
            connected = false;
            reset();
        });
    }

    function addPlayer(username){
        console.log("we are joined by player " + username);
    }

    function removePlayer(username){
    }

    function reset() {
    }

    // update UI and emit endGame event
    function endGame(){
            if(connected){
                socket.emit("endGame");
                showRoomID();
                showIntro(true);
            }
    }

    function showMessage(message){
        console.log(message);
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

});
