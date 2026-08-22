/**
 * Best-effort transcription of the Inward/Outward toner tracking sheets the
 * user shared as photos (not a text spec, unlike hddSeedData.js). Row-to-date
 * grouping for merged cells is the least certain part of a photo read —
 * flagged to the user for a spot-check. Everything here is freely editable
 * (and deletable) in the app, unlike the HDD historical archive.
 */

export const TONER_INWARD_SEED = [
  { dateOfOrder: '10-03-2026', tonerType: '12A', inwardQty: 4, balance: null },
  { dateOfOrder: '10-03-2026', tonerType: '80A', inwardQty: 2, balance: 0 },
  { dateOfOrder: '26-03-2026', tonerType: '12A', inwardQty: 4, balance: null },
  { dateOfOrder: '26-03-2026', tonerType: '80A', inwardQty: 2, balance: 0 },
  { dateOfOrder: '13-04-2026', tonerType: '80A', inwardQty: 4, balance: null },
  { dateOfOrder: '13-04-2026', tonerType: '80A', inwardQty: 2, balance: null },
  { dateOfOrder: '07-05-2026', tonerType: '12A', inwardQty: 4, balance: null },
  { dateOfOrder: '07-05-2026', tonerType: '12A', inwardQty: 4, balance: null },
  { dateOfOrder: '23-06-2026', tonerType: '12A', inwardQty: 4, balance: null },
  { dateOfOrder: '23-06-2026', tonerType: '80A', inwardQty: 2, balance: null },
  { dateOfOrder: '23-06-2026', tonerType: '88A', inwardQty: 1, balance: null },
  { dateOfOrder: '07-07-2026', tonerType: '12A', inwardQty: 4, balance: null },
  { dateOfOrder: '07-07-2026', tonerType: '80A', inwardQty: 2, balance: null },
  { dateOfOrder: '12-08-2026', tonerType: '76A', inwardQty: 1, balance: null, note: 'FOR HR' },
];

export const TONER_OUTWARD_SEED = [
  { dateOfOrder: '', tonerType: '80A', deliveredTo: 'Sameer Kurkute (JNPT)', qtyDelivered: '2', dateDelivered: '' },
  {
    dateOfOrder: '26-03-2026',
    tonerType: '12A',
    deliveredTo: 'Snehal Joshi (JNPT)',
    qtyDelivered: '2',
    dateDelivered: '27-03-2026',
  },
  { dateOfOrder: '26-03-2026', tonerType: '80A', deliveredTo: '', qtyDelivered: '', dateDelivered: '' },
  {
    dateOfOrder: '08-04-2026',
    tonerType: '12A',
    deliveredTo: 'Sudesh (HO)',
    qtyDelivered: '1 used in HO printer',
    dateDelivered: '08-04-2026',
  },
  { dateOfOrder: '09-04-2026', tonerType: '80A', deliveredTo: 'Punjab CFS', qtyDelivered: '2', dateDelivered: '' },
  {
    dateOfOrder: '21-04-2026',
    tonerType: '12A',
    deliveredTo: 'From Mahendra, To - JWC',
    qtyDelivered: '2',
    dateDelivered: '22-04-2026',
  },
  { dateOfOrder: '21-04-2026', tonerType: '80A', deliveredTo: '', qtyDelivered: '2', dateDelivered: '22-04-2026' },
  {
    dateOfOrder: '22-04-2026',
    tonerType: '12A',
    deliveredTo: 'From Snehal, To-',
    qtyDelivered: '2',
    dateDelivered: '22-04-2026',
  },
  {
    dateOfOrder: '22-04-2026',
    tonerType: '80A',
    deliveredTo: 'Mahindra - to JWC',
    qtyDelivered: '2',
    dateDelivered: '30-04-2026',
  },
  {
    dateOfOrder: '30-04-2026',
    tonerType: '12A',
    deliveredTo: 'Mahindra - to JWC',
    qtyDelivered: '2',
    dateDelivered: '',
  },
  {
    dateOfOrder: '10-06-2026',
    tonerType: '12A',
    deliveredTo: 'Mahindra - to JWC',
    qtyDelivered: '2',
    dateDelivered: '12-06-2026',
  },
  {
    dateOfOrder: '12-06-2026',
    tonerType: '80A',
    deliveredTo: 'PRADEEP AUTI -PUNB',
    qtyDelivered: '2',
    dateDelivered: '',
  },
  {
    dateOfOrder: '24-06-2026',
    tonerType: '80A',
    deliveredTo: 'PRADEEP AUTI -PUNB',
    qtyDelivered: '2',
    dateDelivered: '24-06-2026',
  },
  { dateOfOrder: '24-06-2026', tonerType: '88A', deliveredTo: 'Neral', qtyDelivered: '1', dateDelivered: '24-06-2026' },
  { dateOfOrder: '', tonerType: '12A', deliveredTo: 'Snehal JNPT', qtyDelivered: '2', dateDelivered: '25-06-2026' },
  { dateOfOrder: '', tonerType: '12A', deliveredTo: 'Snehal JNPT', qtyDelivered: '2', dateDelivered: '09-07-2026' },
  {
    dateOfOrder: '',
    tonerType: '80A',
    deliveredTo: 'PRADEEP AUTI -PUNB',
    qtyDelivered: '2',
    dateDelivered: '31-07-2026',
  },
  {
    dateOfOrder: '',
    tonerType: '12A',
    deliveredTo: 'Snehal Joshi (JNPT)',
    qtyDelivered: '2',
    dateDelivered: '18-08-2026',
  },
];
