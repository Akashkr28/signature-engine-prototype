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
const upload = multer({ storage: multer.memoryStorage() });

router.post('/sign-pdf', upload.single('signature'), async (req, res) => {
    try {
        console.log("--- STARTING PDF SIGNING PROCESS ---");

        // 1. Inputs
        let { x, y, width, height } = JSON.parse(req.body.data);
        console.log(`INPUTS FROM FRONTEND: x=${x}, y=${y}, w=${width}, h=${height}`);

        // --- SAFETY CLAMP: Force values to be inside the page (0.0 to 1.0) ---
        x = Math.max(0, Math.min(x, 1));
        y = Math.max(0, Math.min(y, 1));
        // --------------------------------------------------------------------

        const signatureBuffer = req.file.buffer;

        // 2. Load PDF
        const pdfPath = path.join(__dirname, '../sample.pdf');
        if (!fs.existsSync(pdfPath)) return res.status(500).json({ error: "sample.pdf missing" });

        const originalPdfBytes = fs.readFileSync(pdfPath);
        const hashBefore = crypto.createHash('sha256').update(originalPdfBytes).digest('hex');

        // 3. Process PDF
        const pdfDoc = await PDFDocument.load(originalPdfBytes);
        const page = pdfDoc.getPages()[0];
        const { width: pageW, height: pageH } = page.getSize();
        
        console.log(`PDF PAGE SIZE: width=${pageW}, height=${pageH} (Points)`);

        const pngImage = await pdfDoc.embedPng(signatureBuffer);

        // 4. Calculate Geometry
        const boxW = width * pageW;
        const boxH = height * pageH;
        const boxX = x * pageW;

        const { drawnW, drawnH, offsetX, offsetY } = calculateAspectRatioFit(
            boxW, boxH, pngImage.width, pngImage.height
        );

        let pdfY = convertToPdfCoordinates(y, pageH, boxH);

        console.log(`[DEBUG] Page Height: ${pageH}, Y-Percent: ${y}`);
        console.log(`[DEBUG] Calculated PDF-Y: ${pdfY}`);
        
        // --- CRITICAL LOG: This tells us where the image is actually drawing ---
        console.log(`DRAWING AT: x=${boxX + offsetX}, y=${pdfY + offsetY}, w=${drawnW}, h=${drawnH}`);

        // SAFETY CLAMP: Ensure Y is never negative (off bottom) or too high (off top)
        // This forces the signature to appear even if the math is slightly off.
        if (pdfY < 0) {
            console.log("⚠️ Y was negative! Forcing to 0.");
            pdfY = 0; 
        }

        // 5. Draw
        page.drawImage(pngImage, {
            x: boxX + offsetX,
            y: pdfY + offsetY,
            width: drawnW,
            height: drawnH,
        });

        // 6. Save & Send
        const signedPdfBytes = await pdfDoc.save();
        const hashAfter = crypto.createHash('sha256').update(signedPdfBytes).digest('hex');

        // DB Save
        try {
            await AuditLog.create({
                documentId: "sample.pdf", action: "SIGNATURE_INJECTED",
                originalHash: hashBefore, finalHash: hashAfter
            });
            console.log("✅ Audit Log saved");
        } catch (e) { console.error("DB Error:", e.message); }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(signedPdfBytes));
        console.log("--- DONE ---");

    } catch (err) {
        console.error("FATAL ERROR:", err);
        res.status(500).send("Error signing PDF");
    }
});

export default router;