import { useState, useMemo } from 'react'; // Added useMemo
import PDFEditor from './components/PDFEditor';
import './App.css';

function App() {
  const [currentCoords, setCurrentCoords] = useState({ x: 0, y: 0});
  const [addedSignatures, setAddedSignatures] = useState([]);
  const [signatureFile, setSignatureFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [activePage, setActivePage] = useState(1);

  // --- NEW: Create a Preview URL for the signature image ---
  const signatureUrl = useMemo(() => {
    return signatureFile ? URL.createObjectURL(signatureFile) : null;
  }, [signatureFile]);

  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setAddedSignatures([]); 
    }
  };

  const handleSignatureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const handleAddSignature = () => {
    if (!signatureFile) { alert("Please upload a signature image first."); return; }
    if (!pdfFile) { alert("Please upload a PDF first."); return; }
    
    const newSig = { 
      x: currentCoords.x, 
      y: currentCoords.y, 
      pageNumber: activePage 
  };
    setAddedSignatures([...addedSignatures, newSig]);
  };

  const handleReset = () => {
    setPdfFile(null);
    setSignatureFile(null);
    setAddedSignatures([]);
    setCurrentCoords({ x: 0, y: 0});
    setResetKey(prev => prev + 1);
    setActivePage(1);
  };

  const handleDownloadSignedPdf = async () => {
    if (addedSignatures.length === 0) {
      alert("Please add at least one signature.");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('signature', signatureFile);
      formData.append('pdf', pdfFile);
      formData.append('positions', JSON.stringify(addedSignatures));

      // Ensure this URL matches your backend environment
      const API_URL = 'https://signature-engine-prototype.onrender.com';
      
      const response = await fetch(`${API_URL}/api/sign-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Server Error");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "signed_document.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to sign PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        
        {/* LOGO COMPONENT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.5)'
          }}>
            ✍️
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', background: '-webkit-linear-gradient(#111827, #4b5563)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SignStream
          </h2>
        </div>

        <div className="control-group">
          <label className="label">1. Upload Document</label>
          <input key={`pdf-${resetKey}`} type="file" accept="application/pdf" onChange={handlePdfChange} />
        </div>

        <div className="control-group">
          <label className="label">2. Upload Signature</label>
          <input key={`sig-${resetKey}`} type="file" accept="image/png" onChange={handleSignatureChange} />
        </div>

        <div className="control-group">
          <label className="label">3. Current Position</label>
          <div className="coord-box">
          <div>Page: {activePage}</div> {/* Use activePage */}
            <div>X: {(currentCoords.x * 100).toFixed(2)}%</div>
            <div>Y: {(currentCoords.y * 100).toFixed(2)}%</div>
          </div>
        </div>
        
        <div className="control-group">
           <label className="label">Staged Signatures: {addedSignatures.length}</label>
           <ul style={{fontSize: '12px', paddingLeft: '20px', color: '#666', maxHeight: '100px', overflowY: 'auto'}}>
             {addedSignatures.map((sig, idx) => (
               <li key={idx}>Page {sig.pageNumber} (Ready)</li>
             ))}
           </ul>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto'}}>
          <button 
            className="primary-btn"
            style={{backgroundColor: '#eab308', color: 'black'}}
            onClick={handleAddSignature}
            disabled={!pdfFile || !signatureFile}
          >
            + Add Signature Here
          </button>

          <button 
            className="primary-btn"
            onClick={handleDownloadSignedPdf}
            disabled={isSaving || addedSignatures.length === 0}
          >
            {isSaving ? 'Processing...' : 'Download Final PDF'}
          </button>

          <button 
            className="primary-btn"
            style={{backgroundColor: '#ef4444', marginTop: '10px'}} 
            onClick={handleReset}
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="workspace">
        <PDFEditor 
            onPositionChange={setCurrentCoords} 
            pdfFile={pdfFile}
            // --- NEW PROPS ---
            addedSignatures={addedSignatures} 
            signatureUrl={signatureUrl}
            activePage={activePage}
            setActivePage={setActivePage}
        />
      </div>
    </div>
  );
}

export default App;