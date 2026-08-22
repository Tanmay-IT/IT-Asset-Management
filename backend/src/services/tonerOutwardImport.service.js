import { parseWorkbook } from '../utils/excelImportEngine.js';

const FIELD_DEFINITIONS = [
  { key: 'dateOfOrder', label: 'Date of order', aliases: ['dateoforder', 'date'] },
  { key: 'tonerType', label: 'Toner Type', aliases: ['tonertype', 'type'] },
  {
    key: 'deliveredTo',
    label: 'Place Delivered',
    aliases: ['placewherethetonerisdelivered', 'deliveredto', 'place'],
  },
  {
    key: 'qtyDelivered',
    label: 'Qty Delivered',
    aliases: ['qtyoftonerdeliveredused', 'qtydelivered', 'quantitydeliveredused', 'qty'],
  },
  {
    key: 'dateDelivered',
    label: 'Date Delivered',
    aliases: ['dateitgotdelivereddateitstartedusing', 'datedelivered', 'dateused'],
  },
];

export function parseTonerOutwardWorkbook(buffer) {
  return parseWorkbook(buffer, FIELD_DEFINITIONS);
}
