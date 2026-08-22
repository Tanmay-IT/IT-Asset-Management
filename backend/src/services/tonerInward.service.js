import { TonerInward } from '../models/tonerInward.model.js';

export function listTonerInward() {
  return TonerInward.find().sort({ createdAt: -1 });
}

export function createTonerInward(data) {
  return TonerInward.create({ ...data, isHistorical: false });
}

export function updateTonerInward(id, data) {
  return TonerInward.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export function deleteTonerInward(id) {
  return TonerInward.findByIdAndDelete(id);
}

export function bulkCreateTonerInward(rows) {
  return TonerInward.insertMany(rows, { ordered: false });
}
