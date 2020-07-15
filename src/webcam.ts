import * as cv from 'opencv4nodejs';
import { decode } from 'jpeg-js';

class Webcam {
    private readonly device: cv.VideoCapture;
    private readonly fps: number;

    constructor() {
        this.device = new cv.VideoCapture(0);
        this.device.set(cv.CAP_PROP_BUFFERSIZE, 1);
        this.device.set(cv.CAP_PROP_FPS, 2);
        this.device.set(cv.CAP_PROP_POS_FRAMES, 1);
        this.device.set(cv.CAP_PROP_FRAME_WIDTH, 640);
        this.device.set(cv.CAP_PROP_FRAME_HEIGHT, 360);
        this.fps = 1000 / 60;
    }

    async capture() {

        const frame = this.device.read();
        
        // Very slow
        // const data = frame.getDataAsArray();
        // console.log(`${data[0].length}x${data.length}`);

        const buffer = cv.imencode('.jpg', frame);
        const res = decode(buffer);
        console.log(`${res.width}x${res.height} ${res.data.length}`);
    }
}

export default new Webcam();