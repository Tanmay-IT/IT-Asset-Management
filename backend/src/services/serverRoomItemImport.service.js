import { parseWorkbook } from '../utils/excelImportEngine.js';

const FIELD_DEFINITIONS = [
  { key: 'tagNumber', label: 'Tag Number', aliases: ['tagnumber', 'tag', 'tagno'] },
  { key: 'item', label: 'Item', aliases: ['item'] },
  { key: 'model', label: 'Model', aliases: ['model'] },
  { key: 'serialNumber', label: 'Serial Number', aliases: ['serialnumber', 'serialno', 'serial'] },
  { key: 'status', label: 'Status', aliases: ['status'] },
  { key: 'problem', label: 'Problem', aliases: ['problem', 'issue'] },
];

export function parseServerRoomWorkbook(buffer) {
  return parseWorkbook(buffer, FIELD_DEFINITIONS);
}
