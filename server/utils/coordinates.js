/**
 * Converts Normalized Coordinates (0-1) to PDF Points
 * * @param {number} yPct - The Y position as a percentage (0.5 = 50%)
 * @param {number} pageHeight - The total height of the PDF page in points
 * @param {number} elementHeight - The height of the signature box in points
 * * @returns {number} The Y coordinate in PDF system (Bottom-Left origin)
 */
const calculatePdfY = (yPct, pageHeight, elementHeight) => {
    // 1. Calculating how far down from the TOP the element is (in points)
    const pixelDistanceFromTop = yPct * pageHeight;
  
    // 2. INVERT THE AXIS
    // PDF (0,0) is at the bottom.
    // Browser (0,0) is at the top.
    // We subtract the distance-from-top AND the element height 
    // because PDF draws images from their bottom-left corner.
    return pageHeight - pixelDistanceFromTop - elementHeight;
  };
  
  export default calculatePdfY;