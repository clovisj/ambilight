const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("video");
const img = document.getElementById("img");
const _top = document.getElementById("top");
const _right = document.getElementById("right");
const _bottom = document.getElementById("bottom");
const _left = document.getElementById("left");
const constraints = (window.constraints = {
    audio: false,
    video: true
});

window.onload = async () => {
    video.setAttribute("playsinline", ""); //fix ios cam
    try {
        // const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const stream = null;
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
        const { r, g, b, a } = arr[i];
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
function draw() {
    // const { videoWidth: w, videoHeight: h } = video;
    const { width: w, height: h } = img;
    canvas.width = w;
    canvas.height = h;
    // ctx.drawImage(video, 0, 0);
    ctx.drawImage(img, 0, 0);
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

    const ww = 15;
    const hh = 5;

    _top.style.borderImage = borderColor(load(border.top, ww));
    _right.style.borderImage = borderColor(load(border.right, hh), 'bottom');
    _bottom.style.borderImage = borderColor(load(border.bottom, ww));
    _left.style.borderImage = borderColor(load(border.left, hh), 'bottom');

    ctx.putImageData(frame, 0, 0);
    setTimeout(draw, 80);
}

function handleSuccess(stream) {
    stream?.getVideoTracks();
    video.srcObject = stream;

    setTimeout(draw, 250);
}
