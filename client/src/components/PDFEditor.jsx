import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DraggableSignature from './DraggableSignature';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// --- UPDATE: ACCEPT NEW PROPS ---
const PDFEditor = ({ onPositionChange, pdfFile, addedSignatures, signatureUrl }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth); 
            }
        };
        window.addEventListener('resize', updateWidth);
        updateWidth(); 
        return () => window.removeEventListener('resize', updateWidth);
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
            <div 
                className="pdf-editor-container" 
                style={{ 
                    width: '100%', 
                    maxWidth: '800px', 
                    height: '500px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#fff',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '12px',
                    color: '#9ca3af',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
            >
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>📄</div>
                <h3 style={{margin: '0', color: '#374151'}}>No PDF Uploaded</h3>
                <p style={{fontSize: '0.9rem'}}>Upload a document from the sidebar to begin.</p>
            </div>
        );
    }

    return (
        <div className="pdf-editor-container" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Navigation Bar */}
            <div style={{ 
                background: '#1f2937', 
                color: '#fff', 
                padding: '12px 20px', 
                borderRadius: '8px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <button 
                    onClick={() => changePage(-1)} 
                    disabled={pageNumber <= 1}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer', opacity: pageNumber <= 1 ? 0.5 : 1 }}
                >
                    ◀ Previous
                </button>
                
                <span style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
                    Page {pageNumber} of {numPages || '--'}
                </span>
                
                <button 
                    onClick={() => changePage(1)} 
                    disabled={pageNumber >= numPages}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer', opacity: pageNumber >= numPages ? 0.5 : 1 }}
                >
                    Next ▶
                </button>
            </div>

            {/* PDF Viewer Wrapper */}
            <div
                className='pdf-wrapper'
                ref={containerRef}
                style={{ position: 'relative', width: '100%' }}
            >
                <Document 
                    file={pdfFile} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>Loading PDF...</div>}
                    error={<div style={{padding: '40px', textAlign: 'center', color: '#ef4444'}}>Failed to load PDF.</div>}
                >
                    {containerWidth && (
                        <div style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}> 
                            <Page
                                pageNumber={pageNumber}
                                width={containerWidth} 
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                canvasBackground="#ffffff" 
                            />
                        </div>
                    )}
                </Document>

                {/* --- 1. RENDER PLACED SIGNATURES --- */}
                {addedSignatures && signatureUrl && addedSignatures.map((sig, index) => {
                    // Only show signatures belonging to the CURRENT page
                    if (sig.pageNumber !== pageNumber) return null;

                    return (
                        <img
                            key={index}
                            src={signatureUrl}
                            alt="Signature"
                            style={{
                                position: 'absolute',
                                top: `${sig.y * 100}%`,
                                left: `${sig.x * 100}%`,
                                width: '150px', // Matches the DraggableBox width
                                height: '60px', // Matches the DraggableBox height
                                objectFit: 'contain',
                                zIndex: 20, // Sit on top of PDF
                                pointerEvents: 'none', // Allow clicking through if needed
                                border: '2px solid #2563eb', // Make it look "Active"
                                backgroundColor: 'rgba(255, 255, 255, 0.5)'
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