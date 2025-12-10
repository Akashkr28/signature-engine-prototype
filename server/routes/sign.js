import express from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import calculateAspectRatioFit from '../utils/aspectRatios.js';
import convertToPdfCoordinates from '../utils/coordinates.js';
import AuditLog from '../models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 1. UPDATE MULTER: Accept two files (The PDF and The Signature)
const upload = multer({ storage: multer.memoryStorage() });
const uploadFields = upload.fields([
  { name: 'pdf', maxCount: 1 },        // User's document
  { name: 'signature', maxCount: 1 }   // User's signature image
]);

router.post('/sign-pdf', upload.fields([{ name: 'pdf' }, { name: 'signature' }]), async (req, res) => {
    try {
        console.log("--- STARTING MULTI-SIGN PROCESS ---");

        // 2. PARSE DATA: Expecting an ARRAY of signatures now
        // Format: [{x, y, pageNumber}, {x, y, pageNumber}, ...]
        const signaturePositions = JSON.parse(req.body.positions); 
        console.log(`Received ${signaturePositions.length} signature requests.`);

        // 3. LOAD PDF (Custom or Default)
        let pdfBuffer;
        if (req.files.pdf && req.files.pdf[0]) {
            console.log("Using UPLOADED PDF");
            pdfBuffer = req.files.pdf[0].buffer;
        } else {
            console.log("Using DEFAULT sample.pdf");
            const pdfPath = path.join(__dirname, '../sample.pdf');
            if (!fs.existsSync(pdfPath)) return res.status(500).json({ error: "sample.pdf missing" });
            pdfBuffer = fs.readFileSync(pdfPath);
        }

        // 4. LOAD SIGNATURE IMAGE
        if (!req.files.signature || !req.files.signature[0]) {
            return res.status(400).send("No signature image uploaded.");
        }
        const signatureBuffer = req.files.signature[0].buffer;

        // Hash Original
        const hashBefore = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

        // 5. PROCESS PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pngImage = await pdfDoc.embedPng(signatureBuffer);

        // --- LOOP THROUGH ALL SIGNATURE POSITIONS ---
        for (const pos of signaturePositions) {
            // Default to Page 1 if missing
            const pageIndex = (pos.pageNumber ? pos.pageNumber - 1 : 0);
            
            // Validate Page
            if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
                console.log(`Skipping invalid page index: ${pageIndex}`);
                continue;
            }

            const page = pdfDoc.getPages()[pageIndex];
            const { width: pageW, height: pageH } = page.getSize();

            // Calculate Geometry
            const boxW = 0.2 * pageW; // Default width 20%
            const boxH = 0.1 * pageH; // Default height 10%
            const boxX = pos.x * pageW;

            // Aspect Ratio
            const { drawnW, drawnH, offsetX, offsetY } = calculateAspectRatioFit(
                boxW, boxH, pngImage.width, pngImage.height
            );

            // Coordinates (Screen Math)
            const pdfY = convertToPdfCoordinates(pos.y, pageH, boxH);

            // Safety Clamp
            const finalY = Math.max(0, pdfY + offsetY);

            // Draw
            page.drawImage(pngImage, {
                x: boxX + offsetX,
                y: finalY,
                width: drawnW,
                height: drawnH,
            });
            
            console.log(`Signed Page ${pageIndex + 1} at [${pos.x}, ${pos.y}]`);
        }

        // 6. SAVE & SEND
        const signedPdfBytes = await pdfDoc.save();
        const hashAfter = crypto.createHash('sha256').update(signedPdfBytes).digest('hex');

        // Save Audit Log
        try {
            await AuditLog.create({
                documentId: req.files.pdf ? req.files.pdf[0].originalname : "sample.pdf",
                action: "MULTI_SIGNATURE_INJECTED",
                originalHash: hashBefore,
                finalHash: hashAfter
            });
            console.log("✅ Audit Log saved");
        } catch (e) { console.error("DB Error:", e.message); }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(signedPdfBytes));

    } catch (err) {
        console.error("FATAL ERROR:", err);
        res.status(500).send("Error signing PDF");
    }
});

export default router;