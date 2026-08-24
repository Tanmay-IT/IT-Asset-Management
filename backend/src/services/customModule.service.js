import { CustomModule } from '../models/customModule.model.js';
import { CustomRecord } from '../models/customRecord.model.js';

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugifyColumnKey(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function listModules() {
  return CustomModule.find().sort({ createdAt: 1 });
}

export function getModuleBySlug(slug) {
  return CustomModule.findOne({ slug });
}

export async function createModule(name) {
  const base = slugify(name) || 'module';
  let slug = base;
  let suffix = 2;
  while (await CustomModule.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return CustomModule.create({ name: name.trim(), slug, columns: [] });
}

export async function renameModule(slug, name) {
  return CustomModule.findOneAndUpdate({ slug }, { name: name.trim() }, { new: true });
}

export async function deleteModule(slug) {
  await CustomRecord.deleteMany({ moduleSlug: slug });
  return CustomModule.findOneAndDelete({ slug });
}

export async function addColumn(slug, label) {
  const module = await CustomModule.findOne({ slug });
  if (!module) return null;
  const existingKeys = new Set(module.columns.map((col) => col.key));
  const base = slugifyColumnKey(label) || 'field';
  let key = base;
  let suffix = 2;
  while (existingKeys.has(key)) {
    key = `${base}_${suffix}`;
    suffix += 1;
  }
  module.columns.push({ key, label: label.trim() });
  await module.save();
  return module;
}

export async function mergeColumns(slug, newColumns = []) {
  const module = await CustomModule.findOne({ slug });
  if (!module) return null;
  const existingKeys = new Set(module.columns.map((col) => col.key));
  let changed = false;
  for (const col of newColumns) {
    if (col?.key && !existingKeys.has(col.key)) {
      module.columns.push({ key: col.key, label: col.label || col.key });
      existingKeys.add(col.key);
      changed = true;
    }
  }
  if (changed) await module.save();
  return module;
}

export function listRecords(slug) {
  return CustomRecord.find({ moduleSlug: slug }).sort({ createdAt: -1 });
}

export function createRecord(slug, data) {
  return CustomRecord.create({ moduleSlug: slug, data });
}

export function updateRecord(id, data) {
  return CustomRecord.findByIdAndUpdate(id, { data }, { new: true, runValidators: true });
}

export function deleteRecord(id) {
  return CustomRecord.findByIdAndDelete(id);
}

export function bulkCreateRecords(slug, rows) {
  return CustomRecord.insertMany(rows.map((data) => ({ moduleSlug: slug, data })));
}
