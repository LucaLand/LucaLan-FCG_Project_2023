function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function windowToCanvas(canvas, x, y) {
    let bbox = canvas.getBoundingClientRect();

    return { x: Math.round(x - bbox.left * (canvas.width  / bbox.width)),
        y: Math.round(y - bbox.top  * (canvas.height / bbox.height))
    };
}