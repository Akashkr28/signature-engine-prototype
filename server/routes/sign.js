import express from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Required to reconstruct __dirname

// IMPORT YOUR UTILS (Note: .js extension is MANDATORY in ES Modules)
import calculateAspectRatioFit from '../utils/aspectRatios.js';
import convertToPdfCoordinates from '../utils/coordinates.js';

// IMPORT YOUR DB MODEL
import AuditLog from '../models/AuditLog.js'; 

// --- 1. RECREATE __dirname (Required for ES Modules) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- 2. SETUP MULTER (Memory Storage) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- 3. THE SIGNING ENDPOINT ---
router.post('/sign-pdf', upload.single('signature'), async (req, res) => {
    try {
        // A. Parse Inputs
        const { x, y, width, height } = JSON.parse(req.body.data);
        const signatureBuffer = req.file.buffer;

        // B. Load the "Base" PDF
        // We look for sample.pdf in the server root (one level up from routes)
        const pdfPath = path.join(__dirname, '../sample.pdf'); 
        
        // Check if file exists to prevent crashing
        if (!fs.existsSync(pdfPath)) {
            return res.status(500).json({ error: "sample.pdf not found on server" });
        }

        const originalPdfBytes = fs.readFileSync(pdfPath);

        // --- SECURITY: HASH 1 (Original) ---
        const hashBefore = crypto.createHash('sha256').update(originalPdfBytes).digest('hex');
        console.log(`[Audit] Original Hash: ${hashBefore}`);

        // C. Process PDF
        const pdfDoc = await PDFDocument.load(originalPdfBytes);
        const page = pdfDoc.getPages()[0];
        const { width: pageW, height: pageH } = page.getSize();

        // Embed the PNG
        const pngImage = await pdfDoc.embedPng(signatureBuffer);

        // D. Calculate Geometry (The Interview Math)
        const boxW = width * pageW;
        const boxH = height * pageH;
        const boxX = x * pageW;

        [cite_start]// Apply Aspect Ratio Constraint [cite: 30]
        const { drawnW, drawnH, offsetX, offsetY } = calculateAspectRatioFit(
            boxW, boxH, pngImage.width, pngImage.height
        );

        [cite_start]// Apply Coordinate Inversion [cite: 7, 8]
        const pdfY = convertToPdfCoordinates(y, pageH, boxH);

        // E. Draw on Page
        page.drawImage(pngImage, {
            x: boxX + offsetX,
            y: pdfY + offsetY, // Add vertical centering offset
            width: drawnW,
            height: drawnH,
        });

        // F. Save Result
        const signedPdfBytes = await pdfDoc.save();

        // --- SECURITY: HASH 2 (Final) ---
        const hashAfter = crypto.createHash('sha256').update(signedPdfBytes).digest('hex');

        [cite_start]// G. Save Audit Trail to MongoDB [cite: 35]
        try {
            await AuditLog.create({
                documentId: "sample.pdf", 
                action: "SIGNATURE_INJECTED",
                originalHash: hashBefore,
                finalHash: hashAfter
            });
            console.log("✅ Audit Log saved to DB");
        } catch (dbError) {
            console.error("⚠️ Database Error (Audit Log not saved):", dbError.message);
            // We continue anyway so the user still gets their PDF
        }

        // H. Send Response
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(signedPdfBytes));

    } catch (err) {
        console.error("Error processing PDF:", err);
        res.status(500).send("Error signing PDF");
    }
});

export default router;