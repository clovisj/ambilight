import Webcam from './webcam';

class App {
    static async run() {
        let data = undefined;
        let i = 100;
        while (i-- > 0) {
            await Webcam.capture();
            console.log(i)
        }
    }
}

App.run()
    .then(console.log)
    .catch(console.error);