import { parseWorkbook } from '../utils/excelImportEngine.js';

const FIELD_DEFINITIONS = [
  { key: 'dateOfOrder', label: 'Date of order', aliases: ['dateoforder', 'date'] },
  { key: 'tonerType', label: 'Toner Type', aliases: ['tonertype', 'type'] },
  {
    key: 'inwardQty',
    label: 'Inward QTY',
    aliases: ['inwardqty', 'inwardquantity', 'qty'],
    transform: (raw) => (Number.isNaN(Number(raw)) ? undefined : Number(raw)),
  },
  {
    key: 'balance',
    label: 'Balance',
    aliases: ['balance'],
    transform: (raw) => (Number.isNaN(Number(raw)) ? undefined : Number(raw)),
  },
];

export function parseTonerInwardWorkbook(buffer) {
  return parseWorkbook(buffer, FIELD_DEFINITIONS);
}
