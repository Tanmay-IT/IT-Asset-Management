import { parseComputerWorkbook } from '../services/computerImport.service.js';
import * as computerService from '../services/computer.service.js';
import { createImportController } from '../utils/createImportController.js';

export const { previewImport, confirmImport } = createImportController({
  parseWorkbook: parseComputerWorkbook,
  dedupField: 'serialNo',
  dedupLabel: 'Serial number',
  findExisting: computerService.findExistingSerialNumbers,
  bulkCreate: computerService.bulkCreateComputers,
});
