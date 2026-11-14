export interface FAQItem {
  question: string;
  answer: string;
  category: 'Products & Sizing' | 'Materials & Care' | 'Shipping & Delivery' | 'Returns & Refunds';
}

export const FAQS: FAQItem[] = [
  {
    category: 'Products & Sizing',
    question: 'Which laptops fit inside the ZIMOR Delo and Rabota totes?',
    answer: 'Both the ZIMOR Delo Tote and Rabota Tote are specifically engineered for laptops up to 15.6 inches. This includes the 16" Apple MacBook Pro (slim bezel), 15" MacBook Air, Dell XPS 15, Lenovo ThinkPad, and HP Spectre. The dedicated laptop sleeve is cushioned on all sides to protect your device during travel and daily transit.',
  },
  {
    category: 'Products & Sizing',
    question: 'Does the Classic Shoulder Bag fit a tablet or Kindle?',
    answer: 'Yes! The ZIMOR Classic Shoulder Bag comfortably fits an iPad mini, Amazon Kindle, sunglasses case, large smartphone (iPhone 16 Pro Max / Galaxy Ultra), wallet, keys, and cosmetic essentials while retaining its sleek crescent silhouette.',
  },
  {
    category: 'Materials & Care',
    question: 'What material does Zimor India use, and is it waterproof?',
    answer: 'We craft our bags from 100% Superior Faux Leather and high-density treated canvas. Our material is water-resistant, scratch-resistant, and significantly more durable than conventional synthetic leathers. While it repels light rain and spills, we recommend wiping moisture dry promptly and avoiding full immersion.',
  },
  {
    category: 'Materials & Care',
    question: 'How do I clean and maintain my Zimor bag?',
    answer: 'Routine maintenance is simple: wipe gently with a soft, slightly damp microfiber cloth and allow it to air-dry at room temperature. Avoid machine washing, bleach, or harsh chemical cleaners. To preserve its structured form over years, store in the complimentary breathable Zimor dust bag with tissue paper stuffing when not in use.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'Do you offer free shipping across India?',
    answer: 'Yes! We provide 100% Free Express Shipping on all prepaid orders across India. There are zero hidden shipping or handling fees at checkout.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'How long does delivery take, and do you offer Cash on Delivery (COD)?',
    answer: 'Orders are processed within 24 to 48 hours and typically arrive within 5 to 7 business days across metro cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) and 6 to 8 days for other pin codes. Yes, Cash on Delivery is available across most serviceable pin codes in India.',
  },
  {
    category: 'Returns & Refunds',
    question: 'What is Zimor’s return policy?',
    answer: 'We provide a 7-day easy return window from the date of delivery. If you are not completely delighted with your purchase, simply initiate a return from your Account or email us at zimorindia@gmail.com with your Order Number. The item must be unused, with original tags intact and dust bag included.',
  },
  {
    category: 'Returns & Refunds',
    question: 'How quickly are refunds credited?',
    answer: 'Once our quality team receives and verifies the returned product at our facility, refunds are initiated within 48 hours and credited to your original payment method within 5 to 7 business days.',
  },
];

