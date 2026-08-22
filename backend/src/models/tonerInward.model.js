import mongoose from 'mongoose';

const tonerInwardSchema = new mongoose.Schema(
  {
    dateOfOrder: { type: String, trim: true },
    tonerType: { type: String, trim: true },
    inwardQty: { type: Number, default: null },
    balance: { type: Number, default: null },
    note: { type: String, trim: true },
    isHistorical: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tonerInwardSchema.index({ tonerType: 1 });

export const TonerInward = mongoose.model('TonerInward', tonerInwardSchema);
