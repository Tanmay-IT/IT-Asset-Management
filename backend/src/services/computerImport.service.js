import { parseWorkbook, parseBoolean, parseEnum, lowercase } from '../utils/excelImportEngine.js';

const FIELD_DEFINITIONS = [
  { key: 'firstName', label: 'First Name', aliases: ['firstname', 'first'] },
  { key: 'lastName', label: 'Last Name', aliases: ['lastname', 'last'] },
  {
    key: 'email',
    label: 'Email Address',
    aliases: ['emailaddress', 'email', 'emailid'],
    transform: lowercase,
  },
  { key: 'country', label: 'Country', aliases: ['country'] },
  { key: 'branch', label: 'Branch', aliases: ['branch'] },
  { key: 'department', label: 'Department', aliases: ['department', 'dept'] },
  { key: 'workingLocation', label: 'Working Location', aliases: ['workinglocation', 'location'] },
  {
    key: 'type',
    label: 'Desktop/Laptop',
    aliases: ['desktoplaptop', 'devicetype', 'type'],
    transform: (raw, issues) => parseEnum(raw, ['Desktop', 'Laptop'], issues, 'Desktop/Laptop'),
  },
  { key: 'modelMake', label: 'Model/Make', aliases: ['modelmake', 'model', 'make'] },
  { key: 'serialNo', label: 'Serial No', aliases: ['serialno', 'serialnumber', 'serial'] },
  { key: 'computerName', label: 'Computer Name', aliases: ['computername', 'devicename', 'hostname'] },
  { key: 'operatingSystem', label: 'Operating System', aliases: ['operatingsystem', 'os'] },
  { key: 'edition', label: 'Edition', aliases: ['edition'] },
  {
    key: 'catoInstalled',
    label: 'CATO Installed',
    aliases: ['catoinstalled', 'cato'],
    transform: (raw, issues) => parseBoolean(raw, issues, 'CATO Installed'),
  },
  {
    key: 'antivirus',
    label: 'Antivirus- Y/N',
    aliases: ['antivirusyn', 'antivirus'],
    transform: (raw, issues) => parseBoolean(raw, issues, 'Antivirus'),
  },
  {
    key: 'sophosMdr',
    label: 'Sophos MDR',
    aliases: ['sophosmdr', 'sophos'],
    transform: (raw, issues) => parseBoolean(raw, issues, 'Sophos MDR'),
  },
];

export function parseComputerWorkbook(buffer) {
  return parseWorkbook(buffer, FIELD_DEFINITIONS);
}
