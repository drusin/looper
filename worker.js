const BPM = 120;
const BEATS_PER_MEASURE = 4;
const LOOP_LENGTH = 2;
const BEATS_PER_LOOP = BEATS_PER_MEASURE * LOOP_LENGTH;
const MILLISECONDS_PER_LOOP = 60 / BPM * BEATS_PER_LOOP * 1000;
const MILLISECONDS_PER_BEAT = MILLISECONDS_PER_LOOP / BEATS_PER_LOOP;

let currentBeat = 1;

self.onmessage = (message) => {
	console.log(message);
	switch (message.data) {
		case "start": {
			start();
			break;
		}
	}
};

function start() {
	setInterval(tick, MILLISECONDS_PER_BEAT)
}

function tick() {
	postMessage({
		currentBeat,
		high: !((currentBeat - 1) % BEATS_PER_MEASURE)
	});
	currentBeat++;
	if (currentBeat > BEATS_PER_LOOP) {
		currentBeat = 1;
	}
}