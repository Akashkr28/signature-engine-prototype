import { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from 'react-draggable';
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";


// 1. SETUP WORKER: This is required for react-pdf to work with Webpack/Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFEditor = ({ onPositionChange }) => {
    const containerRef =  useRef(null);
    const [containerWidth, setContainerWidth] = useState(600); // Default width

    // 2. RESIZE OBSERVER: Ensures the PDF scales with the window
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {

                // We set the PDF width to match the container's width (minus padding)
                setContainerWidth(containerRef.current.offsetWidth);
        }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth(); // Initial call

    return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log(`PDF loaded with ${numPages} pages.`);
    };

    const handleStop = (e, data) => {
        // 3. THE MATH: Normalization Logic [cite 4, 11]
        // We calculate position as a % of the container, not absolute pixels
        if(!containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();

        const xPercent = data.x / width;
        const yPercent = data.y / height;

        // Send these % values to the parent component
        if (onPositionChange) {
            onPositionChange({ x: xPercent, y: yPercent});
        }

        console.log(`Normalized Position: X=${xPercent.toFixed(4)}, Y=${yPercent.toFixed(4)}`);
    };

    return (
        <div
            className='pdf-wrapper'
            ref={containerRef}
            style={{position: 'relative', width: '100%', height: '100%'}}
        >
            <Document
                file="sample.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div>Loading PDF...</div>}
            >
                <Page
                    pageNumber={1}
                    width={containerWidth} // Makes the PDF responsive [cite: 5]
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
            </Document>

            {/* 4. DRAGGABLE LAYER: The "Ghost" Element */}
            <Draggable
                bounds='parent'
                onStop={handleStop}
                defaultPosition={{x: 0, y: 0}}
            >
                <div
                    className="draggable-field"
                    style={{ 
                        width: '20%', 
                        height: '10%',
                        position: 'absolute',
                        zIndex: 10,
                        border: '2px dashed blue',
                        backgroundColor: 'rgba(230, 57, 70, 0.1)',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#e63946',
                        fontWeight: 'bold',
                        top: 0,
                        left: 0
                    }}
                >
                    Drag Me
                </div>
            </Draggable>
        </div>
    )
}

export default PDFEditor;