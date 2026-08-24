import mongoose from 'mongoose';

/**
 * One row of a user-defined custom module. `data` is intentionally schemaless
 * (Mixed) since the module's columns are user/import-defined and can grow
 * over time — this mirrors how the HDD Archive keeps original values
 * untouched, just with no fixed field list at all.
 */
const customRecordSchema = new mongoose.Schema(
  {
    moduleSlug: { type: String, required: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const CustomRecord = mongoose.model('CustomRecord', customRecordSchema);
