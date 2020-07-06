import Color from "./color";

export default class LedStripModel {
    readonly length: number;
    readonly pin: number;

    brightness?: number;
    color?: Color;

    constructor({
        length
        , pin
        , brightness
        , color
    }: LedStripModel) {
        this.length = length;
        this.pin = pin;
        this.brightness = brightness || 75;
        this.color = color ? Color.toModel(color) : Color.BLACK;
    }
    static toModel(data: LedStripModel): LedStripModel {
        return new LedStripModel(data);
    }
}