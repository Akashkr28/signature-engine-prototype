import { useState, useRef } from 'react';
import Draggable from 'react-draggable';

const DraggableSignature = ({ containerRef, onPositionChange }) => {
    // We initialize the stage to store the PERCENTAGE positions
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const nodeRef = useRef(null);

    // 1. HELPER: Calculate current pixel based on container size
    // This ensure that when the window resizes, the box jumps to correct spot
    const getPixelPosition = () => {
        if(!containerRef.current) return { x: 0, y: 0 };

        const { width, height } = containerRef.current.getBoundingClientRect();
        return {
            x: (position.x * width),
            y: (position.y * height)
        };
    };

    // 2. MY LOGIC: The "Normalization" Handler
    const handleStop = (e, data) => {
        if (!containerRef.current) return;

        // Get the container's current size
        const parentRect = containerRef.current.getBoundingClientRect();

        // NORMALIZE: Convert pixels to 0.0 - 1.0 range
        const xPercent = data.x / parentRect.width;
        const yPercent = data.y / parentRect.height;

        // Update local state so the box stays put visually
        const newPos = { x: xPercent, y: yPercent };
        setPosition(newPos);

        // Send to Parent Component for the backend
        if (onPositionChange) {
            onPositionChange(newPos);
        }
    };
    
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds='parent'
            // CRITICAL: We drive the position using our helper function
            position={getPixelPosition()}
            onStop={handleStop}
        >
            <div
                ref={nodeRef}
                className='draggable-field'
                style={{
                    width: '20%',
                    height: '10%',
                    position: 'absolute',
                    zIndex: 10,
                    border: '2px dashed #007bff',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#e63946',
                    fontWeight: 'bold',
                }}
            >
                Drag Me
            </div>
        </Draggable>
    );
};

export default DraggableSignature;