import { HddMainRecord } from '../models/hddMainRecord.model.js';
import { HddDetailSheet } from '../models/hddDetailSheet.model.js';
import { WORKBOOK_MANIFEST } from '../data/hddSeedData.js';
import { normalizeCapacity, normalizeDate, computeMainVerificationFlags } from '../utils/hddNormalize.js';

const MAIN_EDITABLE_FIELDS = [
  'allotted',
  'brand',
  'type',
  'capacity',
  'serialNumber',
  'date',
  'information',
  'note',
];
const DETAIL_EDITABLE_FIELDS = ['userName', 'brand', 'type', 'capacity', 'serialNumber', 'dateAlloted'];

export function listMainRecords() {
  return HddMainRecord.find().sort({ srNo: 1 });
}

export function listDetailSheets() {
  return HddDetailSheet.find().sort({ sheetNumber: 1 }).populate('mainRecord');
}

export function getMainRecordById(id) {
  return HddMainRecord.findById(id);
}

export function getDetailSheetById(id) {
  return HddDetailSheet.findById(id).populate('mainRecord');
}

function pickFields(source, fields) {
  const picked = {};
  for (const field of fields) {
    if (source[field] !== undefined) picked[field] = source[field];
  }
  return picked;
}

async function nextMainSrNo() {
  const highest = await HddMainRecord.findOne({ srNo: { $ne: null } }).sort({ srNo: -1 }).select('srNo').lean();
  return (highest?.srNo || 0) + 1;
}

async function nextDetailSheetNumber() {
  const highest = await HddDetailSheet.findOne().sort({ sheetNumber: -1 }).select('sheetNumber').lean();
  return (highest?.sheetNumber || 0) + 1;
}

export async function createMainRecord(data) {
  const record = pickFields(data, MAIN_EDITABLE_FIELDS);
  record.srNo = data.srNo != null && data.srNo !== '' ? Number(data.srNo) : await nextMainSrNo();
  record.normalizedCapacityGb = normalizeCapacity(record.capacity);
  record.normalizedDate = normalizeDate(record.date);
  record.verificationFlags = computeMainVerificationFlags(record);
  record.isHistorical = false;
  record.sourceWorkbook = null;
  record.sourceSheet = 'Main';
  record.sourceRow = record.srNo;
  return HddMainRecord.create(record);
}

export async function updateMainRecord(id, data) {
  const record = pickFields(data, MAIN_EDITABLE_FIELDS);
  if (data.srNo !== undefined) record.srNo = data.srNo === '' ? null : Number(data.srNo);
  if (record.capacity !== undefined) record.normalizedCapacityGb = normalizeCapacity(record.capacity);
  if (record.date !== undefined) record.normalizedDate = normalizeDate(record.date);

  const existing = await HddMainRecord.findById(id);
  if (!existing) return null;

  Object.assign(existing, record);
  existing.verificationFlags = computeMainVerificationFlags(existing);
  existing.isHistorical = false; // once edited through the app, no longer seed-managed
  return existing.save();
}

export async function createDetailSheetForMain(mainId, data) {
  const main = await HddMainRecord.findById(mainId);
  if (!main) return null;

  const detail = pickFields(data, DETAIL_EDITABLE_FIELDS);
  detail.sheetNumber = await nextDetailSheetNumber();
  detail.hasData = true;
  detail.drives = Array.isArray(data.drives) ? data.drives : [];
  detail.normalizedCapacityGb = normalizeCapacity(detail.capacity);
  detail.normalizedDate = normalizeDate(detail.dateAlloted);
  detail.mainRecord = main._id;
  detail.matchConfidence = 'confirmed';
  detail.verificationFlags = [];
  detail.isHistorical = false;
  detail.sourceWorkbook = null;
  detail.sourceSheet = String(detail.sheetNumber);
  return HddDetailSheet.create(detail);
}

export async function updateDetailSheet(id, data) {
  const existing = await HddDetailSheet.findById(id);
  if (!existing) return null;

  const detail = pickFields(data, DETAIL_EDITABLE_FIELDS);
  Object.assign(existing, detail);
  if (Array.isArray(data.drives)) existing.drives = data.drives;
  existing.hasData = true;
  existing.normalizedCapacityGb = normalizeCapacity(existing.capacity);
  existing.normalizedDate = normalizeDate(existing.dateAlloted);
  existing.isHistorical = false;
  return existing.save();
}

/** Detail sheets that reference a given Main record's _id. */
export function findDetailSheetsForMain(mainId) {
  return HddDetailSheet.find({ mainRecord: mainId });
}

export function getWorkbookManifest() {
  return WORKBOOK_MANIFEST;
}

/**
 * Groups Main records and Detail sheets into one row per logical HDD:
 * a Main record with its linked detail sheet (if any), a Main record with
 * no detail sheet ("inventory only"), or a detail sheet with no Main record
 * ("unmatched detail sheet") — see spec sections 39/47.
 */
export async function listHddEntities() {
  const [mainRecords, detailSheets] = await Promise.all([
    HddMainRecord.find().sort({ srNo: 1 }).lean(),
    HddDetailSheet.find().sort({ sheetNumber: 1 }).lean(),
  ]);

  const detailByMainId = new Map();
  const unmatchedDetails = [];
  for (const detail of detailSheets) {
    if (detail.mainRecord) {
      detailByMainId.set(String(detail.mainRecord), detail);
    } else if (detail.hasData) {
      unmatchedDetails.push(detail);
    }
  }

  const entities = mainRecords.map((main) => ({
    main,
    detail: detailByMainId.get(String(main._id)) || null,
  }));

  for (const detail of unmatchedDetails) {
    entities.push({ main: null, detail });
  }

  return entities;
}

export async function getDashboardStats() {
  const [mainRecords, detailSheets] = await Promise.all([
    HddMainRecord.find().lean(),
    HddDetailSheet.find().lean(),
  ]);

  const totalHddRecords = mainRecords.length;
  const detailedRecords = detailSheets.filter((d) => d.hasData).length;
  const backupDrives = mainRecords.filter((m) => m.allotted.trim().toLowerCase() === 'backup drive').length;
  const assignedHdds = mainRecords.filter((m) => m.allotted && m.allotted.trim().toLowerCase() !== 'backup drive').length;

  const recordsRequiringVerification =
    mainRecords.filter((m) => m.verificationFlags.length > 0).length +
    detailSheets.filter((d) => d.matchConfidence !== 'confirmed').length;

  const cappedCapacityGb = mainRecords
    .filter((m) => typeof m.normalizedCapacityGb === 'number')
    .reduce((sum, m) => sum + m.normalizedCapacityGb, 0);
  const uncountedCapacityRecords = mainRecords.filter((m) => m.capacity && m.normalizedCapacityGb == null).length;

  return {
    totalHddRecords,
    detailedRecords,
    backupDrives,
    assignedHdds,
    recordsRequiringVerification,
    totalListedCapacityGb: Math.round(cappedCapacityGb * 100) / 100,
    uncountedCapacityRecords,
  };
}

const FIELD_LABELS = {
  allotted: 'HDD Allotted',
  brand: 'Brand',
  type: 'Type',
  capacity: 'Capacity',
  serialNumber: 'Serial Number',
  date: 'Date',
  information: 'Information',
  note: 'Note',
  userName: 'User Name',
  dateAlloted: 'Date Allotted',
};

function scanFields(source, fields, query, matches, sourceLabel) {
  for (const field of fields) {
    const value = source[field];
    if (typeof value !== 'string' || !value) continue;
    const normalized = value.toLowerCase();
    if (!normalized.includes(query)) continue;

    let score = 10;
    if (normalized.trim() === query) score = field === 'serialNumber' ? 100 : 60;
    else if (field === 'serialNumber') score = 50;

    matches.push({
      source: sourceLabel,
      field: FIELD_LABELS[field] || field,
      value,
      score,
    });
  }
}

function scanDriveEntries(drives, query, matches) {
  for (const drive of drives || []) {
    for (const entry of drive.entries || []) {
      const entryFields = ['itemType', 'nameDescription', 'formatExtension', 'freeSpaceAvailable', 'yearDate', 'notes'];
      for (const field of entryFields) {
        const value = entry[field];
        if (typeof value !== 'string' || !value) continue;
        const normalized = value.toLowerCase();
        if (!normalized.includes(query)) continue;

        const isEmailExact = normalized.trim() === query && query.includes('@');
        matches.push({
          source: `${drive.driveLetter}:\\ Drive`,
          field: field === 'nameDescription' ? 'Description' : field,
          value,
          score: isEmailExact ? 90 : normalized.trim() === query ? 55 : 15,
        });
      }
    }
  }
}

export async function searchHdd(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const entities = await listHddEntities();
  const results = [];

  for (const { main, detail } of entities) {
    const matches = [];

    if (main) {
      scanFields(
        main,
        ['allotted', 'brand', 'type', 'capacity', 'serialNumber', 'date', 'information', 'note'],
        normalizedQuery,
        matches,
        'Main record'
      );
    }
    if (detail) {
      scanFields(
        detail,
        ['userName', 'brand', 'type', 'capacity', 'serialNumber', 'dateAlloted'],
        normalizedQuery,
        matches,
        'Detail sheet'
      );
      scanDriveEntries(detail.drives, normalizedQuery, matches);
    }

    if (matches.length === 0) continue;

    const bestScore = Math.max(...matches.map((m) => m.score));
    matches.sort((a, b) => b.score - a.score);

    results.push({
      main,
      detail,
      title: (main && main.allotted) || (detail && detail.userName) || 'Unnamed HDD',
      serialNumber: (main && main.serialNumber) || (detail && detail.serialNumber) || '',
      score: bestScore,
      matches,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
