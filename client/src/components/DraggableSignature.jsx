import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';

const DraggableSignature = ({ containerRef, onPositionChange }) => {
  // We track pixels internally for smooth dragging
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  // Recalculate position if window resizes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // If needed, we could snap back to percentage here, 
        // but for now, we just let it sit to avoid jumping.
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]);

  // 1. HANDLE DRAG (Smooth Movement)
  // We must update state while dragging, or the box will "fight" the cursor.
  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  // 2. HANDLE STOP (Save Final Position)
  const handleStop = (e, data) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate Percentage based on the FINAL drag position (data.x / data.y)
    // Note: data.x and data.y are the "Transform" values (pixels moved from top-left)
    let xPercent = data.x / containerRect.width;
    let yPercent = data.y / containerRect.height;

    // Safety Clamp: Ensure it stays 0.0 - 1.0
    xPercent = Math.max(0, Math.min(xPercent, 1));
    yPercent = Math.max(0, Math.min(yPercent, 1));

    console.log(`[Drop] X: ${(xPercent*100).toFixed(2)}%, Y: ${(yPercent*100).toFixed(2)}%`);

    // Only update the Parent State when we stop dragging
    if (onPositionChange) {
      onPositionChange({ x: xPercent, y: yPercent });
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      // We control the position directly with state
      position={position} 
      onDrag={handleDrag} // <--- THIS LINE FIXES THE JUMPING
      onStop={handleStop}
    >
      <div 
        ref={nodeRef}
        className="draggable-field"
        style={{
          width: '150px', // Fixed pixel width is safer for dragging than %
          height: '60px',
          position: 'absolute',
          zIndex: 10,
          border: '2px dashed #2563eb', // Blue dashed line
          backgroundColor: 'rgba(37, 99, 235, 0.1)', // Light blue background
          cursor: 'grab',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#2563eb',
          fontWeight: 'bold',
          borderRadius: '4px',
          // Important: Start at top-left so transform (x,y) works correctly
          top: 0,
          left: 0,
        }}
      >
        Drag Me
      </div>
    </Draggable>
  );
};

export default DraggableSignature;