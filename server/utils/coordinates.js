const convertToPdfCoordinates = (yPercent, pageHeight, elementHeight) => {
  // Calculate how far down from the top (in pixels) the user dragged
  const topPixels = yPercent * pageHeight;

  // Standard PDF Math: 
  // "Total Height" minus "Distance form Top" = "Distance from Bottom"
  // We also subtract elementHeight so the image draws UP from the bottom-left corner
  const pdfY = pageHeight - topPixels - elementHeight;
  
  return pdfY; 
};

export default convertToPdfCoordinates;