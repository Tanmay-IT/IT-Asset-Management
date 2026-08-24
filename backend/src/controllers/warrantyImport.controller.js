import { parseWarrantyWorkbook } from '../services/warrantyImport.service.js';
import * as warrantyService from '../services/warranty.service.js';
import { createImportController } from '../utils/createImportController.js';

export const { previewImport, confirmImport } = createImportController({
  parseWorkbook: parseWarrantyWorkbook,
  dedupField: 'serialNo',
  dedupLabel: 'Serial number',
  findExisting: warrantyService.findExistingSerialNumbers,
  bulkCreate: warrantyService.bulkCreateWarranties,
});
