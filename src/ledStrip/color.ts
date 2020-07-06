export default class Color {
    private _r: number;
    get r(): number {
        return this._r;
    }
    set r(val: number) {
        if (val > 255) { val = 255; }
        else if (val < 0) { val = 0; }
        else { val = Math.round(val); }
        this._r = val;
    }
    private _g: number;
    get g(): number {
        return this._g;
    }
    set g(val: number) {
        if (val > 255) { val = 255; }
        else if (val < 0) { val = 0; }
        else { val = Math.round(val); }
        this._g = val;
    }
    private _b: number;
    get b(): number {
        return this._b;
    }
    set b(val: number) {
        if (val > 255) { val = 255; }
        else if (val < 0) { val = 0; }
        else { val = Math.round(val); }
        this._b = val;
    }
    static BLACK = new Color(0, 0, 0);
    constructor(r: number, g: number, b: number) {
        this._r = r;
        this._g = g;
        this._b = b;
    }
    static toModel(data: Color): Color {
        return new Color(data.r, data.g, data.b);
    }

    toString() {
        return `rgb(${this._r},${this._g},${this._b})`;
    }
    static wheel(pos: number): Color {
        pos = 255 - pos;
        if (pos < 85) {
            return new Color(255 - pos * 3, 0, pos * 3);
        }
        else if (pos < 170) {
            pos -= 85;
            return new Color(0, pos * 3, 255 - pos * 3);
        }
        pos -= 170;
        return new Color(pos * 3, 255 - pos * 3, 0);
    }
}