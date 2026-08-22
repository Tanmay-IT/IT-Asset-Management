/**
 * Builds { previewImport, confirmImport } Express handlers for a resource's
 * two-step Excel import: preview parses + flags duplicates without writing
 * to the DB, confirm bulk-inserts the (optionally filtered) rows sent back.
 */
export function createImportController({ parseWorkbook, dedupField, dedupLabel, findExisting, bulkCreate }) {
  async function previewImport(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
      }

      const { rows, unmappedHeaders } = await parseWorkbook(req.file.buffer);

      const dedupValues = rows.map((row) => row.data[dedupField]).filter(Boolean);
      const existingValues = await findExisting(dedupValues);

      for (const row of rows) {
        const value = row.data[dedupField];
        if (value && existingValues.has(value)) {
          row.duplicate = true;
          row.status = 'warning';
          row.issues.push(`${dedupLabel} "${value}" already exists in the database`);
        }
      }

      res.json({
        rows,
        unmappedHeaders,
        summary: {
          total: rows.length,
          ok: rows.filter((row) => row.status === 'ok').length,
          warnings: rows.filter((row) => row.status === 'warning').length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async function confirmImport(req, res, next) {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ message: 'No rows to import.' });
      }

      const created = await bulkCreate(rows);
      res.status(201).json({ insertedCount: created.length, items: created });
    } catch (err) {
      next(err);
    }
  }

  return { previewImport, confirmImport };
}
