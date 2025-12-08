import { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DraggableSignature from "./DraggableSignature";
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

            {/* INTEGRATION: Just drop the component here */}
            {/* We pass containerRef so the child can calculate the pixels */}
            <DraggableSignature
                containerRef={containerRef}
                onPositionChange={onPositionChange}
            />
        </div>
    )
}

export default PDFEditor;