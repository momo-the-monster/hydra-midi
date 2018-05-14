const instrument = mpe();

// Request MIDI device access from the Web MIDI API
navigator.requestMIDIAccess().then(access => {
    // Iterate over the list of inputs returned
    access.inputs.forEach(midiInput => {
    // Send 'midimessage' events to the mpe.js `instrument` instance
    midiInput.addEventListener(
    'midimessage',
    (event) => instrument.processMidiMessage(event.data)
);
});
});

instrument.subscribe(processNotes);

activeNotes = {};

function processNotes(notes){
    notes.forEach(note=>{
        let noteIndex = note.noteNumber;
        if(noteIndex === undefined) return;

        let freq = noteToFreq(noteIndex);

        if(activeNotes[noteIndex] === undefined){
            // add note
            activeNotes[noteIndex] = note;
            synth.triggerAttack(freq);
        } else {
            if(note.noteOffVelocity !== undefined){
                synth.triggerRelease(freq);
                delete activeNotes[note.noteNumber];
            } else {
                // update note
                synth.set("detune", note.pressure * 100);
            }

        }
    })
}

// I think I need this for Tone.js to work
Tone.Transport.bpm.value = 100;
Tone.Transport.start();

let synth = new Tone.PolySynth(6, Tone.Synth,{
    "oscillator" : {
        "partials" : [0, 2, 3, 4],
    }
}).toMaster();

function noteToFreq(m) {
    let tuning = 440;
    return m === 0 || (m > 0 && m < 128) ? Math.pow(2, (m - 69) / 12) * tuning : null;
}
