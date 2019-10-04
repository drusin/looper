import { generateGetters } from './utils.js';

class GlobalSettings {
    constructor() {
        this._stream = undefined;
        this._bpm = 120;
        this._beatsPerMeasure = 4;

        return generateGetters(this);
    }

    set stream(stream) {
        this._stream = stream;
    }
}

const SINGLETON = new GlobalSettings();
window.globalSettings = SINGLETON;

export default SINGLETON;