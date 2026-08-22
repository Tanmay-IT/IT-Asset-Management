import { parseServerRoomWorkbook } from '../services/serverRoomItemImport.service.js';
import * as serverRoomItemService from '../services/serverRoomItem.service.js';
import { createImportController } from '../utils/createImportController.js';

export const { previewImport, confirmImport } = createImportController({
  parseWorkbook: parseServerRoomWorkbook,
  dedupField: 'serialNumber',
  dedupLabel: 'Serial number',
  findExisting: serverRoomItemService.findExistingSerialNumbers,
  bulkCreate: serverRoomItemService.bulkCreateServerRoomItems,
});
