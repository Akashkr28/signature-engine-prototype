import { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import DraggableSignature from "./DraggableSignature";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";


// 1. SETUP WORKER: This is required for react-pdf to work with Webpack/Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

const PDFEditor = ({ onPositionChange, pdfFile }) => {
    const containerRef =  useRef(null);
    const [containerWidth, setContainerWidth] = useState(600); // Default width

    // -- PAGINATION STATE --
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    // 2. RESIZE OBSERVER: Ensures the PDF scales with the window
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {

                // We set the PDF width to match the container's width (minus padding)
                setContainerWidth(containerRef.current.offsetWidth - 20);
        }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth(); // Initial call

    return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1); // Reset to first page on new document load
    };

    const changePage = (offset) => {
        setPageNumber(prevPage => {
            const newPage = prevPage + offset;
            return Math.max(1, Math.min(newPage, numPages || 1));
        });
    };

    if (!pdfFile) {
        return (
            <div
                className="pdf-editor-container"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #ccc',
                    borderRadius: '12px',
                    color: '#9ca3f',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
            >
                <div
                    style={{ textAlign: 'center' }}
                >
                    <h3
                        style={{ 
                            margin: '0',
                            color: '374151'
                        }}
                    >No PDF File Selected</h3>
                    <p
                        style={{
                            fontSize: '0.9rem',
                        }}
                    >Please upload a PDF to start editing.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pdf-editor-container" 
            style={{ 
            width: '100%', 
            maxWidth: '800px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
            }}>
            
            {/* --- NAVIGATION CONTROLS --- */}
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
                    style={{ 
                        background: '#555', 
                        border: 'none', 
                        color: 'white', 
                        padding: '5px 15px', 
                        borderRadius: '4px', 
                        cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer', 
                        opacity: pageNumber <= 1 ? 0.5 : 1 
                    }}
                >
                    ◀ Previous
                </button>
                
                <span style={{ fontWeight: 'bold' }}>
                    Page {pageNumber} of {numPages || '--'}
                </span>
                
                <button 
                    onClick={() => changePage(1)} 
                    disabled={pageNumber >= numPages}
                    style={{ 
                        background: '#555', 
                        border: 'none', 
                        color: 'white', 
                        padding: '5px 15px', 
                        borderRadius: '4px', 
                        cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer', 
                        opacity: pageNumber >= numPages ? 0.5 : 1 
                    }}
                >
                    Next ▶
                </button>
            </div>

            {/* --- PDF VIEWER --- */}
            <div
                className='pdf-wrapper'
                ref={containerRef}
                style={{ 
                    position: 'relative', 
                    width: '100%', 
                }}
            >
                <Document 
                    file={pdfFile} // REMOVED "|| /sample.pdf" so it respects null
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div>Loading PDF...</div>}
                    error={<div>Error loading PDF.</div>}
                >
                    {containerWidth && (
                        <Page
                            pageNumber={pageNumber} // <--- Uses the dynamic state variable
                            width={containerWidth} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            canvasBackground="#ffffff"
                        />
                    )}
                </Document>

                <DraggableSignature 
                    containerRef={containerRef} 
                    onPositionChange={(pos) => {
                        // Important: Send the current page number to the parent (App.jsx)
                        // so the backend knows which page to sign!
                        if(onPositionChange) onPositionChange({ ...pos, pageNumber });
                    }} 
                />
            </div>
        </div>
    );
};

export default PDFEditor;