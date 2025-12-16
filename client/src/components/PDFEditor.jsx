import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DraggableSignature from './DraggableSignature';
import './PDFEditor.css';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Force CDN Worker to fix "Gray Screen"
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFEditor = ({ 
    onPositionChange, 
    pdfFile, 
    addedSignatures, 
    signatureUrl, 
    activePage,       // <--- Using Prop from App.jsx
    setActivePage     // <--- Using Prop from App.jsx
}) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(null);
    const [numPages, setNumPages] = useState(null);

    // Track container width for responsive PDF
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth); 
            }
        };
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);
        updateWidth();
        return () => observer.disconnect();
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const changePage = (offset) => {
        setActivePage(prev => Math.max(1, Math.min(prev + offset, numPages || 1)));
    };

    if (!pdfFile) return <div className="empty-state"><h3>Please Upload a PDF</h3></div>;

    return (
        <div className="pdf-editor-container">
            {/* Nav Bar */}
            <div className="pdf-nav">
                <button className="nav-btn" onClick={() => changePage(-1)} disabled={activePage <= 1}>◀ Prev</button>
                <span>Page {activePage} of {numPages || '--'}</span>
                <button className="nav-btn" onClick={() => changePage(1)} disabled={activePage >= numPages}>Next ▶</button>
            </div>

            {/* --- CRITICAL FIX START --- */}
            {/* We add INLINE styles here to guarantee the coordinate system works */}
            <div 
                ref={containerRef}
                className='pdf-wrapper' 
                style={{ 
                    position: 'relative',   /* Coordinates (0,0) start here */
                    display: 'inline-block',/* Wraps tight around PDF */
                    minWidth: '100%',
                    minHeight: '500px'      /* Prevents 0-height collapse */
                }}
            >
                <Document 
                    file={pdfFile} 
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page
                        pageNumber={activePage}
                        width={containerWidth || 600} 
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>

                {/* 1. Show Placed Signatures */}
                {addedSignatures && signatureUrl && addedSignatures.map((sig, index) => {
                    if (sig.pageNumber !== activePage) return null;
                    return (
                        <img
                            key={index}
                            src={signatureUrl}
                            className="placed-signature"
                            style={{
                                position: 'absolute',
                                top: `${sig.y * 100}%`,
                                left: `${sig.x * 100}%`,
                                width: '150px',
                                height: '60px',
                                zIndex: 50,
                                pointerEvents: 'none'
                            }}
                        />
                    );
                })}

                {/* 2. The Draggable Tool */}
                {/* We pass activePage so the parent App knows which page the coordinate belongs to */}
                <DraggableSignature 
                    containerRef={containerRef} 
                    onPositionChange={(pos) => {
                        // Pass x, y AND the current activePage up to App.jsx
                        onPositionChange({ ...pos, pageNumber: activePage });
                    }} 
                />
            </div>
            {/* --- CRITICAL FIX END --- */}
        </div>
    );
};

export default PDFEditor;