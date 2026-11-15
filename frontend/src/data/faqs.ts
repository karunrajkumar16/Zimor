export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  actionText: string;
  actionHref: string;
}

export const FAQ_TITLE = 'ZIMOR – Frequently Asked Questions';

export const FAQS: FAQItem[] = [
  {
    id: 'shipping',
    question: 'When can I expect my ZIMOR order to arrive?',
    answer:
      'Orders are typically processed and dispatched within 24–48 hours, and generally take 3–7 working days to reach you across India. A live courier tracking link will be shared via email or WhatsApp as soon as your shipment is on its way.',
    actionText: 'View Shipping & Delivery Policy',
    actionHref: '/policy#shipping',
  },
  {
    id: 'returns',
    question: 'What is your return and exchange policy?',
    answer:
      'If you receive a damaged, defective, or incorrect item, or wish to request an exchange, please notify us within 24 hours of delivery. Products must remain unused, unwashed, and in their original packaging with tags intact.',
    actionText: 'View Return & Exchange Policy',
    actionHref: '/policy#returns',
  },
  {
    id: 'refunds',
    question: 'How and when are refunds processed?',
    answer:
      'Refunds are initiated within 48–72 hours after your returned product passes quality inspection. Prepaid orders are credited back in 5–7 working days, while COD orders receive a secure payout link via WhatsApp or email.',
    actionText: 'View Refund Policy',
    actionHref: '/policy#refund',
  },
  {
    id: 'cancellation',
    question: 'Can I cancel my order after placing it?',
    answer:
      'Orders can be cancelled upon request within 24 hours of placing the order, provided they have not yet been packed for dispatch. Once dispatched, you may refuse delivery at your doorstep for an eligible refund.',
    actionText: 'View Cancellation Policy',
    actionHref: '/policy#cancellation',
  },
  {
    id: 'warranty',
    question: 'Is my ZIMOR bag covered under warranty?',
    answer:
      'Yes, we offer a 6-month warranty on hardware components—such as zippers, clasps, buckles, locks, hooks, and rings—against manufacturing defects starting from the date of purchase.',
    actionText: 'View Warranty Policy',
    actionHref: '/policy#warranty',
  },
  {
    id: 'care',
    question: 'How can I keep my ZIMOR bag looking its best?',
    answer:
      'Gently clean faux leather with a soft damp cloth, wipe metal hardware with a dry cloth, and avoid direct heat or harsh chemicals. Clean spills immediately, use small pouches, and store inside your complimentary dust bag.',
    actionText: 'View Bag Care Guide',
    actionHref: '/policy#care',
  },
  {
    id: 'materials',
    question: 'What materials and craftsmanship go into ZIMOR pieces?',
    answer:
      'Every piece is thoughtfully designed with premium, water-resistant faux leather, custom golden hardware, and architectural precision inspired by meticulous automotive craftsmanship.',
    actionText: 'The Story Behind Zimor',
    actionHref: '/about',
  },
];
