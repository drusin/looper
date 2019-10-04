let settings = {
	bpm: 120,
	beatsPerMeasure: 4,
	highBeats: [1],
	repeat: true,
};

function millisPerBeat() { return 60 / settings.bpm * 1000; }

let currentBeat = 1;

let currentTimer;

self.onmessage = (message) => {
	console.log(message);
	switch (message.data.name || message.data) {
		case "settings":
			Object.assign(settings, message.data.settings);
			if (currentTimer) {
				clearInterval(currentTimer);
				start();
			}
			break;
		case "start":
			start();
			break;
		case "stop":
			if (currentTimer) {
				clearInterval(currentTimer);
			}
			currentBeat = 1;
			break;
	}
};

function start() {
	currentTimer = setInterval(tick, millisPerBeat())
}

function tick() {
	postMessage({
		currentBeat: currentBeat,
		currentTimestamp: Date.now(),
		high: settings.highBeats.includes(currentBeat),
		settings
	});

	if (currentBeat === settings.beatsPerMeasure) {
		if (settings.repeat) {
			currentBeat = 1;
			return;
		}
		else {
			clearInterval(currentTimer);
		}
		currentBeat = 1;
		return;
	}
	currentBeat++;
}