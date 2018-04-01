let socket = io();

WebMidi.enable(function (err) {

    if (err) {
        console.log("WebMidi could not be enabled.", err);
    } else {
        initMidi();
        initPiano();
        initSocket();
    }

});

let notes = [];
let midiOptions = {liveOutputs:{}};

function initPiano(){
    let piano = document.getElementById("piano");
    for(let i = 0; i < 126; i++){
        let note = document.createElement("div");
        note.setAttribute("id", i);
        note.setAttribute("class", "note");
        piano.appendChild(note);
        notes.push(note);
    }
}

function initMidi(){
    console.log("WebMidi enabled!");

    const gui = new dat.GUI();

    let inputFolder = gui.addFolder('Inputs');
    inputFolder.open();

    let outputFolder = gui.addFolder('Outputs');
    outputFolder.open();

    WebMidi.inputs.forEach(function(input){
        midiOptions[input.name] = false;
        let entry = inputFolder.add(midiOptions, input.name);
        entry.onFinishChange(function(value){
            toggleListenersForInput(value, input);
        })
    });

    WebMidi.outputs.forEach(function(output){
        midiOptions[output.name] = false;
        let entry = outputFolder.add(midiOptions, output.name);
        entry.onFinishChange(function(value){
            // add or remove the output from the active list
            if(value){
                midiOptions.liveOutputs[output.id] = output;
            } else {
                delete midiOptions.liveOutputs[output.id];
            }

        })
    });

}

/*
 MIDI_CHANNEL_MESSAGES: {
 "noteoff": 0x8,           // 8
 "noteon": 0x9,            // 9
 "keyaftertouch": 0xA,     // 10
 "controlchange": 0xB,     // 11
 "channelmode": 0xB,       // 11
 "programchange": 0xC,     // 12
 "channelaftertouch": 0xD, // 13
 "pitchbend": 0xE          // 14
 */
function toggleListenersForInput(value, input){
    if(value){
        // Register Listeners
        input.addListener('noteon', "all", function(e){
        //   console.dir(e);
            sendPlayNote(e.note.number, 1, e.rawVelocity);
            playNote(e.note.number, 1, e.rawVelocity);
        });
        input.addListener('noteoff', "all", function(e){
            sendReleaseNote(e.note.number, 1);
            releaseNote(e.note.number, 1);
        });
        input.addListener('controlchange', "all", function(e){
       //     console.dir(e);
            // number, channel, value
            playControlChange(e.controller.number, e.channel, e.value);
        })
    } else {
        // Remove Listeners
        input.removeListener('noteon');
        input.removeListener('noteoff');
        input.removeListener('controlchange');
    }
}

function playControlChange(number, channel, value){
    let obj = midiOptions.liveOutputs;
    // pass note-off to active outputs
    for (var prop in obj) {
        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;
        // your code
        let output = obj[prop];
        output.sendControlChange(number,value);
    }
}

function playNote(number, channel, rawVelocity){
    let obj = midiOptions.liveOutputs;
    // pass note-on to active outputs
    for (var prop in obj) {
        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;
        // your code
        let output = obj[prop];
        output.playNote(number, channel, {velocity:rawVelocity/127});
    }

    // set on-screen reaction
    let noteElement = notes[number];
    if(noteElement !== null){
        noteElement.classList.add("active");
    }
}

function releaseNote(number, channel){
    let obj = midiOptions.liveOutputs;
    // pass note-off to active outputs
    for (var prop in obj) {
        // skip loop if the property is from prototype
        if(!obj.hasOwnProperty(prop)) continue;
        // your code
        let output = obj[prop];
        output.stopNote(number,1);
    }

    let noteElement = notes[number];
    if(noteElement !== null){
        noteElement.classList.remove("active");
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**************
 * Hydra Events
 ***************/
function playerJoinRoom(name) {
    socket.emit('playerJoinRoom', name, function (response) {
        if (response.success === true) {
           // Join was successful, do something?
        } else {
           // Join Failed
        }
    });
}

function sendPlayNote(number, channel, rawVelocity){
    socket.emit('noteOn', {number:number, channel:channel, velocity:rawVelocity});
    socket.emit('rawMidi', [number, channel, rawVelocity]);
}

function sendReleaseNote(number, channel){
    socket.emit('noteOff', {number:number, channel:channel});
    socket.emit('rawMidi', [number, channel, 0]);
}

function initSocket(){

    // Room auto-join
    let roomParam = getUrlParameter('room');
    if (roomParam.length > 0) {
        console.log("Auto-Joining room " + roomParam);
        playerJoinRoom(roomParam);
    }

    socket.on("noteOn", function(data){
        playNote(data.number, data.channel, data.velocity);
    });

    socket.on("noteOff", function(data){
        releaseNote(data.number, data.channel);
    });
}