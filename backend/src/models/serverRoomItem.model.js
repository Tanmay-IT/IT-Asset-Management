import mongoose from 'mongoose';

const serverRoomItemSchema = new mongoose.Schema(
  {
    tagNumber: { type: String, trim: true },
    item: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    status: { type: String, trim: true },
    problem: { type: String, trim: true },
  },
  { timestamps: true }
);

serverRoomItemSchema.index({ serialNumber: 1 });

export const ServerRoomItem = mongoose.model('ServerRoomItem', serverRoomItemSchema);
