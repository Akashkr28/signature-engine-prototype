const handleStop = (e, data) => {
    // 1. Get the container's current size
    const parentRect  = parentRef.current.getBoundingClientRect();

    // 2. NORMALIZE: Convert pixels to 0.0 - 1.0 range
    // "How far left is the box relative to the container width?"
    const xPercent = data.x / parentRect.width;

    // "How far down is the box relative to the container height?"
    const yPercent = data.y / parentRect.height;

    // 3. SAVE the normalized position
    setPosition({ x: xPercent, y: yPercent});
}