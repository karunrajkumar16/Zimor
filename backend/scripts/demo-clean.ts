// backend/scripts/demo-clean.ts
import 'dotenv/config';
import { clearDemoDataHandler } from '../src/controllers/demoController.js';

async function main() {
  console.log('[DEMO CLI] Purging all isolated demo records from MongoDB Atlas...');
  const req = {} as any;
  let responseData: any = null;
  let statusCode = 200;

  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
  } as any;

  await clearDemoDataHandler(req, res);

  if (statusCode >= 400 || !responseData?.success) {
    console.error('[DEMO CLI ERROR]', responseData);
    process.exit(1);
  }

  console.log('[DEMO CLI SUCCESS]', responseData.message);
  console.log('[PURGED COUNTS]', JSON.stringify(responseData.purged, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('[DEMO CLI FATAL]', err);
  process.exit(1);
});
