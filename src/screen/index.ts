// @ts-ignore
import * as robotjs from 'robotjs';

class ScreenService {
    private readonly width: number;
    private readonly height: number;

    constructor() {
        const { width, height } = robotjs.getScreenSize();
        this.width = width;
        this.height = height;
    }

    async borderArray() {
        const border = {
            top: new Array(this.width)
            , right: new Array(this.height)
            , bottom: new Array(this.width)
            , left: new Array(this.height)
        }
        // const pixels = [(2 * this.width) + (2 * this.height)];

        const top = 0;
        const left = 0;
        const bottom = this.height - 1;
        const right = this.width - 1;

        const fns = [];
        let fn;
        for (let x = 0; x < this.width; x++) {
            fn = robotjs.getPixelColor(x, top);
            fns.push(fn);
            fn = robotjs.getPixelColor(x, bottom);
            fns.push(fn);
        }

        for (let y = 0; y < this.height; y++) {
            fn = robotjs.getPixelColor(left, y);
            fns.push(fn);
            fn = robotjs.getPixelColor(right, y);
            fns.push(fn);
        }

        const res = await Promise.all(fns);

        return border;
    }
    private async getPixelColor(x: number, y: number) {
        return robotjs.getPixelColor(x, y);
    }
}
export default new ScreenService();