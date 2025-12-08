function convertToPdfCoordinates(yPercent, pageHeight, elementHeight){
    const topPixels = yPercent * pageHeight;

    return pageHeight - topPixels - elementHeight;
}