import Webcam from './webcam';
import LedStripService, { Color } from './ledStrip';
import { exit } from 'process';

class App {
    static async run() {
        try {
            // const a = new LedStripService(0, 32, '/dev/cu.SLAB_USBtoUART');
            // await a.on();
            // await a.colorAll(new Color(255, 50, 0));
            // let data = undefined;
            let i = 20;
            while (i-- > 0) {
                await Webcam.capture();
            }
        }
        catch (err) {
            throw err;
        }
    }
}

App.run()
    .then(e => {
        console.log(e);
        exit(1);
    })
    .catch(console.error);