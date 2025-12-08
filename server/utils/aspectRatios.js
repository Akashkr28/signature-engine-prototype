function fitImageInBox(boxW, boxH, imageW, imageH){
    const scale = Math.min(boxW / imageW, boxH / imageH);

    const drawnW = imageW * scale;
    const drawnH = imageH * scale;

    const offsetX = (boxW - drawnW) / 2;
    const offsetY = (boxH - drawnH) / 2;

    return {
        drawnW,
        drawnH,
        offsetX,
        offsetY,
    };
}