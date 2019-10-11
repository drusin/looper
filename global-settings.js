import { generateGetters } from './utils.js';

class GlobalSettings {
    constructor() {
        this._stream = undefined;
        this._bpm = 120;
        this._beatsPerMeasure = 4;
        this._beatWorker = undefined;

        return generateGetters(this);
    }

    set stream(stream) {
        this._stream = stream;
    }
    
    set beatWorker(beatWorker) {
        this._beatWorker = beatWorker;
    }
}

const SINGLETON = new GlobalSettings();
console.log(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(SINGLETON), ));

export default SINGLETON;