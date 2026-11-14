import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'zimor-delo-tote-rust',
    name: 'ZIMOR DELO TOTE',
    slug: 'zimor-delo-tote',
    tagline: 'Structured Elegance for Daily Commutes & Boardroom Presence',
    description: 'Designed for modern professionals, the ZIMOR Delo Tote combines elegance, organization, and everyday functionality. Crafted from Superior Faux leather with a structured silhouette, it comfortably fits laptops up to 15.6 inches while keeping your daily essentials neatly organized.',
    price: 2999,
    compareAtPrice: 5199,
    category: 'tote-bags',
    categoryLabel: 'Tote Bags',
    colors: [
      { name: 'Rust Caramel', hex: '#C73030' },
      { name: 'Noir Black', hex: '#1C1917' },
    ],
    defaultColor: 'Rust Caramel',
    sizes: ['Medium (15.6" Laptop)'],
    stock: 14,
    isFeatured: true,
    averageRating: 4.8,
    numReviews: 4,
    images: [
      {
        url: '/products/delo-1.jpg',
        alt: 'ZIMOR Delo Tote in Rust Caramel front view with shoulder drop',
      },
      {
        url: '/products/delo-2.jpg',
        alt: 'ZIMOR Delo Tote interior compartments and dedicated laptop compartment',
      },
      {
        url: '/products/delo-3.jpg',
        alt: 'ZIMOR Delo Tote side profile with detachable matching wristlet pouch',
      },
      {
        url: '/products/delo-4.jpg',
        alt: 'ZIMOR Delo Tote flatlay with notebook, planner, charger and essentials',
      },
    ],
    features: [
      'Spacious main compartment with dedicated padded laptop section (fits up to 15.6" laptops)',
      'Multiple interior pockets, card slots, pen holders, key leash, and secure zip pocket',
      'Front and back quick-access zip pockets for boarding pass, phone, or metro card',
      'Superior Faux leather exterior with durable hardware and refined caramel accents',
      'Reinforced shoulder handles engineered for fatigue-free all-day carry',
      'Includes a matching detachable wristlet pouch for cosmetics or quick coffee runs',
      'Reinforced bottom panel with metal protective studs to prevent scuffing',
    ],
    material: [
      'Exterior: 100% Superior Faux Leather (scratch and water-resistant)',
      'Interior: High-density durable polyester twill lining',
      'Hardware: Heavy-duty custom gold-tone metal zippers and pullers',
    ],
    careInstructions: [
      'Wipe clean with a soft, dry or slightly damp microfiber cloth',
      'Avoid prolonged exposure to intense direct sunlight, heat, and moisture',
      'Store in the provided breathable Zimor dust bag when not in use',
      'Do not machine wash, tumble dry, or use chemical solvents',
      'Avoid overloading to preserve the bag’s crisp structured silhouette',
    ],
    dimensions: {
      length: '40 cm',
      height: '30 cm',
      width: '15 cm',
      strapDrop: '14 cm',
      weight: '0.70 kg',
    },
    suitableProfessions: ['corporate-executive', 'consultant', 'legal-finance'],
    giftingOccasions: ['promotion-milestone', 'anniversary-gift', 'corporate-appreciation'],
    laptopCompatibility: 'Up to 15.6 inch (MacBook Pro 16", ThinkPad, Dell XPS)',
  },
  {
    id: 'zimor-delo-tote-noir',
    name: 'ZIMOR DELO TOTE — NOIR',
    slug: 'zimor-delo-tote-noir',
    tagline: 'Timeless Monochromatic Power for Modern Executives',
    description: 'The iconic Delo silhouette presented in deep Noir. Built for professionals who prefer a quiet, understated authority in business meetings and executive presentations. Features identical spacious organization, dedicated 15.6" padded laptop sleeve, and complementary wristlet pouch.',
    price: 2999,
    compareAtPrice: 5199,
    category: 'tote-bags',
    categoryLabel: 'Tote Bags',
    colors: [
      { name: 'Noir Black', hex: '#1C1917' },
      { name: 'Rust Caramel', hex: '#C73030' },
    ],
    defaultColor: 'Noir Black',
    sizes: ['Medium (15.6" Laptop)'],
    stock: 8,
    isFeatured: true,
    averageRating: 4.9,
    numReviews: 6,
    images: [
      {
        url: '/products/delo-1.jpg',
        alt: 'ZIMOR Delo Tote Noir structured silhouette',
      },
      {
        url: '/products/delo-3.jpg',
        alt: 'ZIMOR Delo Tote Noir edition side and wristlet detail',
      },
      {
        url: '/products/delo-2.jpg',
        alt: 'ZIMOR Delo Tote interior compartments',
      },
      {
        url: '/products/delo-4.jpg',
        alt: 'ZIMOR Delo Tote daily work items organized',
      },
    ],
    features: [
      'Monochromatic Noir finish with sleek dark-gold custom hardware',
      'Dedicated padded compartment engineered for 13" to 15.6" laptops',
      '6 internal organizer slots: 3 card holders, 2 pen loops, 1 key tether',
      'Full-length exterior slip sleeve for travel documents or tablet',
      'Includes matching Noir wristlet pouch with wrist strap',
      'Dual flat shoulder straps designed to stay secure on wool coats and blazers',
    ],
    material: [
      'Exterior: 100% Superior Faux Leather in matte Noir grain',
      'Interior: Charcoal stain-resistant twill lining',
      'Hardware: Reinforced custom alloy hardware in brushed gold',
    ],
    careInstructions: [
      'Gently wipe with a damp microfiber cloth',
      'Store in a cool dry space inside the complimentary dust bag',
      'Keep away from oil-based makeup and open pens',
    ],
    dimensions: {
      length: '40 cm',
      height: '30 cm',
      width: '15 cm',
      strapDrop: '14 cm',
      weight: '0.70 kg',
    },
    suitableProfessions: ['legal-finance', 'corporate-executive', 'tech-founder'],
    giftingOccasions: ['promotion-milestone', 'birthday-celebration', 'graduation-gift'],
    laptopCompatibility: 'Up to 15.6 inch (MacBook Pro 14"/16", Surface Laptop)',
  },
  {
    id: 'zimor-rabota-tote-cognac',
    name: 'ZIMOR RABOTA TOTE',
    slug: 'zimor-rabota-tote',
    tagline: 'Dual-Carry Versatility with Detachable Sling for Dynamic Workdays',
    description: 'Carry everything you need in impeccable style with the Zimor Rabota Tote Bag. Designed for active workdays and effortless commuting, this structured tote features a spacious interior fitting up to a 15” laptop, along with dedicated compartments and an adjustable, detachable shoulder sling for crossbody convenience.',
    price: 2999,
    compareAtPrice: 5199,
    category: 'laptop-bags',
    categoryLabel: 'Laptop Bags',
    colors: [
      { name: 'Cognac Brown', hex: '#9C2C2C' },
      { name: 'Espresso Roast', hex: '#3D2B1F' },
    ],
    defaultColor: 'Cognac Brown',
    sizes: ['Medium (15" Laptop)'],
    stock: 9,
    isFeatured: true,
    averageRating: 5.0,
    numReviews: 3,
    images: [
      {
        url: '/products/rabota-1.jpg',
        alt: 'ZIMOR Rabota Tote in Cognac Brown with dual handles and structured base',
      },
      {
        url: '/products/rabota-2.jpg',
        alt: 'ZIMOR Rabota Tote interior organization showing laptop sleeve and pockets',
      },
      {
        url: '/products/rabota-3.jpg',
        alt: 'ZIMOR Rabota Tote with detachable crossbody sling strap attached',
      },
      {
        url: '/products/rabota-4.jpg',
        alt: 'ZIMOR Rabota Tote side angle showing smooth metal zipper closure',
      },
    ],
    features: [
      'Dual-carry system: Structured top grab handles + adjustable detachable crossbody sling',
      'Accommodates laptops up to 15" with cushioned impact protection',
      'Thoughtful interior layout: 1 laptop section, 3 card slots, 4 slip pockets, 1 zipper pocket',
      '2 dedicated pen slots, 1 integrated key ring holder, 1 matching cosmetic pouch included',
      'Secure full-zip top closure to keep your valuables completely protected on public transit',
      'Structured silhouette that stands upright on desks, conference tables, and café floors',
    ],
    material: [
      'Exterior: 100% Superior Faux Leather in rich Cognac grain',
      'Interior: Durable tear-resistant polyester lining',
      'Hardware: High-grade polished metal zippers and swiveling snap hooks',
    ],
    careInstructions: [
      'Wipe clean with a soft dry or lightly moistened cloth',
      'Avoid leaving under direct sun or near radiator heating',
      'Store upright in the original Zimor dust pouch',
      'Do not machine wash or dry clean',
    ],
    dimensions: {
      length: '40 cm',
      height: '30 cm',
      width: '15 cm',
      strapDrop: '14 cm handle drop + adjustable 110cm sling',
      weight: '0.70 kg',
    },
    suitableProfessions: ['tech-founder', 'consultant', 'creative-director'],
    giftingOccasions: ['graduation-gift', 'promotion-milestone', 'birthday-celebration'],
    laptopCompatibility: 'Up to 15 inch (MacBook Air 15", MacBook Pro 14", ThinkPad)',
  },
  {
    id: 'zimor-rabota-tote-espresso',
    name: 'ZIMOR RABOTA TOTE — ESPRESSO',
    slug: 'zimor-rabota-tote-espresso',
    tagline: 'Deep Earthy Tones for Architects, Creators & Technologists',
    description: 'The versatile Rabota Tote reimagined in rich Espresso Roast. Engineered for professionals on the move who need seamless transitions between meetings, client sites, and weekend transit. Comes complete with detachable crossbody strap and integrated cosmetic pouch.',
    price: 2999,
    compareAtPrice: 5199,
    category: 'laptop-bags',
    categoryLabel: 'Laptop Bags',
    colors: [
      { name: 'Espresso Roast', hex: '#3D2B1F' },
      { name: 'Cognac Brown', hex: '#9C2C2C' },
    ],
    defaultColor: 'Espresso Roast',
    sizes: ['Medium (15" Laptop)'],
    stock: 11,
    isFeatured: false,
    averageRating: 4.9,
    numReviews: 4,
    images: [
      {
        url: '/products/rabota-4.jpg',
        alt: 'ZIMOR Rabota Tote in Espresso finish showing texture and zipper',
      },
      {
        url: '/products/rabota-1.jpg',
        alt: 'ZIMOR Rabota Tote structured front stance',
      },
      {
        url: '/products/rabota-2.jpg',
        alt: 'ZIMOR Rabota interior organizer view',
      },
      {
        url: '/products/rabota-3.jpg',
        alt: 'ZIMOR Rabota sling strap carry detail',
      },
    ],
    features: [
      'Rich Espresso faux leather exterior that ages beautifully with use',
      'Includes detachable long strap for hands-free shoulder or crossbody commute',
      'Dedicated padded laptop compartment (up to 15" screen size)',
      'Organized multi-pocket divider: 4 slip pockets, 3 card slots, 2 pen loops',
      'Includes standalone matching mini zipper pouch',
      'Sturdy structured base that stands on its own',
    ],
    material: [
      'Exterior: Superior Faux Leather in deep Espresso hue',
      'Interior: Heavy-duty polyester twill lining',
      'Hardware: Antique-gold tone metal zippers and clasps',
    ],
    careInstructions: [
      'Clean with a soft dry cloth',
      'Avoid placing next to sharp objects or abrasive surfaces',
      'Keep stuffed with tissue when stored long-term to retain structure',
    ],
    dimensions: {
      length: '40 cm',
      height: '30 cm',
      width: '15 cm',
      strapDrop: '14 cm handle drop + adjustable 110cm sling',
      weight: '0.70 kg',
    },
    suitableProfessions: ['tech-founder', 'creative-director', 'academic-doctor'],
    giftingOccasions: ['anniversary-gift', 'promotion-milestone', 'corporate-appreciation'],
    laptopCompatibility: 'Up to 15 inch (MacBook Pro 14", Dell XPS 13/15)',
  },
  {
    id: 'zimor-classic-shoulder-bag-cream',
    name: 'ZIMOR CLASSIC SHOULDER BAG',
    slug: 'zimor-classic-shoulder-bag',
    tagline: 'Minimalist Crescent Silhouette with Elegant Gold-Tone Hardware',
    description: 'Elevate your everyday style with the Zimor Classic Shoulder Bag featuring Superior Canvas body with refined faux leather trim and elegant gold-tone hardware. Designed with a sleek crescent silhouette, comfortable non-adjustable shoulder strap, and secure magnetic flap closure, it offers just the right space for daily essentials.',
    price: 1699,
    compareAtPrice: 2999,
    category: 'shoulder-bags',
    categoryLabel: 'Shoulder Bags',
    colors: [
      { name: 'Cream Canvas', hex: '#FFF6F0' },
      { name: 'Saddle Tan', hex: '#8C5835' },
    ],
    defaultColor: 'Cream Canvas',
    sizes: ['Small (Everyday Carry)'],
    stock: 14,
    isFeatured: true,
    averageRating: 4.6,
    numReviews: 5,
    images: [
      {
        url: '/products/classic-1.jpg',
        alt: 'ZIMOR Classic Shoulder Bag in Cream Canvas with tan faux leather accents',
      },
      {
        url: '/products/classic-2.jpg',
        alt: 'ZIMOR Classic Shoulder Bag styled on shoulder showing compact crescent profile',
      },
      {
        url: '/products/classic-3.jpg',
        alt: 'ZIMOR Classic Shoulder Bag interior showing magnetic flap and card pockets',
      },
      {
        url: '/products/classic-4.jpg',
        alt: 'ZIMOR Classic Shoulder Bag gold metal hardware and stitching detail',
      },
    ],
    features: [
      'Sculptural crescent flap silhouette that tucks comfortably under the arm',
      'Superior Canvas body reinforced with supple faux leather trims and edge painting',
      'Smooth magnetic snap closure for effortless single-handed opening',
      'Main compartment fits smartphone, wallet, keys, lipstick, sunglasses, and earbuds',
      'Interior zip wall pocket plus slip card pocket for credit cards and ID',
      'Comfort-contoured non-adjustable shoulder strap with 10" drop',
      'Ideal for casual brunches, gallery visits, evening dinners, and daily errands',
    ],
    material: [
      'Exterior: Superior Heavyweight Canvas with Faux Leather Trim',
      'Interior: Soft brushed polyester lining',
      'Hardware: Custom Gold-Tone Metal Accents & magnetic lock',
    ],
    careInstructions: [
      'Spot clean canvas and faux leather with a slightly damp cloth',
      'Do not machine wash, bleach, or tumble dry',
      'Avoid prolonged exposure to pouring rain and intense sunlight',
      'Store in the custom Zimor dust bag to preserve flap curvature',
    ],
    dimensions: {
      length: '26 cm (10.23")',
      height: '19 cm (7.48")',
      width: '9.5 cm (3.76")',
      strapDrop: '25.4 cm (10")',
      weight: '0.42 kg',
    },
    suitableProfessions: ['creative-director', 'academic-doctor', 'consultant'],
    giftingOccasions: ['birthday-celebration', 'anniversary-gift', 'festive-celebration'],
    laptopCompatibility: 'Fits iPad mini / Kindle, wallet, smartphone & daily beauty essentials',
  },
  {
    id: 'zimor-classic-shoulder-bag-tan',
    name: 'ZIMOR CLASSIC SHOULDER BAG — SADDLE TAN',
    slug: 'zimor-classic-shoulder-bag-tan',
    tagline: 'All-Weather Faux Leather in Warm Saddle Tan for Evening Glam & Brunches',
    description: 'An all-leather edition of our popular crescent shoulder bag in warm Saddle Tan. Delivers an effortless French-girl aesthetic with structured curved contours and luminous gold hardware. Transitions seamlessly from daytime meetings to twilight dinners.',
    price: 1699,
    compareAtPrice: 2999,
    category: 'shoulder-bags',
    categoryLabel: 'Shoulder Bags',
    colors: [
      { name: 'Saddle Tan', hex: '#8C5835' },
      { name: 'Cream Canvas', hex: '#FFF6F0' },
    ],
    defaultColor: 'Saddle Tan',
    sizes: ['Small (Everyday Carry)'],
    stock: 12,
    isFeatured: true,
    averageRating: 4.8,
    numReviews: 7,
    images: [
      {
        url: '/products/classic-2.jpg',
        alt: 'ZIMOR Classic Shoulder Bag Saddle Tan on model',
      },
      {
        url: '/products/classic-1.jpg',
        alt: 'ZIMOR Classic Shoulder Bag front view',
      },
      {
        url: '/products/classic-4.jpg',
        alt: 'ZIMOR Classic Shoulder Bag hardware close-up',
      },
      {
        url: '/products/classic-3.jpg',
        alt: 'ZIMOR Classic Shoulder Bag interior compartments',
      },
    ],
    features: [
      'Full Superior Faux Leather body in luminous warm Saddle Tan tone',
      'Architectural curved silhouette with tailored edge painting',
      'Concealed high-strength magnetic snap closure',
      'Tucked under-arm ergonomic shoulder strap with 10" drop',
      'Interior zip wall pocket and quick-access slip pocket',
      'Scratch-resistant water-resistant exterior finish',
    ],
    material: [
      'Exterior: 100% Superior Faux Leather in Saddle Tan grain',
      'Interior: Tonal polyester twill lining',
      'Hardware: High-shine polished gold-tone hardware',
    ],
    careInstructions: [
      'Wipe with a soft damp cloth',
      'Store in a cool dry space away from sharp jewelry',
      'Use the included dust bag for seasonal storage',
    ],
    dimensions: {
      length: '26 cm (10.23")',
      height: '19 cm (7.48")',
      width: '9.5 cm (3.76")',
      strapDrop: '25.4 cm (10")',
      weight: '0.42 kg',
    },
    suitableProfessions: ['creative-director', 'legal-finance', 'academic-doctor'],
    giftingOccasions: ['birthday-celebration', 'festive-celebration', 'anniversary-gift'],
    laptopCompatibility: 'Fits Kindle, sunglasses case, phone, power bank & cardholder',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return PRODUCTS.filter((p) => p.slug !== product.slug)
    .sort((a, b) => {
      // Prioritize same category first
      if (a.category === product.category && b.category !== product.category) return -1;
      if (b.category === product.category && a.category !== product.category) return 1;
      return 0;
    })
    .slice(0, limit);
}

