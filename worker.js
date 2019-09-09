let settings = {
	bpm: 120,
	beatsPerMeasure: 4,
	loopLength: 2,
	highBeats: [1],
	repeat: true
}

const beatsPerLoop = () => settings.beatsPerMeasure * settings.loopLength;
const milisPerLoop = () => 60 / settings.bpm * beatsPerLoop() * 1000;
const milisPerBeat = () => milisPerLoop() / beatsPerLoop();

let currentBeat = 1;
let currentLoop = 1;

let currentTimer;

self.onmessage = (message) => {
	console.log(message);
	switch (message.data.name || message.data) {
		case "settings":
			Object.assign(settings, message.data.settings);
			break;
		case "start":
			start();
			break;
		case "stop":
			if (currentTimer) {
				clearInterval(currentTimer);
				break;
			}
	};
};

function start() {
	currentTimer = setInterval(tick, milisPerBeat())
}

function tick() {
	postMessage({
		currentBeat: currentBeat + (currentLoop -1) * settings.beatsPerMeasure,
		high: settings.highBeats.includes(currentBeat)
	});

	if (currentBeat === settings.beatsPerMeasure) {
		if (currentLoop === settings.loopLength) {
			if (settings.repeat) {
				currentBeat = 1;
				currentLoop = 1;
				return;
			}
			else {
				clearInterval(currentTimer);
			}
		}
		currentBeat = 1;
		currentLoop++;
		return;
	}
	currentBeat++;
}