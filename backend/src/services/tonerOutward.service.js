import { TonerOutward } from '../models/tonerOutward.model.js';

export function listTonerOutward() {
  return TonerOutward.find().sort({ createdAt: -1 });
}

export function createTonerOutward(data) {
  return TonerOutward.create({ ...data, isHistorical: false });
}

export function updateTonerOutward(id, data) {
  return TonerOutward.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export function deleteTonerOutward(id) {
  return TonerOutward.findByIdAndDelete(id);
}

export function bulkCreateTonerOutward(rows) {
  return TonerOutward.insertMany(rows, { ordered: false });
}
