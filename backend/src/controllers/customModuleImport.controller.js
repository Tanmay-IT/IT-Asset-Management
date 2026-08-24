import { parseWorkbookDynamic } from '../utils/excelImportEngine.js';
import * as customModuleService from '../services/customModule.service.js';

/**
 * Not built on `createImportController` — that helper assumes a fixed
 * field list and a dedup key, neither of which exists for a user-defined
 * module. Columns are detected fresh from the uploaded file's own headers
 * and merged into the module's column list on confirm.
 */
export async function previewImport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded.' });
    }
    const module = await customModuleService.getModuleBySlug(req.params.slug);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const { rows, columns } = await parseWorkbookDynamic(req.file.buffer);

    res.json({
      rows,
      columns,
      unmappedHeaders: [],
      summary: { total: rows.length, ok: rows.length, warnings: 0 },
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmImport(req, res, next) {
  try {
    const { rows, columns } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No rows to import.' });
    }
    const module = await customModuleService.mergeColumns(req.params.slug, columns || []);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    const created = await customModuleService.bulkCreateRecords(req.params.slug, rows);
    res.status(201).json({ insertedCount: created.length, items: created, module });
  } catch (err) {
    next(err);
  }
}
