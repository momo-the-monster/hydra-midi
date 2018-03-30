$(function () {

    // Socket Vars
    var socket = io();

    let pad = {};

    var palette = new Palette();

    // Kick it off!
    init();

    // Room auto-join
    var roomParam = getUrlParameter('room');
    if (roomParam.length > 0) {
        console.log("Auto-Joining room " + roomParam);
        playerJoinRoom(roomParam);
    }

    function init(){
        // Add Palette
        initPalette();

        window.addEventListener( 'touchend', checkFullscreen);
        pad = new pixelpad(socket);
        reset();
    }
  
  function checkFullscreen(){
    if(!document.fullscreenElement){
          launchIntoFullscreen(document.documentElement); // the whole page
    }
  }
  
  // Find the right method, call on correct element
function launchIntoFullscreen(element) {
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

    function initPalette(){
        Palette.prototype.click = function(color,name) {
            pad.updateColor(color);
        };

        palette.dim(50);
        palette._displayText = false;
        palette.addColor("#000000");
        palette.addColor("#FFFFFF");
        palette.addColor("#FF0092");
        palette.addColor("#FFCA1B");
        palette.addColor("#B6FF00");
        palette.addColor("#228DFF");
        palette.addColor("#BA01FF");
        palette.appendTo(document.getElementById('palette'));

        document.getElementById('paint-color-input').addEventListener('change', onAddColor);
    }

    function onAddColor(){
        var paintColor = document.getElementById('paint-color-input').value;
        palette.addColor(paintColor);
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    function playerJoinRoom(name) {
        socket.emit('playerJoinRoom', name, function (response) {
            if (response.success === true) {
                showMessage("Joined Room", name);
                let pixels = response.pixels;
                if(pixels !== null) {
                    setAllPixels(pixels);
                }
            } else {
                showMessage("Couldn't Join Room", name);
            }
        });
    }

    function setAllPixels(pixels){
        // value: col, row, rgba css string
        var width = 16;
        var height = 16;
        var channels = 3;
        for(let row = 0; row < height; row++){
            for(let col = 0; col < width; col++){
                let index = (row * width * channels) + (col * channels);
                let color = tinycolor({r:pixels[index], g:pixels[index+1], b:pixels[index+2]});
                pad.receiveCellData({col:col, row:row, rgba:color.toRgbString()});
            }
        }
    }

    function reset() {
        showMessage('Waiting For Game');
    }

    function showMessage(message) {
        console.log(message);
    }

});