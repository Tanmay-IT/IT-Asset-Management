import mongoose from 'mongoose';

const warrantySchema = new mongoose.Schema(
  {
    srNo: { type: Number, default: null },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNo: { type: String, trim: true },
    invoiceNo: { type: String, trim: true },
    purchaseDate: { type: String, trim: true },
    warrantyDate: { type: String, trim: true },
    status: { type: String, trim: true },
  },
  { timestamps: true }
);

warrantySchema.index({ serialNo: 1 });

export const Warranty = mongoose.model('Warranty', warrantySchema);
