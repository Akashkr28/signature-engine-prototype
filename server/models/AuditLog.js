import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
    documentId: String,
    action: String,
    originalHash: String,
    finalHash: String,
    timeStamp: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', AuditLogSchema);