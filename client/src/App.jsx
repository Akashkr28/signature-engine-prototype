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

  const handleSavePdf = async() => {
    if(!signatureFile) {
      alert("Please upload a signature image first.");
      return;
    }

    console.log("Sending ti Backend:", {
      coordinates: coords,
      fileName: signatureFile.name
    });

    // TODO: We will add the fetch() logic here in the Backend Sprint
    alert(`Ready to sign! \nPosition: X=${(coords.x*100).toFixed(2)}%, Y=${(coords.y*100).toFixed(2)}%`);
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