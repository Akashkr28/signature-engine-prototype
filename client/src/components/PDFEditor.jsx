import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DraggableSignature from './DraggableSignature';
import './PDFEditor.css';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFEditor = ({ onPositionChange, pdfFile, addedSignatures, signatureUrl }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    // Resize observer to handle window resizing dynamically
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth); 
            }
        };

        // Use ResizeObserver for more robust width tracking than window 'resize'
        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);
        
        // Initial call
        updateWidth();

        return () => observer.disconnect();
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset) => {
        setPageNumber(prevPage => {
            const newPage = prevPage + offset;
            return Math.max(1, Math.min(newPage, numPages || 1));
        });
    };

    // --- EMPTY STATE ---
    if (!pdfFile) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No PDF Uploaded</h3>
                <p>Upload a document from the sidebar to begin.</p>
            </div>
        );
    }

    return (
        <div className="pdf-editor-container">
            
            {/* Navigation Bar */}
            <div className="pdf-nav">
                <button 
                    className="nav-btn"
                    onClick={() => changePage(-1)} 
                    disabled={pageNumber <= 1}
                >
                    ◀ Previous
                </button>
                
                <span>
                    Page {pageNumber} of {numPages || '--'}
                </span>
                
                <button 
                    className="nav-btn"
                    onClick={() => changePage(1)} 
                    disabled={pageNumber >= numPages}
                >
                    Next ▶
                </button>
            </div>

            {/* PDF Viewer Wrapper */}
            <div className='pdf-wrapper' ref={containerRef}>
                <Document 
                    file={pdfFile} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div style={{padding: '40px', textAlign: 'center', color: '#fff'}}>Loading PDF...</div>}
                    error={<div style={{padding: '40px', textAlign: 'center', color: '#ef4444'}}>Failed to load PDF.</div>}
                >
                    {containerWidth && (
                        <Page
                            pageNumber={pageNumber}
                            width={containerWidth} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            canvasBackground="#ffffff" 
                        />
                    )}
                </Document>

                {/* --- 1. RENDER PLACED SIGNATURES --- */}
                {addedSignatures && signatureUrl && addedSignatures.map((sig, index) => {
                    if (sig.pageNumber !== pageNumber) return null;

                    return (
                        <img
                            key={index}
                            src={signatureUrl}
                            alt="Signature"
                            className="placed-signature"
                            style={{
                                top: `${sig.y * 100}%`,
                                left: `${sig.x * 100}%`,
                                width: '150px', 
                                height: '60px', 
                            }}
                        />
                    );
                })}

                {/* --- 2. THE DRAGGABLE TOOL --- */}
                <DraggableSignature 
                    containerRef={containerRef} 
                    onPositionChange={(pos) => {
                        if(onPositionChange) onPositionChange({ ...pos, pageNumber });
                    }} 
                />
            </div>
        </div>
    );
};

export default PDFEditor;