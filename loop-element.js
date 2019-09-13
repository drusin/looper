const template = document.createElement('template');
/*html*/
template.innerHTML = `
    <div>
        <button id="record">Record</button>
        <button id="stop-recording">Stop Recording</button>
		<audio id="first-output"></audio>
		<audio id="second-output"></audio>
    </div>
`;

class LoopElement extends HTMLElement {
	constructor () {
		super();
		this._shadowRoot = this.attachShadow({ mode: 'open' });
		this._shadowRoot.appendChild(template.content.cloneNode(true));

		this._recordButton = this._shadowRoot.getElementById('record');
		this._recordButton.addEventListener('click', () => this._record());

		this._stopRecordingButton = this._shadowRoot.getElementById('stop-recording');
		this._stopRecordingButton.addEventListener('click', () => this._stopRecording());

		this._firstOutput = this._shadowRoot.getElementById('first-output');
		this._secondOutput = this._shadowRoot.getElementById('second-output');

		this._mediaRecorder = undefined;
		this._latency = 0;
		this._recorded = false;
		
		this._millisPerBeat = 0;
		
		this._recording = false;
		
		this._currentBeat = 1;
		this._currentBeatTimeStamp = undefined;
		this._startBeat = undefined;
		this._startOffset = undefined;
		
		this._loopLength = 0;
		this._currentLoopPosition = 0;
	}
	
	_record() {
		this._mediaRecorder.start();
		this._startBeat = this._currentBeat;
		this._startOffset = Date.now() - this._currentBeatTimeStamp;
		this._startOffset -= this._latency;
		this._recording = true;
		// if (this._startOffset < 0) {
		// 	this._startBeat
		// }
	}
	
	_stopRecording() {
		this._mediaRecorder.stop();
		this._recorded = true;
	}
	
	set mediaRecorder(mediaRecorder) {
		this._mediaRecorder = mediaRecorder;
		this._mediaRecorder.addEventListener('dataavailable', (e) => {
			const blob = new Blob([e.data]);
			let src = URL.createObjectURL(blob);
			this._firstOutput.src = src;
			this._secondOutput.src = src;
		});
	}
	
	onBeatWorkerMessage(message) {
		this._currentBeat = message.data.currentBeat;
		this._currentBeatTimeStamp = message.data.currentTimestamp;
		this._millisPerBeat = message.data.settings.millisPerBeat;
		if (this._recording && this._currentBeat === this._startBeat) {
			this._loopLength ++;
		}
		if (this._recorded && this._currentBeat === this._startBeat) {
			setTimeout(() => this._play(), this._startOffset);
		}
	}
	
	_play() {
		if (this._firstOutput.paused || !this._firstOutput.currentTime) {
			this._firstOutput.play();
		}
		else {
		
		}
	}
	
	init({ mediaRecorder, latency }) {
		this.mediaRecorder = mediaRecorder;
		this._latency = latency;
	}
}

window.customElements.define('loop-element', LoopElement);