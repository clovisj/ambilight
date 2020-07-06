const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("video");
const img = document.getElementById("img");
const ul = document.getElementById("ul");
const _top = document.getElementById("top");
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
    const i = w * 4 * y + x;
    // console.log({ i, x, y, w });
    return {
        r: data[i * 4],
        g: data[i * 4 + 1],
        b: data[i * 4 + 2],
        a: data[i * 4 + 3]
    };
}
function rgbaAVG({ r, g, b, a, count }) {
    return {
        r: Math.round(r / count)
        , g: Math.round(g / count)
        , b: Math.round(b / count)
        , a: Math.round(a / count)
    }
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

    console.log(`pixels: ${data.length}`);
    console.log(`size: ${w}x${h}`);
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
        border.bottom[i] = rgba(data, w - i, bottomY, w);

        streap[i] = rgba(data, i, topY, w);
        streap[w + h + i] = rgba(data, w - i, bottomY, w);
    }
    for (let i = 0; i < h; i++) {
        border.right[i] = rgba(data, leftX, i, w);
        border.left[i] = rgba(data, rightX, i, w);

        streap[w + i] = rgba(data, leftX, i, w);
        streap[w + h + w + i] = rgba(data, rightX, i, w);
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
    const total = 10;
    const m = (streap.length / total);
    const result = [];
    let val = { r: 0, g: 0, b: 0, a: 0, count: 0 };
    for (let i = 0; i < streap.length; i++) {
        const { r, g, b, a } = streap[i];
        val.r += r;
        val.g += g;
        val.b += b;
        val.a += a;
        val.count++;
        if (val.count > m) {
            console.log(val)
            const rgba = rgbaAVG(val);
            result.push(rgba);
            val = { r: 0, g: 0, b: 0, a: 0, count: 0 }; //reset
        }
    }
    console.log(result)

    const v = Math.round(w / total);
    const p = (100 / total);
    let pv = p;
    const
        csTop = []
        , csRight = []
        , csBottom = []
        , csLeft = []
        ;
    ul.style.width = w;
    ul.innerHTML = '';
    for (let i = 0; i < w; i += v) {
        let li = document.createElement('li');
        ul.appendChild(li);
        li.style.width = `${p}%`;
        let u = document.createElement('ul');
        li.appendChild(u);

        let val = { r: 0, g: 0, b: 0, a: 0, count: 0 };
        for (let x = 0; x < v; x++) {
            const { r, g, b, a } = streap[i + x];
            val.r += r;
            val.g += g;
            val.b += b;
            val.a += a;
            val.count++;

            let li = document.createElement('li');
            u.appendChild(li);
            li.style.color = `rgba(${r},${g},${b},${a})`;
            li.innerText = i + x;
        }
        const { r, g, b, a } = rgbaAVG(val);

        li.style.background = `rgba(${r},${g},${b},.3)`;

        csTop.push(`rgba(${r},${g},${b},${a}) ${pv}%`);
        if (csTop.length % 2 === 0) {
            pv += p;
            csTop.push(`rgba(${r},${g},${b},${a}) ${pv}%`);
        }
    }
    csTop.pop(); //remove last
    _top.style.borderImage = `linear-gradient(to right, ${csTop.join(',')}) ${total}`;

    ctx.putImageData(frame, 0, 0);
    // setTimeout(draw, 80);
}

function handleSuccess(stream) {
    const videoTracks = stream?.getVideoTracks();
    video.srcObject = stream;

    setTimeout(draw, 250);
}
