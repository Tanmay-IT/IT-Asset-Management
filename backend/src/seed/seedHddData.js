import { HddMainRecord } from '../models/hddMainRecord.model.js';
import { HddDetailSheet } from '../models/hddDetailSheet.model.js';
import { MAIN_RECORDS, DETAIL_SHEETS } from '../data/hddSeedData.js';
import { normalizeCapacity, normalizeDate, computeMainVerificationFlags } from '../utils/hddNormalize.js';

/**
 * Seeds the HDD Archive's historical data. Safe to call on every server
 * startup — it only ever deletes/reinserts `isHistorical: true` documents,
 * so it can never touch a record a user has since created or edited
 * (those are flipped to `isHistorical: false` the moment they're saved).
 */
export async function seedHddData() {
  await HddMainRecord.deleteMany({ isHistorical: true });
  await HddDetailSheet.deleteMany({ isHistorical: true });

  const mainDocs = MAIN_RECORDS.map((record) => ({
    ...record,
    normalizedCapacityGb: normalizeCapacity(record.capacity),
    normalizedDate: normalizeDate(record.date),
    verificationFlags: computeMainVerificationFlags(record),
    isHistorical: true,
    sourceRow: record.srNo,
  }));

  const insertedMain = await HddMainRecord.insertMany(mainDocs);

  const mainBySerial = new Map();
  for (const doc of insertedMain) {
    const key = doc.serialNumber.trim().toUpperCase();
    if (key) mainBySerial.set(key, doc);
  }
  const mainBySrNo = new Map(insertedMain.map((doc) => [doc.srNo, doc]));

  const detailDocs = DETAIL_SHEETS.map((sheet) => {
    if (sheet.hasData === false) {
      return {
        sheetNumber: sheet.sheetNumber,
        hasData: false,
        matchConfidence: 'unmatched',
        isHistorical: true,
        sourceSheet: String(sheet.sheetNumber),
      };
    }

    const serialKey = (sheet.serialNumber || '').trim().toUpperCase();
    let mainRecord = null;
    let matchConfidence = 'unmatched';
    const flags = [];

    // Two explicit, spec-called-out exceptions where automatic serial
    // matching alone would either miss the link (blank serial) or would
    // otherwise look like a clean match despite a real discrepancy.
    if (sheet.sheetNumber === 17) {
      // Pratima Shetty — detail sheet has no serial number recorded at all.
      mainRecord = mainBySrNo.get(16) ?? null; // Main Sr. No. 16 = Pratima Shetty
      matchConfidence = 'discrepancy';
      flags.push(
        'Main/detail serial mismatch: Main record has serial "WCC6Y1UY047A"; this detail sheet has no serial number recorded'
      );
    } else if (serialKey && mainBySerial.has(serialKey)) {
      mainRecord = mainBySerial.get(serialKey);
      matchConfidence = 'confirmed';
      if (sheet.sheetNumber === 20) {
        // Serial matches Main Sr. No. 19 "Shrikant chavan 2", but this
        // detail sheet identifies the user as "Shrikant chavan 1".
        matchConfidence = 'discrepancy';
        flags.push(
          'Main/detail name mismatch: Main record is allotted to "Shrikant chavan 2"; this detail sheet identifies the user as "Shrikant chavan 1"'
        );
      }
    } else if (serialKey) {
      flags.push('No matching Main record found for this serial number');
    }

    const drives = (sheet.drives || []).map((drive) => ({
      driveLetter: drive.driveLetter,
      driveType: drive.driveType || '',
      entries: drive.entries || [],
    }));

    return {
      sheetNumber: sheet.sheetNumber,
      hasData: true,
      userName: sheet.userName || '',
      brand: sheet.brand || '',
      type: sheet.type || '',
      capacity: sheet.capacity || '',
      serialNumber: sheet.serialNumber || '',
      dateAlloted: sheet.dateAlloted || '',
      normalizedCapacityGb: normalizeCapacity(sheet.capacity),
      normalizedDate: normalizeDate(sheet.dateAlloted),
      drives,
      mainRecord: mainRecord ? mainRecord._id : null,
      matchConfidence,
      verificationFlags: flags,
      isHistorical: true,
      sourceSheet: String(sheet.sheetNumber),
    };
  });

  const insertedDetail = await HddDetailSheet.insertMany(detailDocs);

  return { mainCount: insertedMain.length, detailCount: insertedDetail.length };
}
