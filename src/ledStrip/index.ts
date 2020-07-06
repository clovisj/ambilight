// @ts-ignore
import * as pixel from 'node-pixel';
import LedStrip from './model';
import Color from './color';
import { Board } from 'johnny-five';
// @ts-ignore
import { EtherPortClient } from 'etherport-client';

export {
    Color
}

const LED_BUILTIN = 2; //ESP8266
const OUTPUT = 1;

export default class LedStripService {
    private readonly config: LedStrip;
    private strip: pixel.Strip;
    private readonly hist: string[]; //rgb
    private current: LedStrip;
    private isReady: boolean;
    get info(): LedStrip {
        return this.current;
    }

    constructor(pin: number, length: number, port: string) {
        this.isReady = false;
        this.config = new LedStrip({ pin, length });
        this.hist = new Array(length);
        this.current = Object.assign(this.config, {}); //clone

        const board = new Board({
            port: new EtherPortClient({
                host: '192.168.100.138',
                port: 3030
            })
            // port
            , repl: false
        });

        board.on("ready", () => {
            console.log('### BOARD READY');

            // the Led class was acting hinky, so just using Pin here
            const pin = board.pinMode(LED_BUILTIN, OUTPUT);
            board.loop(250, () => {
                // Whatever the last value was, write the opposite
                board.digitalWrite(LED_BUILTIN, board.pins[LED_BUILTIN].value ? 0 : 1);
            });

            this.strip = new pixel.Strip({
                board
                // , controller: 'FIRMATA' //connect by jonny-five
                , controller: "I2CBACKPACK" //connect by wifi
                , strips: [{ pin, length }] // this is preferred form for definition
                , gamma: 2.8 // set to a gamma that works nicely for WS2812
            });
            this.strip.on("ready", () => {
                this.isReady = true;
                console.log('### STRIP READY');
            });
        });
    }
    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    async on() {
        while (!this.isReady) {
            console.log('### WAIT');
            await this.delay(1000);
        }
        if (!this.strip) { //ignore if not exist
            throw new Error('Strip not initiated!');
        }

        this.strip.off(); //clear all pixels
        await this.delay(3000);
        this.render();
        await this.delay(3000);
    }
    async off() {
        if (!this.strip) { //ignore if not exist
            throw new Error('Strip not initiated!');
        }

        const c = Color.BLACK.toString();
        for (let i = 0; i < this.strip.length; i++) {
            this.strip.pixel(i).color(c);
        }
        this.strip.show();
    }
    reset() {
        this.current = Object.assign(this.config, {});
        this.render();
    }
    brightness(value: number): number {
        this.current.brightness = value;
        return this.current.brightness;
    }
    color(value: Color): Color {
        this.current.color = value;
        return this.current.color;
    }
    private render() {
        if (!this.strip) { //ignore if not exist
            throw new Error('Strip not initiated!');
        }
        for (let i = 0; i < this.strip.length; i++) {
            this.strip.pixel(i).color(this.hist[i]);
        }
        this.strip.show();
    }
    colorAll(color: Color) {
        const c = color.toString();
        for (let i = 0; i < this.hist.length; i++) {
            this.hist[i] = c;
        }
        this.render();
    }
    colorRange(color: Color, offset: number, limit: number) {
        if (offset < 0) {
            offset = 0;
        }
        let end = offset + limit;
        if (end > this.hist.length) {
            end = this.hist.length;
        }
        const c = color.toString();
        for (let i = offset; i < end; i++) {
            this.hist[i] = c;
        }
        this.render();
    }
}