import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', '.local-data', 'db');

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27117,
    dbName: 'itam-air-engine',
    dbPath,
    storageEngine: 'wiredTiger',
  },
});

console.log(`Local MongoDB running at ${mongod.getUri()}`);
console.log(`Data is stored persistently in ${dbPath} — press Ctrl+C to stop.`);

process.on('SIGINT', async () => {
  await mongod.stop({ doCleanup: false });
  process.exit(0);
});
