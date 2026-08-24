import { Warranty } from '../models/warranty.model.js';

export function listWarranties() {
  return Warranty.find().sort({ createdAt: -1 });
}

export function createWarranty(data) {
  return Warranty.create(data);
}

export function updateWarranty(id, data) {
  return Warranty.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export function deleteWarranty(id) {
  return Warranty.findByIdAndDelete(id);
}

export async function findExistingSerialNumbers(serials) {
  if (serials.length === 0) return new Set();
  const existing = await Warranty.find({ serialNo: { $in: serials } })
    .select('serialNo')
    .lean();
  return new Set(existing.map((doc) => doc.serialNo));
}

export function bulkCreateWarranties(rows) {
  return Warranty.insertMany(rows, { ordered: false });
}
