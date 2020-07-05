const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("video");
const _streap = document.getElementById("streap");
const constraints = (window.constraints = {
    audio: false,
    video: true
});

window.onload = async () => {
    video.setAttribute("playsinline", ""); //fix ios cam
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
    } catch (err) {
        alert(err.message);
    }
};

function rgba(data, x, y, w) {
    const i = w * 4 * y + x * 4;
    // console.log({ i, x, y, w });
    return {
        r: data[i * 4],
        g: data[i * 4 + 1],
        b: data[i * 4 + 2],
        a: data[i * 4 + 3]
    };
}
function draw() {
    const { videoWidth: w, videoHeight: h } = video;
    // const [w, h] = [100, 100];
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0);
    const frame = ctx.getImageData(0, 0, w, h);
    const { data } = frame;

    // console.log(data.length);
    const streap = [2 * w + 2 * h],
        topY = 0,
        leftX = 0,
        rightX = w - 1,
        bottomY = h - 1;
    for (let x = 0; x < w; x++) {
        streap[x] = rgba(data, x, topY, w);
        streap[w + h + x] = rgba(data, x, bottomY, w);
    }
    for (let y = 0; y < h; y++) {
        streap[w + y] = rgba(data, leftX, y, w);
        streap[w + h + w + y] = rgba(data, rightX, y, w);
    }

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const { r, g, b, a } = rgba(data, x, y, w);

            const i = w * 4 * y + x * 4;
            frame.data[i * 4] = r;
            frame.data[i * 4 + 1] = g;
            frame.data[i * 4 + 2] = b;
            frame.data[i * 4 + 3] = a;
        }
    }
    const total = 25
    const v = Math.round(w / total);
    let p = Math.round(100 / total);
    const cs = [];
    for (let i = 0; i < w; i += v) {
        const { r, g, b, a } = streap[i];
        cs.push(`rgba(${r},${g},${b},${a}) ${p}%`);
        if (cs.length % 2 === 0) {
            p += p;
            cs.push(`rgba(${r},${g},${b},${a}) ${p}%`);
        }
    }
    cs.pop(); //remove last
    // console.log(cs.join(','));
    _streap.style.borderImage = `linear-gradient(to right, ${cs.join(',')}) ${total + 1}`;

    ctx.putImageData(frame, 0, 0);
    // console.log({streap});
    setTimeout(draw, 80);
}

function handleSuccess(stream) {
    const videoTracks = stream.getVideoTracks();
    video.srcObject = stream;

    setTimeout(draw, 250);
}
