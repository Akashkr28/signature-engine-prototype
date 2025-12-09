import { useState } from 'react';
import PDFEditor from './components/PDFEditor';
import './App.css';

function App() {
  // Store the current drag position
  const [currentCoords, setCurrentCoords] = useState({ x: 0, y: 0, pageNumber: 1 });
  
  // Store the LIST of added signatures
  const [addedSignatures, setAddedSignatures] = useState([]);
  
  const [signatureFile, setSignatureFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setAddedSignatures([]); // Reset signatures on new file
    }
  };

  const handleSignatureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
    }
  };

  // --- NEW: STAGE A SIGNATURE ---
  const handleAddSignature = () => {
    if (!signatureFile) { alert("Please upload a signature image first."); return; }
    
    const newSig = { ...currentCoords };
    setAddedSignatures([...addedSignatures, newSig]);
    alert(`Signature added to Page ${newSig.pageNumber}! Add more or click Download.`);
  };

  // --- NEW: FINALIZE AND DOWNLOAD ---
  const handleDownloadSignedPdf = async () => {
    if (addedSignatures.length === 0) {
      alert("Please add at least one signature before downloading.");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      
      // 1. Append Files
      formData.append('signature', signatureFile);
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      // 2. Append The LIST of positions
      formData.append('positions', JSON.stringify(addedSignatures));

      // 3. Send Request
      const response = await fetch('http://localhost:3001/sign-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Server Error");

      // 4. Download
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
        <h2>Signature Tool</h2>

        <div className="control-group">
          <label className="label">1. Upload Document</label>
          <input type="file" accept="application/pdf" onChange={handlePdfChange} />
        </div>

        <div className="control-group">
          <label className="label">2. Upload Signature</label>
          <input type="file" accept="image/png" onChange={handleSignatureChange} />
        </div>

        <div className="control-group">
          <label className="label">3. Current Position</label>
          <div className="coord-box">
            <div>Page: {currentCoords.pageNumber}</div>
            <div>X: {(currentCoords.x * 100).toFixed(2)}%</div>
            <div>Y: {(currentCoords.y * 100).toFixed(2)}%</div>
          </div>
        </div>
        
        {/* LIST OF ADDED SIGNATURES */}
        <div className="control-group">
           <label className="label">Staged Signatures: {addedSignatures.length}</label>
           <ul style={{fontSize: '12px', paddingLeft: '20px', color: '#666'}}>
             {addedSignatures.map((sig, idx) => (
               <li key={idx}>Page {sig.pageNumber} (Ready)</li>
             ))}
           </ul>
        </div>

        {/* BUTTONS */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto'}}>
          <button 
            className="primary-btn"
            style={{backgroundColor: '#eab308', color: 'black'}} // Yellow Button
            onClick={handleAddSignature}
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
        </div>
      </div>

      <div className="workspace">
        <PDFEditor 
            onPositionChange={setCurrentCoords} 
            pdfFile={pdfFile} 
        />
      </div>
    </div>
  );
}

export default App;