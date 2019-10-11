import globalSettings from './global-settings.js';
import osc from './osc.js';

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

const options = {mimeType: 'audio/webm'};
const beatWorker = new Worker('./beat-worker.js');

const counter = document.getElementById('counter');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
osc.init(audioContext);
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

    if (message.data.high) {
        osc.high();
    }
    else {
        osc.low();
    }

    document.getElementById('loop-element').onBeatWorkerMessage(message);
};

function setupLatencyTest(stream) {
    latTest.osc = osc;
    latTest.mediaRecorder = new MediaRecorder(stream, options);

    document.getElementById('loop-element').init({
        mediaRecorder: new MediaRecorder(stream, options),
        latency: latTest.latency,
        beatWorker: beatWorker
    });
}