import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import './DraggableSignature.css'; // Import the new styles

const DraggableSignature = ({ containerRef, onPositionChange }) => {
  // 1. Track Pixels for the Drag Library
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // 2. Track Percentages for Responsive Resizing
  // Default to center if no position set yet (optional, or 0,0)
  const percentsRef = useRef({ x: 0, y: 0 });
  
  const nodeRef = useRef(null);

  // --- RESPONSIVE HANDLER (ResizeObserver) ---
  useEffect(() => {
    if (!containerRef.current) return;

    const updatePosition = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Recalculate Pixel Position based on stored Percentages
        // This keeps the box relative to the PDF size, not the screen pixels
        setPosition({
          x: percentsRef.current.x * width,
          y: percentsRef.current.y * height
        });
      }
    };

    // Use ResizeObserver instead of window.resize
    // This catches layout changes (like sidebar toggle) AND window resize
    const observer = new ResizeObserver(updatePosition);
    observer.observe(containerRef.current);

    // Initial calculation
    updatePosition();

    return () => observer.disconnect();
  }, [containerRef]);

  // --- DRAG HANDLER (Visual Update) ---
  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  // --- STOP HANDLER (Save Logic) ---
  const handleStop = (e, data) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate Percentage based on current PDF container size
    let xPercent = data.x / containerRect.width;
    let yPercent = data.y / containerRect.height;

    // Safety Clamp (0.0 - 1.0) to ensure it never saves outside bounds
    xPercent = Math.max(0, Math.min(xPercent, 1));
    yPercent = Math.max(0, Math.min(yPercent, 1));

    // Update the Ref so resize knows where to put it
    percentsRef.current = { x: xPercent, y: yPercent };

    console.log(`[Drop] X: ${(xPercent*100).toFixed(2)}%, Y: ${(yPercent*100).toFixed(2)}%`);

    if (onPositionChange) {
      onPositionChange({ x: xPercent, y: yPercent });
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent" // Keeps it inside the PDF wrapper
      position={position} 
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div 
        ref={nodeRef}
        className="draggable-signature-box"
      >
        <span>✋ Sign Here</span>
      </div>
    </Draggable>
  );
};

export default DraggableSignature;