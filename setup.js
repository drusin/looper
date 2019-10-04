import globalSettings from './global-settings.js';

async function setupInputDevice() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices
        .filter(d => d.kind ==="audioinput")
        .map(d => ({
            deviceId: d.deviceId,
            label: d.label ? d.label : d.deviceId
        }))
        .forEach(d => {
            const option = document.createElement('option');
            option.innerHTML = d.label;
            option.value = d.deviceId;
            devicesSelect.appendChild(option);
        });
    if (localStorage.audioDevice) {
        devicesSelect.value = localStorage.audioDevice;
        onInputDeviceSelection({ target: devicesSelect });
    }
}

const player = document.getElementById('current-output');

async function onInputDeviceSelection(e) {
    localStorage.setItem('audioDevice', e.target.value);
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            deviceId: devicesSelect.value,
            echoCancellation: false,
            noiseSuppression: false
        }
    });
    globalSettings.stream = stream;

    player.srcObject = stream;
    setupLatencyTest(stream);
}

setupInputDevice();


const startButton = document.getElementById('start');
const devicesSelect = document.getElementById('devices');
devicesSelect.addEventListener('change', onInputDeviceSelection);

let stream_;

const options = {mimeType: 'audio/webm'};
const beatWorker = new Worker('./beat-worker.js');

const counter = document.getElementById('counter');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const volume = audioContext.createGain();
volume.gain.value = 0.1;
volume.connect(audioContext.destination);

startButton.addEventListener('click', function() {
    audioContext.resume();
    beatWorker.postMessage('start');
});

const latTest = document.getElementById('latency-tester-element');

beatWorker.onmessage = (message) => {
    counter.innerHTML = message.data.currentBeat;
    const osc = audioContext.createOscillator();
    osc.connect(volume);

    if (message.data.high) {
        osc.frequency.value = 440.0
    }
    else {
        osc.frequency.value = 220.0;
    }

    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
    document.getElementById('loop-element').onBeatWorkerMessage(message);
};

const handleSuccess = function(stream) {
    stream_ = stream;
    player.srcObject = stream;

    setupLatencyTest(stream);
};

import osc from './osc.js';
function setupLatencyTest(stream) {
    osc.init(audioContext);
    latTest.osc = osc;
    latTest.mediaRecorder = new MediaRecorder(stream, options);

    document.getElementById('loop-element').init({
        mediaRecorder: new MediaRecorder(stream, options),
        latency: latTest.latency,
        beatWorker: beatWorker
    });
}