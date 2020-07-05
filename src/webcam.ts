import { readFileSync } from 'fs';
// @ts-ignore
import NodeWebcam = require('node-webcam');
import { decode } from 'jpeg-js';

class Webcam {
    private readonly device: any;

    constructor() {
        this.device = NodeWebcam.create({
            //Picture related
            width: 1280,
            height: 720,
            quality: 100,
            // Number of frames to capture
            // More the frames, longer it takes to capture
            // Use higher framerate for quality. Ex: 60
            frames: 60,
            //Delay in seconds to take shot
            //if the platform supports miliseconds
            //use a float (0.1)
            //Currently only on windows
            delay: 0,
            //Save shots in memory
            saveShots: true,
            // [jpeg, png] support varies
            // Webcam.OutputTypes
            output: "jpeg",
            //Which camera to use
            //Use Webcam.list() for results
            //false for default device
            device: false,
            // [location, buffer, base64]
            // Webcam.CallbackReturnTypes
            callbackReturn: "location",
            //Logging
            verbose: false
        });
    }

    async capture() {
        const res = new Promise((resolve: any, reject: any) => {
            this.device.capture(
                "test_picture"
                , (err: any, file: string) => {
                    if (err) {
                        return reject(err);
                    }
                    const buffer = readFileSync(file);
                    const data = decode(buffer);
                    return resolve(data);
                });
        });

        return res;
    }
}

export default new Webcam();