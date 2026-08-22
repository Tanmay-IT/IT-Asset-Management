import mongoose from 'mongoose';

/**
 * One line of documented content on a drive (C/D/E) of a detailed HDD sheet.
 * Loosely-structured source rows (a single line of freeform text) are stored
 * in `nameDescription` with the other fields left empty — that is a faithful
 * representation, not missing data.
 */
const hddDriveEntrySchema = new mongoose.Schema(
  {
    number: { type: String, default: '' },
    itemType: { type: String, default: '' },
    nameDescription: { type: String, default: '' },
    formatExtension: { type: String, default: '' },
    freeSpaceAvailable: { type: String, default: '' },
    yearDate: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const hddDriveSchema = new mongoose.Schema(
  {
    driveLetter: { type: String, required: true },
    driveType: { type: String, default: '' },
    entries: { type: [hddDriveEntrySchema], default: [] },
  },
  { _id: false }
);

/**
 * One numbered detail sheet (1–29) from the workbook. `hasData: false`
 * represents a sheet that exists in the workbook but has no recorded HDD
 * identity/content (sheets 24–27) — never fabricated data.
 *
 * `mainRecord` / `matchConfidence` / `verificationFlags` are computed by the
 * seed script from serial-number matching against HddMainRecord, per the
 * source spec's explicit cross-sheet relationships and called-out
 * discrepancies (never inferred from name similarity alone).
 */
const hddDetailSheetSchema = new mongoose.Schema(
  {
    sheetNumber: { type: Number, required: true, unique: true },
    hasData: { type: Boolean, default: true },
    userName: { type: String, default: '' },
    brand: { type: String, default: '' },
    type: { type: String, default: '' },
    capacity: { type: String, default: '' },
    serialNumber: { type: String, default: '' },
    dateAlloted: { type: String, default: '' },
    normalizedCapacityGb: { type: Number, default: null },
    normalizedDate: { type: Date, default: null },
    drives: { type: [hddDriveSchema], default: [] },
    mainRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'HddMainRecord', default: null },
    matchConfidence: {
      type: String,
      enum: ['confirmed', 'discrepancy', 'unmatched'],
      default: 'unmatched',
    },
    verificationFlags: { type: [String], default: [] },
    isHistorical: { type: Boolean, default: true },
    sourceWorkbook: { type: String, default: 'HDD_data_final.xlsx' },
    sourceSheet: { type: String, default: '' },
  },
  { timestamps: true }
);

hddDetailSheetSchema.index({ serialNumber: 1 });
hddDetailSheetSchema.index({ isHistorical: 1 });

export const HddDetailSheet = mongoose.model('HddDetailSheet', hddDetailSheetSchema);
