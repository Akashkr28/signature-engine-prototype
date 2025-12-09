/**
 * Calculates dimensions to fit an image inside a box while preserving aspect ratio
 */
const calculateAspectRatioFit = (boxW, boxH, imgW, imgH) => {
    // 1. Finding the scaling factor
    // We take the smaller ratio to ensure the image fits entirely inside the box
    const scale = Math.min(boxW / imgW, boxH / imgH);
  
    // 2. Calculating the new "drawn" dimensions
    const drawnW = imgW * scale;
    const drawnH = imgH * scale;
  
    // 3. Calculating offsets to center the image
    const offsetX = (boxW - drawnW) / 2;
    const offsetY = (boxH - drawnH) / 2;
  
    return { drawnW, drawnH, offsetX, offsetY };
  };
  
  export default calculateAspectRatioFit;