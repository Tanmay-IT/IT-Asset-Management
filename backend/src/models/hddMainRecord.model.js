import mongoose from 'mongoose';

/**
 * One row from the Excel workbook's "Main" inventory sheet.
 * Fields hold the ORIGINAL source values verbatim — no spelling/date/capacity
 * "correction". `srNo` is null for the one unnumbered row (Shailesh Thakur).
 */
const hddMainRecordSchema = new mongoose.Schema(
  {
    srNo: { type: Number, default: null },
    allotted: { type: String, default: '' },
    brand: { type: String, default: '' },
    type: { type: String, default: '' },
    capacity: { type: String, default: '' },
    serialNumber: { type: String, default: '' },
    date: { type: String, default: '' },
    information: { type: String, default: '' },
    note: { type: String, default: '' },
    normalizedCapacityGb: { type: Number, default: null },
    normalizedDate: { type: Date, default: null },
    verificationFlags: { type: [String], default: [] },
    isHistorical: { type: Boolean, default: true },
    sourceWorkbook: { type: String, default: 'HDD_data_final.xlsx' },
    sourceSheet: { type: String, default: 'Main' },
    sourceRow: { type: Number, default: null },
  },
  { timestamps: true }
);

hddMainRecordSchema.index({ serialNumber: 1 });
hddMainRecordSchema.index({ isHistorical: 1 });

export const HddMainRecord = mongoose.model('HddMainRecord', hddMainRecordSchema);
