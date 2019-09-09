let _audioContext;
let volume;

function init(audioContext) {
    _audioContext = audioContext;
    volume = audioContext.createGain();
	volume.gain.value = 0.1;
	volume.connect(audioContext.destination);
}

function _osc(frequency) {
    const osc = _audioContext.createOscillator();
    osc.frequency.value = frequency;
    osc.connect(volume);
    osc.start();
    osc.stop(_audioContext.currentTime + 0.1);
}

function high() {
    _osc(440.0);
}

function low() {
    _osc(220.0);
}

export default {
    init, high, low
}