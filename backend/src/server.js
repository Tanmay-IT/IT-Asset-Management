import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

async function main() {
  await connectDB(process.env.MONGODB_URI);

  const app = createApp();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
