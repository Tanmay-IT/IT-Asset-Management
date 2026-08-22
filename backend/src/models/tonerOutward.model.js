import mongoose from 'mongoose';

const tonerOutwardSchema = new mongoose.Schema(
  {
    dateOfOrder: { type: String, trim: true },
    tonerType: { type: String, trim: true },
    deliveredTo: { type: String, trim: true },
    // Kept as a string, not a Number — source data mixes real quantities
    // with free text (e.g. "1 used in HO printer"); forcing it to a number
    // would silently drop that description.
    qtyDelivered: { type: String, trim: true },
    dateDelivered: { type: String, trim: true },
    isHistorical: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tonerOutwardSchema.index({ tonerType: 1 });

export const TonerOutward = mongoose.model('TonerOutward', tonerOutwardSchema);
