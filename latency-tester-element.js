const template = document.createElement('template');
/*html*/
template.innerHTML = `
    <div>
        <p>Latency test: Make a short sound on 3, 2, 1, GO!</p>
        <div>
            <button id="start">Start test</button>
            <button id="stop">Stop test</button>
            <label id="text"></label>
        </div>
        <div>
            <label for="latency">Set latency in ms</label>
            <input id="latency" type="number" value="100">
		</div>
		<audio id="output" autoplay loop></audio>
    </div>
`;

class LatencyTesterElement extends HTMLElement {
	constructor () {
		super();
		this._shadowRoot = this.attachShadow({ mode: 'open' });
		this._shadowRoot.appendChild(template.content.cloneNode(true));

		this._startButton = this._shadowRoot.getElementById('start');
		this._startButton.addEventListener('click', () => this._beatWorker.postMessage('start'));

		this._stopButton = this._shadowRoot.getElementById('stop');
		this._stopButton.addEventListener('click', this._stop.bind(this));

		this._textLabel = this._shadowRoot.getElementById('text');

		this._latencyInput = this._shadowRoot.getElementById('latency');
		this._latencyInput.addEventListener('change', e => this.latency = e.target.value);

		this._output = this._shadowRoot.getElementById('output');

		this._osc = undefined;
		this._mediaRecorder = undefined;

		this._recording = false;
		this._recorded = false;
	}
	
	connectedCallback() {
		if (!this.hasAttribute('latency') || isNaN(this.getAttribute('latency'))) {
			this.setAttribute('latency', localStorage.latency ? localStorage.latency : 0);
		}

		this._beatWorker = new Worker('./beat-worker.js');
		this._beatWorker.postMessage({
			name: 'settings',
			settings: {
				highBeats: [4]
			}
		});
		this._beatWorker.onmessage = (message) => {
			this._textLabel.innerHTML = `${4 - message.data.currentBeat}`;
			if (message.data.high) {
				this._textLabel.innerHTML = 'GO!';
				this._osc.high();
			}
			if (message.data.currentBeat === 2) {
				if (!this._recorded) {
					if (this._recording) {
						this._mediaRecorder.stop();
						this._recorded = true;
					}
					else {
						this._mediaRecorder.start();
						this._recording = true;
					}
				}
				else {
					this._output.currentTime = this.latency / 1000;
				}
			}
		};
	}

	_stop() {
		this._beatWorker.postMessage('stop');
		this._output.pause();
		this._textLabel.innerHTML = '';
	}
	
	get latency() {
		return parseInt(this.getAttribute('latency'));
	}
	
	set latency(val) {
		this.setAttribute('latency', val);
		localStorage.setItem('latency', val);
	}

	set osc(osc) {
		this._osc = osc;
	}

	set mediaRecorder(mediaRecorder) {
		this._mediaRecorder = mediaRecorder;
		this._mediaRecorder.addEventListener('dataavailable', (e) => {
			console.log(e.data);
			const blob = new Blob([e.data]);
			this._output.src = URL.createObjectURL(blob);
			this._output.currentTime = this.latency / 1000;
		});
	}
	
	static get observedAttributes() {
		return ['latency'];
	}
	
	_attributeChanges = {
		latency: newValue => this._latencyInput.value = newValue
	};
	
	attributeChangedCallback(name, oldValue, newValue) {
		const update = this._attributeChanges[name] ? this._attributeChanges[name] : () => {};
		update(newValue, oldValue);
	}
}

window.customElements.define('latency-tester-element', LatencyTesterElement);