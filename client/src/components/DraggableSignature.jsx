import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
// import './DraggableSignature.css'; // Optional if you use inline styles below

const DraggableSignature = ({ containerRef, onPositionChange }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const percentsRef = useRef({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  // Maintain position during resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updatePosition = () => {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if(width && height) {
            setPosition({
                x: percentsRef.current.x * width,
                y: percentsRef.current.y * height
            });
        }
    };
    const observer = new ResizeObserver(updatePosition);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const handleStop = (e, data) => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate Percentages
    let xPercent = data.x / width;
    let yPercent = data.y / height;

    // Clamp 0-1
    xPercent = Math.max(0, Math.min(xPercent, 1));
    yPercent = Math.max(0, Math.min(yPercent, 1));

    percentsRef.current = { x: xPercent, y: yPercent };
    
    if (onPositionChange) {
      onPositionChange({ x: xPercent, y: yPercent });
    }
  };

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
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
        style={{
            /* INLINE STYLES TO ENSURE VISIBILITY & PLACEMENT */
            width: '150px',
            height: '60px',
            position: 'absolute',
            zIndex: 1000, /* Always on top */
            top: 0,
            left: 0,
            cursor: 'grab',
            border: '2px dashed #2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            color: '#2563eb',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
      >
        <span>✋ Sign Here</span>
      </div>
    </Draggable>
  );
};

export default DraggableSignature;