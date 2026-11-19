// Verification script to audit legal policies and social media integration
import { connectToDatabase } from './src/db/mongodb.js';
import { SiteContentModel } from './src/db/models/SiteContent.js';
import { EXACT_PRIVACY_POLICY_TEXT, EXACT_TERMS_OF_SERVICE_TEXT, EXACT_SOCIAL_LINKS } from './src/db/seed/seed-legal-and-social.js';

async function verifyAll() {
  await connectToDatabase();
  console.log('=== STARTING MANDATORY VERIFICATION ===');

  let hasError = false;

  // 1. Verify Privacy Policy in MongoDB Atlas
  const privacyRecord = await SiteContentModel.findOne({ page: 'privacy-policy', section: 'default' }).lean();
  if (!privacyRecord) {
    console.error('FAIL: privacy-policy record not found in MongoDB Atlas');
    hasError = true;
  } else {
    const storedText = (privacyRecord.data as any)?.markdown;
    if (storedText === EXACT_PRIVACY_POLICY_TEXT) {
      console.log('PASS: Privacy Policy stored text matches EXACT source text 100% (character-by-character, length:', storedText.length, ')');
    } else {
      console.error('FAIL: Privacy Policy mismatch! Stored length:', storedText?.length, 'Expected length:', EXACT_PRIVACY_POLICY_TEXT.length);
      hasError = true;
    }
  }

  // 2. Verify Terms of Service in MongoDB Atlas
  const termsRecord = await SiteContentModel.findOne({ page: 'terms-of-service', section: 'default' }).lean();
  if (!termsRecord) {
    console.error('FAIL: terms-of-service record not found in MongoDB Atlas');
    hasError = true;
  } else {
    const storedText = (termsRecord.data as any)?.markdown;
    if (storedText === EXACT_TERMS_OF_SERVICE_TEXT) {
      console.log('PASS: Terms of Service stored text matches EXACT source text 100% (character-by-character, length:', storedText.length, ')');
    } else {
      console.error('FAIL: Terms of Service mismatch! Stored length:', storedText?.length, 'Expected length:', EXACT_TERMS_OF_SERVICE_TEXT.length);
      hasError = true;
    }
  }

  // 3. Verify Social Media Links in MongoDB Atlas
  const socialRecord = await SiteContentModel.findOne({ page: 'social_links', section: 'default' }).lean();
  if (!socialRecord) {
    console.error('FAIL: social_links record not found in MongoDB Atlas');
    hasError = true;
  } else {
    const data = socialRecord.data as any;
    console.log('Stored Social Links:', data);
    const checks = [
      ['instagram', EXACT_SOCIAL_LINKS.instagram],
      ['facebook', EXACT_SOCIAL_LINKS.facebook],
      ['pinterest', EXACT_SOCIAL_LINKS.pinterest],
      ['youtube', EXACT_SOCIAL_LINKS.youtube],
      ['threads', EXACT_SOCIAL_LINKS.threads],
    ];

    for (const [channel, url] of checks) {
      if (data[channel] === url) {
        console.log(`PASS: Social link [${channel}] matches exact URL: ${url}`);
      } else {
        console.error(`FAIL: Social link [${channel}] mismatch! Got: ${data[channel]}, Expected: ${url}`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error('=== VERIFICATION FAILED WITH ERRORS ===');
    process.exit(1);
  } else {
    console.log('=== ALL LEGAL & SOCIAL VERIFICATIONS PASSED 100% ===');
    process.exit(0);
  }
}

verifyAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
