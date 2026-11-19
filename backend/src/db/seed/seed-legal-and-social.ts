// Seed script to persist exact, verbatim legal documents and social links into MongoDB Atlas SiteContent
import { connectToDatabase } from '../mongodb.js';
import { SiteContentModel } from '../models/SiteContent.js';

export const EXACT_PRIVACY_POLICY_TEXT = `# PRIVACY POLICY

Last Updated: 17 November 2026

At ZIMOR, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and disclose your personal information when you visit our website, browse our products, place an order, contact us or otherwise interact with our services.

By accessing or using the ZIMOR website and services, you acknowledge that you have read and understood this Privacy Policy.

## PERSONAL INFORMATION

For the purposes of this Privacy Policy, "Personal Information" means information that identifies you or can reasonably be used to identify you as an individual.

This may include:

- Full name
- Billing and shipping address
- Mobile number and telephone number
- Email address
- Payment and transaction details
- Order history and purchase preferences
- Social media account information, where applicable
- Any other information voluntarily provided by you.

## HOW WE COLLECT PERSONAL INFORMATION

ZIMOR may collect personal information in the following ways:

Through Our Website: When you create an account, place an order, subscribe to our newsletter, contact customer support or interact with our website.

Through Direct Communication: When you contact us through email, telephone, WhatsApp, social media or other communication channels.

From Third Parties: We may receive relevant information from payment providers, delivery partners, advertising partners, social media platforms and other service providers.

Through Transactions: When you purchase products from ZIMOR, certain information is required to process payments, confirm orders and deliver your purchases.

Payment information may be processed directly by third-party payment service providers and will be subject to their respective privacy policies.

## HOW WE USE YOUR PERSONAL INFORMATION

We may use your personal information for the following purposes:

- To process, confirm and deliver your orders.
- To provide order updates, shipping notifications and customer support.
- To respond to your questions, requests and complaints.
- To process returns, exchanges and refunds.
- To send order-related and administrative communications.
- To share updates about new collections, launches, offers and promotions, where permitted.
- To personalize your shopping experience.
- To improve our website, products and customer experience.
- To prevent fraudulent transactions and maintain website security.
- To comply with applicable laws and regulations.

## DISCLOSURE OF PERSONAL INFORMATION

ZIMOR does not sell your personal information.

However, we may share relevant information with trusted third parties when necessary to operate our business and provide our services, including:

- Payment Providers: To securely process transactions.
- Delivery Partners: To ship and deliver your purchases.
- Technology Providers: To maintain our website, hosting, security and technical infrastructure.
- Marketing Partners: To manage advertising, promotional campaigns and customer communications, subject to applicable laws and your preferences.
- Customer Support Providers: To help manage customer enquiries and service requests.
- Legal Authorities: When disclosure is required by law or necessary to protect our legal rights.

These third parties are expected to handle your information responsibly and in accordance with applicable privacy requirements.

## COOKIES AND TRACKING TECHNOLOGIES

Our website may use cookies, pixels and similar technologies to improve your browsing and shopping experience.

Cookies may help us:

- Remember your shopping cart and preferences.
- Understand how visitors use our website.
- Improve website functionality and performance.
- Provide personalized product recommendations.
- Measure advertising and marketing effectiveness.
- Improve our overall customer experience.

You can manage or disable cookies through your browser settings. Please note that disabling certain cookies may affect some website features and functionality.

## THIRD-PARTY SERVICES

Our website may contain links to third-party websites, payment gateways, social media platforms and other external services.

ZIMOR is not responsible for the privacy practices, policies or content of these third-party services.

We encourage you to review their respective privacy policies before sharing personal information with them.

## THIRD-PARTY ADVERTISING

We may work with third-party advertising and analytics providers to display relevant advertisements and understand customer interactions with our website.

These providers may use cookies, pixels and similar technologies to collect information about browsing activity and interactions with advertisements.

You may manage certain advertising preferences through your browser, device settings or the relevant advertising platforms.

## DATA SECURITY

ZIMOR takes reasonable technical, organizational and administrative measures to protect your personal information against unauthorized access, misuse, loss, alteration or disclosure.

Although we make reasonable efforts to safeguard your information, no method of electronic transmission or storage is completely secure. Therefore, we cannot guarantee absolute security.

## YOUR PRIVACY RIGHTS AND CHOICES

You may have the right, subject to applicable laws, to:

- Request access to your personal information.
- Request correction of inaccurate or incomplete information.
- Request deletion of your personal information.
- Withdraw consent where processing is based on consent.
- Opt out of promotional emails and marketing communications.
- Raise concerns regarding the processing of your personal information.

To stop receiving promotional emails, you may use the unsubscribe link provided in our marketing emails.

Please note that we may continue sending essential communications relating to your orders, transactions, account security and customer service.

To exercise your privacy rights, please contact us using the details provided below.

## DATA RETENTION

We retain personal information only for as long as reasonably necessary to fulfil the purposes described in this Privacy Policy, including order processing, customer service, legal compliance, accounting and dispute resolution.

When personal information is no longer required, we will take reasonable steps to securely delete or anonymize it, subject to applicable legal requirements.

## CHILDREN'S PRIVACY

Our website and services are not intended for individuals under the age of 18.

ZIMOR does not knowingly collect personal information from children under 18 without appropriate consent where required by applicable law.

If we become aware that such information has been collected improperly, we will take reasonable steps to address the matter.

## INTERNATIONAL DATA TRANSFERS

Your personal information may be processed or stored by our service providers in locations outside your state or country of residence.

Where such transfers occur, ZIMOR will take reasonable steps to ensure that your personal information receives appropriate protection in accordance with applicable data protection laws.

## SENSITIVE PERSONAL INFORMATION

We request that you do not share sensitive personal information, such as financial account passwords, government identification details, health information or other highly sensitive data, through our website or communication channels unless specifically required for a legitimate purpose and through an appropriate secure process.

## UPDATES TO THIS PRIVACY POLICY

ZIMOR reserves the right to modify or update this Privacy Policy from time to time to reflect changes in our business practices, website functionality or applicable laws.

Any updates will be published on this page along with the revised "Last Updated" date.

We encourage you to review this page periodically to stay informed about how we protect your information.

## CONTACT US

If you have any questions, concerns or requests regarding this Privacy Policy or the handling of your personal information, please contact us:

Brand: ZIMOR

Email: [Your official customer support email]

Phone: [Your official contact number]

Business Address: [Your registered business address]

Privacy Contact: ZIMOR Customer Support

We will make reasonable efforts to respond to your requests within the timeframes required by applicable law.

---

Thank you for trusting ZIMOR.

Your privacy matters to us, and we are committed to providing you with a safe and secure shopping experience.`;

export const EXACT_TERMS_OF_SERVICE_TEXT = `## OVERVIEW

This website is operated by ZIMOR. Throughout the site, the terms “we”, “us” and “our” refer to ZIMOR. ZIMOR offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.

By visiting our website and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following Terms of Service (“Terms”), including any additional terms and conditions and policies referenced herein or available by hyperlink. These Terms apply to all users of the website, including browsers, vendors, customers, merchants and contributors of content.

Please read these Terms carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, you may not access the website or use our services.

Any new features or tools added to our store will also be subject to these Terms. We reserve the right to update, change or replace any part of these Terms by posting updates on our website. It is your responsibility to check this page periodically for changes. Your continued use of the website following any changes constitutes acceptance of those changes.

Our store is hosted on Shopify Inc., which provides us with the online e-commerce platform that allows us to sell our products and services.

## ONLINE STORE TERMS

By agreeing to these Terms, you confirm that you are at least the age of majority in your state or country of residence, or that you have obtained the necessary consent from a parent or legal guardian.

You may not use our products for any illegal or unauthorized purpose, nor may you violate any applicable laws while using our services, including copyright laws.

You must not transmit any viruses, malware, worms or any code of a destructive nature.

Any breach or violation of these Terms may result in the immediate termination of your access to our services.

## GENERAL CONDITIONS

We reserve the right to refuse service to anyone for any reason at any time, subject to applicable laws.

You understand that your content (excluding payment information) may be transferred unencrypted over various networks and may undergo changes to meet technical requirements. Payment information is encrypted during transfer over networks.

You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of our website, services or content without our express written permission.

The headings used in this agreement are included for convenience only and do not affect the interpretation of these Terms.

## ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION

We are not responsible if information available on this website is inaccurate, incomplete or outdated.

The material on this website is provided for general information and should not be relied upon as the sole basis for making purchasing decisions.

Product images, descriptions, specifications and other information are provided as accurately as possible. However, slight variations in colour, texture, appearance or finish may occur due to lighting, photography, screen settings or manufacturing differences.

We reserve the right to modify website content at any time without an obligation to update previously published information.

## MODIFICATIONS TO THE SERVICE AND PRICES

Prices of our products are subject to change without prior notice.

We reserve the right to modify, suspend or discontinue any part of our website or services at any time without notice.

ZIMOR shall not be liable to you or any third party for any modification, price change, suspension or discontinuation of services, except as required by applicable law.

## PRODUCTS OR SERVICES

Certain products may be available exclusively online through our website. These products may have limited quantities and are subject to returns or exchanges only in accordance with our Refund and Return Policy.

We make every effort to display our products as accurately as possible, including colours, designs, materials and details. However, actual product colours may vary depending on your screen and device settings.

ZIMOR reserves the right to limit product sales to any person, geographic region or jurisdiction, subject to applicable laws.

We also reserve the right to limit quantities, discontinue products or modify product descriptions and pricing at any time without prior notice.

All product offers are subject to availability.

## ACCURACY OF BILLING AND ACCOUNT INFORMATION

We reserve the right to refuse or cancel any order placed with us.

We may, at our discretion, limit or cancel quantities purchased per person, household or order. These restrictions may apply to orders placed using the same customer account, payment method, billing address or shipping address.

If we make changes to or cancel an order, we may attempt to notify you using the email address or phone number provided at checkout.

You agree to provide accurate, complete and current purchase and account information for all transactions made through our store.

You are responsible for ensuring that your contact, billing and shipping information is correct to avoid delivery delays or failed transactions.

For further details, please review our Refund and Return Policy.

## OPTIONAL TOOLS

We may provide access to third-party tools or services over which we have no control or involvement.

You acknowledge that these tools are provided on an “as is” and “as available” basis without warranties or guarantees of any kind.

Your use of optional third-party tools is entirely at your own risk, and you should review the terms and conditions of the relevant third-party providers before using them.

Any new features or services introduced on our website will also be subject to these Terms.

## THIRD-PARTY LINKS

Our website may contain links to third-party websites, products or services.

These links may direct you to websites that are not affiliated with ZIMOR. We are not responsible for examining or evaluating the content, accuracy or policies of these third-party websites.

ZIMOR shall not be responsible for any damages, losses or issues arising from transactions or interactions with third-party websites.

We encourage you to review the policies and terms of any third-party website before engaging in transactions with them.

## USER COMMENTS, FEEDBACK AND SUBMISSIONS

If you submit comments, suggestions, ideas, reviews, feedback or other materials to us, you grant ZIMOR permission to use, reproduce, edit, publish and distribute such submissions for business and promotional purposes, subject to applicable law.

We are not obligated to maintain comments in confidence, provide compensation or respond to submissions unless otherwise agreed.

You agree that your submissions will not violate the rights of any third party, including intellectual property, privacy or other proprietary rights.

You must not submit unlawful, offensive, abusive, misleading or harmful content or upload any viruses or malicious code.

You remain responsible for the content and accuracy of any comments or submissions you provide.

## PERSONAL INFORMATION

Your submission of personal information through our store is governed by our Privacy Policy.

Please review our Privacy Policy to understand how we collect, use, store and protect your personal information.

## ERRORS, INACCURACIES AND OMISSIONS

Occasionally, information on our website may contain typographical errors, inaccuracies or omissions relating to product descriptions, pricing, promotions, shipping charges, delivery timelines or product availability.

We reserve the right to correct such errors, update information or cancel orders if any information is inaccurate, even after an order has been placed, subject to applicable consumer protection laws.

We are not obligated to update or clarify information on our website unless required by law.

## PROHIBITED USES

You are prohibited from using our website or its content:

(a) For any unlawful purpose.

(b) To solicit others to participate in unlawful activities.

(c) To violate any applicable laws or regulations.

(d) To infringe upon our intellectual property rights or those of others.

(e) To harass, abuse, insult, harm, defame or discriminate against others.

(f) To submit false or misleading information.

(g) To upload or transmit viruses or malicious code.

(h) To collect or track the personal information of others without authorization.

(i) To spam, phish, scrape or collect website information without permission.

(j) For any obscene or unlawful purpose.

(k) To interfere with or bypass the security features of our website.

We reserve the right to suspend or terminate access to our services if these prohibited activities are identified, subject to applicable law.

## DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY

We do not guarantee that your use of our website or services will be uninterrupted, timely, secure or error-free.

All products and services are provided on an “as is” and “as available” basis, except where warranties or guarantees are expressly provided by us or required by applicable law.

To the maximum extent permitted by applicable law, ZIMOR and its representatives shall not be liable for indirect, incidental, special or consequential damages arising from the use of our website or products.

Nothing in these Terms shall exclude or limit any rights or remedies available to consumers under applicable Indian laws.

## INDEMNIFICATION

You agree to indemnify and hold harmless ZIMOR, its affiliates, employees, partners, service providers and representatives from claims, losses, liabilities and expenses arising from your violation of these Terms, applicable laws or the rights of any third party, to the extent permitted by applicable law.

## SEVERABILITY

If any provision of these Terms is found to be unlawful, invalid or unenforceable, that provision shall be enforced to the maximum extent permitted by law.

The remaining provisions shall continue to remain valid and enforceable.

## TERMINATION

These Terms remain effective unless terminated by either you or us.

You may stop using our website at any time.

We reserve the right to suspend or terminate your access to our services if we reasonably believe that you have violated these Terms or applicable laws.

Any obligations or liabilities arising before termination shall continue to apply where required.

## ENTIRE AGREEMENT

These Terms, together with our Privacy Policy, Refund and Return Policy, Shipping Policy and other policies published on our website, constitute the entire agreement between you and ZIMOR regarding your use of our website and services.

Any failure by us to exercise or enforce any right under these Terms shall not constitute a waiver of that right.

## GOVERNING LAW

These Terms of Service and any separate agreements through which we provide services shall be governed by and interpreted in accordance with the laws of India.

Any disputes arising in connection with these Terms shall be subject to the jurisdiction of competent courts in India, subject to applicable consumer protection laws.

## CHANGES TO TERMS OF SERVICE

You can review the latest version of our Terms of Service at any time on this page.

ZIMOR reserves the right to update, modify or replace any part of these Terms by publishing changes on our website.

It is your responsibility to review this page periodically.

Your continued use of our website or services after any changes have been published constitutes acceptance of the revised Terms.

## CONTACT INFORMATION

If you have any questions regarding these Terms of Service, please contact us through the contact details provided on our website.

Brand: ZIMOR`;

export const EXACT_SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/zimorworld/',
  facebook: 'https://www.facebook.com/share/1Fc7XXTj2F/',
  pinterest: 'https://pin.it/4uigbL9Ia',
  youtube: 'https://youtube.com/@zimorworld-z3p4i?si=VCZI4SNBN1czSifG',
  threads: 'https://www.threads.com/@zimorworld',
};

export async function seedLegalAndSocial() {
  await connectToDatabase();
  console.log('[Seed] Connected to MongoDB Atlas');

  // 1. Privacy Policy
  await SiteContentModel.findOneAndUpdate(
    { page: 'privacy-policy', section: 'default' },
    {
      page: 'privacy-policy',
      section: 'default',
      data: {
        title: 'PRIVACY POLICY',
        lastUpdated: '17 November 2026',
        markdown: EXACT_PRIVACY_POLICY_TEXT,
        isImmutable: true,
      },
      updatedAt: new Date().toISOString(),
    },
    { upsert: true, new: true }
  );
  console.log('[Seed] Stored exact Privacy Policy in MongoDB Atlas');

  // 2. Terms of Service
  await SiteContentModel.findOneAndUpdate(
    { page: 'terms-of-service', section: 'default' },
    {
      page: 'terms-of-service',
      section: 'default',
      data: {
        title: 'TERMS OF SERVICE',
        markdown: EXACT_TERMS_OF_SERVICE_TEXT,
        isImmutable: true,
      },
      updatedAt: new Date().toISOString(),
    },
    { upsert: true, new: true }
  );
  console.log('[Seed] Stored exact Terms of Service in MongoDB Atlas');

  // 3. Social Media Links
  await SiteContentModel.findOneAndUpdate(
    { page: 'social_links', section: 'default' },
    {
      page: 'social_links',
      section: 'default',
      data: EXACT_SOCIAL_LINKS,
      updatedAt: new Date().toISOString(),
    },
    { upsert: true, new: true }
  );
  console.log('[Seed] Stored exact Social Media Links in MongoDB Atlas');
}

if (process.argv[1]?.endsWith('seed-legal-and-social.ts')) {
  seedLegalAndSocial()
    .then(() => {
      console.log('[Seed] Finished successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
