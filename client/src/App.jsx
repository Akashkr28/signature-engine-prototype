import { useState } from 'react'
import PDFEditor from './components/PDFEditor';
import './App.css'

function App() {
  // 1. STATE: Store thr coordinates and uplaoded signature file
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [signatureFile, setSignatureFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 2. HANDLER: Capture thr user's uploaded signature image
  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const handleSavePdf = async () => {
    if (!signatureFile) {
      alert("Please upload a signature first!");
      return;
    }

    try {
      setIsSaving(true);
      
      // 1. Prepare the Data
      const formData = new FormData();
      formData.append('signature', signatureFile); // The image file
      
      // The Coordinate Data (JSON string)
      const payload = {
        x: coords.x,
        y: coords.y,
        width: 0.2, // Box width (20% of page)
        height: 0.1 // Box height (10% of page)
      };
      formData.append('data', JSON.stringify(payload));

      // 2. Send to Backend (Port 3001)
      const response = await fetch('http://localhost:3001/sign-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // 3. Handle the Signed PDF Download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "signed_document.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert("Success! PDF Signed and Downloaded.");

    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("Failed to sign PDF. Is the Backend running on port 3001?");
    } finally {
      setIsSaving(false);
    }
  };

  return (
<div className="app-container">
      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <h2>Signature Tool</h2>

        <div className="control-group">
          <label className="label">1. Upload Signature</label>
          <input type="file" onChange={handleFileChange} />
        </div>

        <div className="control-group">
          <label className="label">2. Position Tracker</label>
          <div className="coord-box">
            <div>X: {(coords.x * 100).toFixed(2)}%</div>
            <div>Y: {(coords.y * 100).toFixed(2)}%</div>
          </div>
        </div>

        <button 
          className="primary-btn"
          onClick={handleSavePdf}
          disabled={!signatureFile || isSaving}
        >
          {isSaving ? 'Processing...' : 'Sign Document'}
        </button>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className="workspace">
        <PDFEditor onPositionChange={setCoords} />
      </div>
    </div>
  );
}

export default App