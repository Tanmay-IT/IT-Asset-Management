import { Computer } from '../models/computer.model.js';

export function listComputers() {
  return Computer.find().sort({ createdAt: -1 });
}

export function createComputer(data) {
  return Computer.create(data);
}

export function updateComputer(id, data) {
  return Computer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export function deleteComputer(id) {
  return Computer.findByIdAndDelete(id);
}

export async function findExistingSerialNumbers(serials) {
  if (serials.length === 0) return new Set();
  const existing = await Computer.find({ serialNo: { $in: serials } })
    .select('serialNo')
    .lean();
  return new Set(existing.map((doc) => doc.serialNo));
}

export function bulkCreateComputers(rows) {
  return Computer.insertMany(rows, { ordered: false });
}
