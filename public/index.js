const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("video");
const _top = document.getElementById("top");
const _right = document.getElementById("right");
const _bottom = document.getElementById("bottom");
const _left = document.getElementById("left");
const constraints = (window.constraints = {
    audio: false,
    video: true,
    // video: {
    //     deviceId: 'fee9df40443c4748ac6da1e0467d2899342dd82f68d8ffc739c4fd471b9b0abf'
    // }
});
const FPS = 500//1000 / 60;

const ws = new WebSocket('ws://192.168.100.138/');

let WS_CONNECTED = false;


ws.onclose = console.error;
ws.onmessage = console.log;
ws.onopen = () => {
    WS_CONNECTED = true;
    console.log('CONNECTED!')
};
ws.onclose = () => {
    WS_CONNECTED = false;
    console.log('DISCONNECTED!')
};

window.onload = async () => {
    video.setAttribute("playsinline", ""); //fix ios cam
    try {
        const devices = (await navigator.mediaDevices.enumerateDevices())
            .filter(e => e.deviceId && e.kind === 'videoinput');
        console.log(devices) // { kind, label, deviceId }

        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream = null;
        handleSuccess(stream);
    } catch (err) {
        alert(err.message);
    }
};

function rgba(data, x, y, w) {
    const i = ((w * 4) * y) + (x * 4);

    return {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
    };
}
function rgbaAVG(arr) {
    const { r, g, b, a } = arr.reduce((v, e) => {
        return {
            r: v.r + e.r
            , g: v.g + e.g
            , b: v.b + e.b
            , a: v.a + e.a
        }
    }, { r: 0, g: 0, b: 0, a: 0 });

    return {
        r: Math.round(r / arr.length)
        , g: Math.round(g / arr.length)
        , b: Math.round(b / arr.length)
        , a: Math.round(a / arr.length)
    }
}
function borderColor(arr, direction) {
    const p = (100 / arr.length);
    let pv = p;
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const { r, g, b } = arr[i];
        const a = .5;
        res.push(`rgba(${r},${g},${b},${a}) ${pv}%`);
        if (res.length % 2 === 0) {
            pv += p;
            res.push(`rgba(${r},${g},${b},${a}) ${pv}%`);
        }
    }
    res.pop(); //remove last
    return `linear-gradient(to ${direction || 'right'}, ${res.join(',')}) ${arr.length}`;
}
function load(arr, total) {
    const m = (arr.length / total);
    const result = [];
    let v = 0;
    while (v < arr.length) {
        const rgba = rgbaAVG(arr.slice(v, v + m));
        result.push(rgba);
        v += m;
    }
    return result;
}
async function draw() {
    const { videoWidth: w, videoHeight: h } = video;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0);
    const frame = ctx.getImageData(0, 0, w, h);
    const { data } = frame;

    // console.log(`pixels: ${data.length}`);
    // console.log(`size: ${w}x${h}`);
    const border = {
        top: new Array(w)
        , right: new Array(h)
        , bottom: new Array(w)
        , left: new Array(h)
    }
    const streap = [2 * w + 2 * h],
        topY = 0,
        leftX = 0,
        rightX = w - 1,
        bottomY = h - 1;

    for (let i = 0; i < w; i++) {
        border.top[i] = rgba(data, i, topY, w);
        border.bottom[i] = rgba(data, i, bottomY, w);

        streap[i] = rgba(data, i, topY, w);
        streap[w + h + i] = rgba(data, w - i, bottomY, w);
    }
    for (let i = 0; i < h; i++) {
        border.left[i] = rgba(data, leftX, i, w);
        border.right[i] = rgba(data, rightX, i, w);

        streap[w + i] = rgba(data, leftX, i, w);
        streap[w + h + w + i] = rgba(data, rightX, i, w);
    }
    // console.log(border)

    const ww = 19;
    const hh = 32;

    const top = load(border.top, ww);
    const right = load(border.right, hh);
    const bottom = load(border.bottom, ww);
    const left = load(border.left, hh);
    _top.style.borderImage = borderColor(top);
    _right.style.borderImage = borderColor(right, 'bottom');
    _bottom.style.borderImage = borderColor(bottom);
    _left.style.borderImage = borderColor(left, 'bottom');

    ctx.putImageData(frame, 0, 0);
    while (!WS_CONNECTED) {
        await new Promise(res => setTimeout(res, 500));
    }

    const vars = [
        ...top
        , ...right
        , ...bottom.reverse()
        , ...left.reverse()
    ]

    let pixels = new Uint8Array(vars.length * 3);
    console.log(pixels.length);
    
    vars
        .forEach((e, i) => {
            const p = i * 3;
            pixels[p] = e.r;
            pixels[p + 1] = e.g;
            pixels[p + 2] = e.b;
        });

    ws.send(pixels.buffer);

    setTimeout(draw, FPS);
}

function handleSuccess(stream) {
    if (stream) {
        stream.getVideoTracks();
        video.srcObject = stream;
    }
    else {
        video.setAttribute("controls", "");
        video.setAttribute("loop", "");
        video.play();
    }

    setTimeout(draw, 250);
}
