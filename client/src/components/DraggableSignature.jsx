import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const DraggableSignature = ({ containerRef, onPositionChange }) => {
  // 1. Track Pixels for the Drag Library
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // 2. Track Percentages for Responsive Resizing
  // We use a Ref so we don't trigger re-renders, just storage
  const percentsRef = useRef({ x: 0, y: 0 });
  
  const nodeRef = useRef(null);

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Recalculate Pixel Position based on stored Percentages
        // New Pixels = Old % * New Width
        setPosition({
          x: percentsRef.current.x * width,
          y: percentsRef.current.y * height
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]);

  // --- DRAG HANDLER (Smooth Movement) ---
  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  // --- STOP HANDLER (Save Logic) ---
  const handleStop = (e, data) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate Percentage
    let xPercent = data.x / containerRect.width;
    let yPercent = data.y / containerRect.height;

    // Safety Clamp (0.0 - 1.0)
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
      bounds="parent"
      position={position} 
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div 
        ref={nodeRef}
        className="draggable-field"
        style={{
          width: '150px',
          height: '60px',
          position: 'absolute',
          zIndex: 50, // Increased Z-Index to ensure it floats on top
          border: '2px dashed #2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          cursor: 'grab',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#2563eb',
          fontWeight: 'bold',
          borderRadius: '4px',
          top: 0,
          left: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' // Added shadow for visibility
        }}
      >
        Drag Me
      </div>
    </Draggable>
  );
};

export default DraggableSignature;