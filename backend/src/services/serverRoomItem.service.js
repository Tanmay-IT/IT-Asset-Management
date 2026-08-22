import { ServerRoomItem } from '../models/serverRoomItem.model.js';

export function listServerRoomItems() {
  return ServerRoomItem.find().sort({ createdAt: -1 });
}

export function createServerRoomItem(data) {
  return ServerRoomItem.create(data);
}

export function updateServerRoomItem(id, data) {
  return ServerRoomItem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export function deleteServerRoomItem(id) {
  return ServerRoomItem.findByIdAndDelete(id);
}

export async function findExistingSerialNumbers(serials) {
  if (serials.length === 0) return new Set();
  const existing = await ServerRoomItem.find({ serialNumber: { $in: serials } })
    .select('serialNumber')
    .lean();
  return new Set(existing.map((doc) => doc.serialNumber));
}

export function bulkCreateServerRoomItems(rows) {
  return ServerRoomItem.insertMany(rows, { ordered: false });
}
