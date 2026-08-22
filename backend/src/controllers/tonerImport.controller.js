import { parseTonerInwardWorkbook } from '../services/tonerInwardImport.service.js';
import { parseTonerOutwardWorkbook } from '../services/tonerOutwardImport.service.js';
import * as tonerInwardService from '../services/tonerInward.service.js';
import * as tonerOutwardService from '../services/tonerOutward.service.js';

// Toner log entries have no reliable natural key to dedupe against — the
// same toner type legitimately recurs across many separate orders/deliveries
// — so unlike Computers/Server Room import, this is preview + confirm with
// no duplicate detection.

function buildSummary(rows) {
  return { total: rows.length, ok: rows.filter((r) => r.status === 'ok').length, warnings: rows.filter((r) => r.status === 'warning').length };
}

export async function previewInwardImport(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file was uploaded.' });
    const { rows, unmappedHeaders } = await parseTonerInwardWorkbook(req.file.buffer);
    res.json({ rows, unmappedHeaders, summary: buildSummary(rows) });
  } catch (err) {
    next(err);
  }
}

export async function confirmInwardImport(req, res, next) {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: 'No rows to import.' });
    const created = await tonerInwardService.bulkCreateTonerInward(rows.map((r) => ({ ...r, isHistorical: false })));
    res.status(201).json({ insertedCount: created.length, items: created });
  } catch (err) {
    next(err);
  }
}

export async function previewOutwardImport(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file was uploaded.' });
    const { rows, unmappedHeaders } = await parseTonerOutwardWorkbook(req.file.buffer);
    res.json({ rows, unmappedHeaders, summary: buildSummary(rows) });
  } catch (err) {
    next(err);
  }
}

export async function confirmOutwardImport(req, res, next) {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: 'No rows to import.' });
    const created = await tonerOutwardService.bulkCreateTonerOutward(rows.map((r) => ({ ...r, isHistorical: false })));
    res.status(201).json({ insertedCount: created.length, items: created });
  } catch (err) {
    next(err);
  }
}
