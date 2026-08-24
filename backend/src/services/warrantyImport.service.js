import { parseWorkbook, parseNumber } from '../utils/excelImportEngine.js';

const FIELD_DEFINITIONS = [
  {
    key: 'srNo',
    label: 'Sr No',
    aliases: ['srno', 'sno', 'sr'],
    transform: (raw, issues) => parseNumber(raw, issues, 'Sr No'),
  },
  { key: 'brand', label: 'Brand', aliases: ['brand'] },
  { key: 'model', label: 'Model', aliases: ['model'] },
  { key: 'serialNo', label: 'Serial No', aliases: ['serialno', 'serialnumber', 'serial'] },
  { key: 'invoiceNo', label: 'Invoice No', aliases: ['invoiceno', 'invoicenumber', 'invoice'] },
  { key: 'purchaseDate', label: 'Purchase Date', aliases: ['purchasedate'] },
  { key: 'warrantyDate', label: 'Warranty Date', aliases: ['warrantydate'] },
  { key: 'status', label: 'Status', aliases: ['status'] },
];

export function parseWarrantyWorkbook(buffer) {
  return parseWorkbook(buffer, FIELD_DEFINITIONS);
}
