import Webcam from './webcam';
import LedStripService, { Color } from './ledStrip';
import ScreeenService from './screen';

class App {
    static async run() {
        let res: any;
        let count = 0;

        try {

            // const a = new LedStripService(0, 32, '/dev/cu.SLAB_USBtoUART');
            // const a = new LedStripService(0, 32, '/dev/tty.SLAB_USBtoUART');
            // await a.on();
            // await a.colorAll(new Color(255, 50, 0));
            // let data = undefined;
            await new Promise(res => setTimeout(res, 5000));
            let i = 20;
            while (i-- > 0) {
                res = await Webcam.capture();
                // res = await ScreeenService.borderArray();
                // res = await ScreeenService.borderArray2();
                console.log(count++);
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
        process.exit(1);
    })
    .catch(console.error);