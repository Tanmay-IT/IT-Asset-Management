import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/**
 * A user-defined resource created entirely through the UI (Sidebar's "+ Add
 * Module"), with no code change required — `columns` starts empty and grows
 * as data arrives (an Excel import's headers, or a manually added column).
 * Records live in the separate schemaless `CustomRecord` collection, keyed
 * by `slug`.
 */
const customModuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    columns: { type: [columnSchema], default: [] },
  },
  { timestamps: true }
);

export const CustomModule = mongoose.model('CustomModule', customModuleSchema);
