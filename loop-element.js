const template = document.createElement('template');
/*html*/
template.innerHTML = `
    <div>
        <button id="record">Record</button>
        <button id="stop-recording">Stop Recording</button>
		<audio id="output" autoplay loop></audio>
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

		this._output = this._shadowRoot.getElementById('output');

		this._mediaRecorder = undefined;
		this._latency = 0;
		
		this._currentBeat = 1;
		this._currentBeatTimeStamp = undefined;
		this._startBeat = undefined;
		this._startOffset = undefined;
		this._endBeat = undefined;
		this._endOffset = undefined;
		
	}
	
	_record() {
		this._mediaRecorder.start();
		this._startBeat = this._currentBeat;
		this._startOffset = Date.now() - this._currentBeatTimeStamp;
	}
	
	_stopRecording() {
		this._mediaRecorder.stop();
		this._endBeat = this._currentBeat;
		this._endOffset = Date.now() - this._currentBeatTimeStamp;
	}
	
	set mediaRecorder(mediaRecorder) {
		this._mediaRecorder = mediaRecorder;
		this._mediaRecorder.addEventListener('dataavailable', (e) => {
			console.log(e.data);
			const blob = new Blob([e.data]);
			this._output.src = URL.createObjectURL(blob);
		});
	}
	
	set beatWorker(beatWorker) {
		beatWorker.onmessage = message => {
			this._currentBeat = message.currentBeat;
			this._currentBeatTimeStamp = Date.now();
		}
	}
	
	init({ mediaRecorder, latency, beatWorker }) {
		this.mediaRecorder = mediaRecorder;
		this._latency = latency;
		this.beatWorker = beatWorker;
	}
}

window.customElements.define('loop-element', LoopElement);