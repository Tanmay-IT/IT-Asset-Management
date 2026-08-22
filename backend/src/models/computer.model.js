import mongoose from 'mongoose';

const computerSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    country: { type: String, trim: true },
    branch: { type: String, trim: true },
    department: { type: String, trim: true },
    workingLocation: { type: String, trim: true },
    type: { type: String, enum: ['Desktop', 'Laptop'], trim: true },
    modelMake: { type: String, trim: true },
    serialNo: { type: String, trim: true },
    computerName: { type: String, trim: true },
    operatingSystem: { type: String, trim: true },
    edition: { type: String, trim: true },
    catoInstalled: { type: Boolean, default: false },
    antivirus: { type: Boolean, default: false },
    sophosMdr: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Active', 'In Repair', 'Retired'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

computerSchema.index({ serialNo: 1 });

export const Computer = mongoose.model('Computer', computerSchema);
