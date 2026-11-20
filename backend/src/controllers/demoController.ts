// backend/src/controllers/demoController.ts
import { Request, Response } from 'express';
import { connectToDatabase } from '../db/mongodb.js';
import { OrderModel } from '../db/models/Order.js';
import { CustomerModel } from '../db/models/Customer.js';
import { ProductModel } from '../db/models/Product.js';
import { IssueModel } from '../db/models/Issue.js';
import { InventoryMovementModel } from '../db/models/InventoryMovement.js';

const DEMO_LIFESPAN_DAYS = 7;

export async function clearDemoDataHandler(req: Request, res: Response) {
  try {
    await connectToDatabase();

    // STRICT ISOLATION SAFETY GUARANTEE:
    // Only delete records with isDemo: true. Never delete genuine business records.
    const [deletedOrders, deletedCustomers, deletedIssues, deletedMovements] = await Promise.all([
      OrderModel.deleteMany({ isDemo: true }),
      CustomerModel.deleteMany({ isDemo: true }),
      IssueModel.deleteMany({ isDemo: true }),
      InventoryMovementModel.deleteMany({ isDemo: true }),
    ]);

    return res.json({
      success: true,
      message: 'All temporary demo records successfully purged from MongoDB Atlas.',
      purged: {
        orders: deletedOrders.deletedCount,
        customers: deletedCustomers.deletedCount,
        issues: deletedIssues.deletedCount,
        inventoryMovements: deletedMovements.deletedCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to purge demo data' });
  }
}

export async function getDemoStatusHandler(req: Request, res: Response) {
  try {
    await connectToDatabase();

    // Auto-purge any demo records that have passed their 7-day expiration
    const now = new Date();
    await Promise.all([
      OrderModel.deleteMany({ isDemo: true, demoExpiresAt: { $lte: now } }),
      CustomerModel.deleteMany({ isDemo: true, demoExpiresAt: { $lte: now } }),
      IssueModel.deleteMany({ isDemo: true, demoExpiresAt: { $lte: now } }),
      InventoryMovementModel.deleteMany({ isDemo: true, demoExpiresAt: { $lte: now } }),
    ]);

    const [demoOrdersCount, demoCustomersCount, demoIssuesCount, demoMovementsCount, sampleOrder] = await Promise.all([
      OrderModel.countDocuments({ isDemo: true }),
      CustomerModel.countDocuments({ isDemo: true }),
      IssueModel.countDocuments({ isDemo: true }),
      InventoryMovementModel.countDocuments({ isDemo: true }),
      OrderModel.findOne({ isDemo: true }).select('demoExpiresAt createdAt').lean(),
    ]);

    const isDemoActive = demoOrdersCount > 0 || demoCustomersCount > 0;

    return res.json({
      success: true,
      isDemoActive,
      demoCounts: {
        orders: demoOrdersCount,
        customers: demoCustomersCount,
        issues: demoIssuesCount,
        inventoryMovements: demoMovementsCount,
      },
      expiresAt: (sampleOrder as any)?.demoExpiresAt || null,
      createdAt: (sampleOrder as any)?.createdAt || null,
      lifespanDays: DEMO_LIFESPAN_DAYS,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to check demo status' });
  }
}

export async function seedDemoDataHandler(req: Request, res: Response) {
  try {
    await connectToDatabase();

    // 1. Clean existing demo data first to prevent duplicate accumulation
    await Promise.all([
      OrderModel.deleteMany({ isDemo: true }),
      CustomerModel.deleteMany({ isDemo: true }),
      IssueModel.deleteMany({ isDemo: true }),
      InventoryMovementModel.deleteMany({ isDemo: true }),
    ]);

    // 2. Fetch the actual 6 catalog products from MongoDB
    const products = await ProductModel.find().lean();
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Catalog products not found in database. Seed genuine products first.',
      });
    }

    // Map products by slug for easy retrieval
    const prodMap: Record<string, any> = {};
    products.forEach((p: any) => {
      prodMap[p.slug] = p;
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + DEMO_LIFESPAN_DAYS * 24 * 60 * 60 * 1000);

    // 3. Define 8 realistic simulated customers (synthetic, non-real test credentials)
    const demoCustomersData = [
      {
        name: 'Ananya Roy [DEMO]',
        email: 'demo.patron.ananya@zimor-test.internal',
        phone: '+91 99999 00001',
        designation: 'Managing Director, Private Equity',
        addresses: [
          {
            id: 'addr_demo_1',
            label: 'Residence',
            fullName: 'Ananya Roy [DEMO]',
            addressLine1: 'Penthouse 4B, Samudra Mahal, Worli Sea Face',
            line1: 'Penthouse 4B, Samudra Mahal, Worli Sea Face',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400018',
            phone: '+91 99999 00001',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Vikramaditya Mehta [DEMO]',
        email: 'demo.patron.vikram@zimor-test.internal',
        phone: '+91 99999 00002',
        designation: 'Senior Partner, Corporate Law',
        addresses: [
          {
            id: 'addr_demo_2',
            label: 'Office',
            fullName: 'Vikramaditya Mehta [DEMO]',
            addressLine1: 'Suite 1204, Embassy GolfLinks Business Park',
            line1: 'Suite 1204, Embassy GolfLinks Business Park',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560071',
            phone: '+91 99999 00002',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Meera Sen [DEMO]',
        email: 'demo.patron.meera@zimor-test.internal',
        phone: '+91 99999 00003',
        designation: 'Chief Creative Officer',
        addresses: [
          {
            id: 'addr_demo_3',
            label: 'Studio',
            fullName: 'Meera Sen [DEMO]',
            addressLine1: '14 Golf Links Boulevard',
            line1: '14 Golf Links Boulevard',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110003',
            phone: '+91 99999 00003',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Rohan Singhania [DEMO]',
        email: 'demo.patron.rohan@zimor-test.internal',
        phone: '+91 99999 00004',
        designation: 'Founder & CEO, Tech Ventures',
        addresses: [
          {
            id: 'addr_demo_4',
            label: 'Residence',
            fullName: 'Rohan Singhania [DEMO]',
            addressLine1: 'Bungalow 7, Koregaon Park North Main Rd',
            line1: 'Bungalow 7, Koregaon Park North Main Rd',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001',
            phone: '+91 99999 00004',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Dr. Sunita Rao [DEMO]',
        email: 'demo.patron.sunita@zimor-test.internal',
        phone: '+91 99999 00005',
        designation: 'Consultant Neurosurgeon',
        addresses: [
          {
            id: 'addr_demo_5',
            label: 'Clinic',
            fullName: 'Dr. Sunita Rao [DEMO]',
            addressLine1: 'Road No. 36, Jubilee Hills',
            line1: 'Road No. 36, Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500033',
            phone: '+91 99999 00005',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Arjun Kapoor [DEMO]',
        email: 'demo.patron.arjun@zimor-test.internal',
        phone: '+91 99999 00006',
        designation: 'Principal Architect',
        addresses: [
          {
            id: 'addr_demo_6',
            label: 'Atelier',
            fullName: 'Arjun Kapoor [DEMO]',
            addressLine1: '28 Boat Club Road, R.A. Puram',
            line1: '28 Boat Club Road, R.A. Puram',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600028',
            phone: '+91 99999 00006',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Devika Nambiar [DEMO]',
        email: 'demo.patron.devika@zimor-test.internal',
        phone: '+91 99999 00007',
        designation: 'Management Consultant, Strategy',
        addresses: [
          {
            id: 'addr_demo_7',
            label: 'Residence',
            fullName: 'Devika Nambiar [DEMO]',
            addressLine1: 'Villa 12, Panampilly Nagar Waterfront',
            line1: 'Villa 12, Panampilly Nagar Waterfront',
            city: 'Kochi',
            state: 'Kerala',
            pincode: '682036',
            phone: '+91 99999 00007',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Kavita Deshmukh [DEMO]',
        email: 'demo.patron.kavita@zimor-test.internal',
        phone: '+91 99999 00008',
        designation: 'Investment Banker',
        addresses: [
          {
            id: 'addr_demo_8',
            label: 'Residence',
            fullName: 'Kavita Deshmukh [DEMO]',
            addressLine1: 'Ambli-Bopal Road, Bodakdev',
            line1: 'Ambli-Bopal Road, Bodakdev',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380054',
            phone: '+91 99999 00008',
            isDefault: true,
          },
        ],
      },
    ];

    const createdCustomers = await Promise.all(
      demoCustomersData.map((c) =>
        CustomerModel.create({
          ...c,
          authProvider: 'local',
          orders: [],
          isDemo: true,
          demoExpiresAt: expiresAt,
        })
      )
    );

    const custMap: Record<string, any> = {};
    createdCustomers.forEach((c) => {
      custMap[c.email] = c;
    });

    // Helper to calculate exact date offset in past 7 days
    const getDateOffset = (daysAgo: number, hour = 11, minute = 30) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    const formatDateString = (d: Date) =>
      d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    // 4. Generate 18 Realistic Orders Spread Across 7 Days (D-6 to D-0)
    // Using the real 6 products and their exact colors!
    const ordersBlueprint = [
      // Day -6 (2026-11-14)
      {
        daysAgo: 6,
        hour: 10,
        custEmail: 'demo.patron.ananya@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261114-101',
        slugs: [{ slug: 'zimor-delo-tote', color: 'Rust', qty: 1 }],
        status: 'Delivered',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904811',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },
      {
        daysAgo: 6,
        hour: 16,
        custEmail: 'demo.patron.vikram@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261114-102',
        slugs: [
          { slug: 'zimor-rabota-tote', color: 'Cognac Brown', qty: 1 },
          { slug: 'zimor-classic-shoulder-bag', color: 'Cream', qty: 1 },
        ],
        status: 'Delivered',
        courier: 'Delhivery Luxe',
        awb: 'DEMO-AWB-DL-194022',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },

      // Day -5 (2026-11-15)
      {
        daysAgo: 5,
        hour: 11,
        custEmail: 'demo.patron.meera@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261115-103',
        slugs: [{ slug: 'zimor-delo-tote-noir', color: 'Noir Black', qty: 1 }],
        status: 'Delivered',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904835',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },
      {
        daysAgo: 5,
        hour: 15,
        custEmail: 'demo.patron.rohan@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261115-104',
        slugs: [{ slug: 'zimor-rabota-tote-espresso', color: 'Espresso Roast', qty: 1 }],
        status: 'Delivered',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904859',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },

      // Day -4 (2026-11-16)
      {
        daysAgo: 4,
        hour: 9,
        custEmail: 'demo.patron.sunita@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261116-105',
        slugs: [{ slug: 'zimor-classic-shoulder-bag-tan', color: 'Saddle Tan', qty: 2 }],
        status: 'Delivered',
        courier: 'Delhivery Luxe',
        awb: 'DEMO-AWB-DL-194088',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },
      {
        daysAgo: 4,
        hour: 14,
        custEmail: 'demo.patron.arjun@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261116-106',
        slugs: [{ slug: 'zimor-delo-tote', color: 'Noir Black', qty: 1 }],
        status: 'Delivered',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904899',
        payMethod: 'Cash on Delivery [DEMO]',
      },
      {
        daysAgo: 4,
        hour: 18,
        custEmail: 'demo.patron.kavita@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261116-107',
        slugs: [{ slug: 'zimor-rabota-tote', color: 'Espresso Roast', qty: 1 }],
        status: 'Cancelled',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904910',
        payMethod: 'Online (Card / Simulator [DEMO])',
        cancelReason: 'Customer requested cancellation within 2 hours due to delivery date clash; full refund issued.',
      },

      // Day -3 (2026-11-17)
      {
        daysAgo: 3,
        hour: 10,
        custEmail: 'demo.patron.devika@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261117-108',
        slugs: [{ slug: 'zimor-delo-tote-noir', color: 'Rust', qty: 1 }],
        status: 'Shipped',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904930',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },
      {
        daysAgo: 3,
        hour: 13,
        custEmail: 'demo.patron.ananya@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261117-109',
        slugs: [{ slug: 'zimor-rabota-tote-espresso', color: 'Cognac Brown', qty: 1 }],
        status: 'Shipped',
        courier: 'Delhivery Luxe',
        awb: 'DEMO-AWB-DL-194120',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },
      {
        daysAgo: 3,
        hour: 19,
        custEmail: 'demo.patron.vikram@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261117-110',
        slugs: [{ slug: 'zimor-classic-shoulder-bag', color: 'Saddle Tan', qty: 1 }],
        status: 'Shipped',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904945',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },

      // Day -2 (2026-11-18)
      {
        daysAgo: 2,
        hour: 11,
        custEmail: 'demo.patron.meera@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261118-111',
        slugs: [{ slug: 'zimor-delo-tote', color: 'Rust', qty: 1 }],
        status: 'Shipped',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904960',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },
      {
        daysAgo: 2,
        hour: 15,
        custEmail: 'demo.patron.rohan@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261118-112',
        slugs: [{ slug: 'zimor-rabota-tote', color: 'Cognac Brown', qty: 1 }],
        status: 'Processing',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904975',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },
      {
        daysAgo: 2,
        hour: 17,
        custEmail: 'demo.patron.sunita@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261118-113',
        slugs: [{ slug: 'zimor-classic-shoulder-bag-tan', color: 'Cream', qty: 1 }],
        status: 'Cancelled',
        courier: 'Delhivery Luxe',
        awb: 'DEMO-AWB-DL-194150',
        payMethod: 'Online (UPI / Simulator [DEMO])',
        cancelReason: 'Client changed preferred silhouette; issued instant credit refund.',
      },

      // Day -1 (2026-11-19)
      {
        daysAgo: 1,
        hour: 10,
        custEmail: 'demo.patron.arjun@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261119-114',
        slugs: [
          { slug: 'zimor-delo-tote-noir', color: 'Noir Black', qty: 1 },
          { slug: 'zimor-classic-shoulder-bag', color: 'Cream', qty: 1 },
        ],
        status: 'Processing',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-904990',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },
      {
        daysAgo: 1,
        hour: 16,
        custEmail: 'demo.patron.devika@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261119-115',
        slugs: [{ slug: 'zimor-rabota-tote-espresso', color: 'Espresso Roast', qty: 1 }],
        status: 'Processing',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-905010',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },

      // Day 0 (Today - 2026-11-20)
      {
        daysAgo: 0,
        hour: 8,
        custEmail: 'demo.patron.kavita@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261120-116',
        slugs: [{ slug: 'zimor-delo-tote', color: 'Rust', qty: 1 }],
        status: 'Confirmed',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-905030',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },
      {
        daysAgo: 0,
        hour: 11,
        custEmail: 'demo.patron.ananya@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261120-117',
        slugs: [{ slug: 'zimor-rabota-tote', color: 'Cognac Brown', qty: 1 }],
        status: 'Confirmed',
        courier: 'Delhivery Luxe',
        awb: 'DEMO-AWB-DL-194180',
        payMethod: 'Online (Card / Simulator [DEMO])',
      },
      {
        daysAgo: 0,
        hour: 14,
        custEmail: 'demo.patron.vikram@zimor-test.internal',
        orderNumber: 'DEMO-ZMR-20261120-118',
        slugs: [{ slug: 'zimor-classic-shoulder-bag-tan', color: 'Saddle Tan', qty: 1 }],
        status: 'Confirmed',
        courier: 'BlueDart Express',
        awb: 'DEMO-AWB-BD-905050',
        payMethod: 'Online (UPI / Simulator [DEMO])',
      },
    ];

    const customerOrderNumbersMap: Record<string, string[]> = {};

    const createdOrders = await Promise.all(
      ordersBlueprint.map(async (blueprint) => {
        const orderDate = getDateOffset(blueprint.daysAgo, blueprint.hour, 30);
        const cust = custMap[blueprint.custEmail];
        const shippingAddress = cust.addresses[0];

        let subtotal = 0;
        const items = blueprint.slugs.map((it) => {
          const product = prodMap[it.slug] || products[0];
          const unitPrice = product.price || 2999;
          subtotal += unitPrice * it.qty;
          const imgUrl = product.images?.[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp';

          return {
            productId: product._id?.toString() || product.id,
            name: product.name,
            slug: product.slug,
            image: imgUrl,
            color: it.color,
            size: 'Standard',
            price: unitPrice,
            quantity: it.qty,
          };
        });

        const shippingFee = subtotal >= 2000 ? 0 : 250;
        const discount = 0;
        const total = subtotal + shippingFee - discount;

        const estDate = new Date(orderDate);
        estDate.setDate(estDate.getDate() + 4);

        if (!customerOrderNumbersMap[blueprint.custEmail]) {
          customerOrderNumbersMap[blueprint.custEmail] = [];
        }
        customerOrderNumbersMap[blueprint.custEmail].push(blueprint.orderNumber);

        return OrderModel.create({
          orderNumber: blueprint.orderNumber,
          date: formatDateString(orderDate),
          createdAt: orderDate,
          updatedAt: orderDate,
          items,
          shippingAddress: {
            fullName: shippingAddress.fullName,
            addressLine1: shippingAddress.addressLine1 || shippingAddress.line1,
            addressLine2: shippingAddress.addressLine2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            phone: shippingAddress.phone,
          },
          shippingMethod: shippingFee === 0 ? 'Complimentary Air Express' : 'Priority Air Express',
          paymentMethod: blueprint.payMethod,
          subtotal,
          discount,
          shippingFee,
          total,
          status: blueprint.status as any,
          trackingNumber: blueprint.awb,
          courierName: blueprint.courier,
          estimatedDelivery: formatDateString(estDate),
          customerId: cust._id?.toString() || cust.id,
          customerEmail: blueprint.custEmail,
          isDemo: true,
          demoExpiresAt: expiresAt,
        } as any);
      })
    );

    // Update customer records with their demo orders array
    await Promise.all(
      Object.keys(customerOrderNumbersMap).map(async (email) => {
        const orderNums = customerOrderNumbersMap[email];
        await CustomerModel.updateOne(
          { email },
          { $set: { orders: orderNums } }
        );
      })
    );

    // 5. Seed 5 Realistic Support Tickets / Atelier Alerts
    const demoIssuesData = [
      {
        orderNumber: 'DEMO-ZMR-20261114-101',
        customerName: 'Ananya Roy [DEMO]',
        customerPhone: '+91 99999 00001',
        customerEmail: 'demo.patron.ananya@zimor-test.internal',
        category: 'Transit Damage',
        description: 'Outer luxury gift sleeve sustained slight pressure crease during BlueDart transit. Bag itself pristine.',
        date: formatDateString(getDateOffset(5, 14)),
        status: 'Under Review',
        resolutionNote: 'Concierge contacted client; sending complimentary monogrammed leather luggage tag as goodwill.',
      },
      {
        orderNumber: 'DEMO-ZMR-20261115-103',
        customerName: 'Meera Sen [DEMO]',
        customerPhone: '+91 99999 00003',
        customerEmail: 'demo.patron.meera@zimor-test.internal',
        category: 'Hardware Defect',
        description: 'Antique brass swivel clip on shoulder strap felt slightly stiff on initial turn.',
        date: formatDateString(getDateOffset(4, 11)),
        status: 'Replacement Sent',
        resolutionNote: 'Dispatched pre-inspected replacement hardware strap via priority courier.',
      },
      {
        orderNumber: 'DEMO-ZMR-20261116-105',
        customerName: 'Dr. Sunita Rao [DEMO]',
        customerPhone: '+91 99999 00005',
        customerEmail: 'demo.patron.sunita@zimor-test.internal',
        category: 'Size Exchange',
        description: 'Client loves the Saddle Tan leather finish, requests sizing up from Classic Shoulder Bag to Delo Tote.',
        date: formatDateString(getDateOffset(3, 16)),
        status: 'Open',
        resolutionNote: 'Awaiting return intake at atelier to process Delo Tote upgrade differential.',
      },
      {
        orderNumber: 'DEMO-ZMR-20261116-107',
        customerName: 'Kavita Deshmukh [DEMO]',
        customerPhone: '+91 99999 00008',
        customerEmail: 'demo.patron.kavita@zimor-test.internal',
        category: 'Return Request',
        description: 'Order cancelled by patron before atelier dispatch; refund initiated.',
        date: formatDateString(getDateOffset(4, 19)),
        status: 'Refund Issued',
        resolutionNote: 'Payment reversal verified on gateway simulator. Reference #SIM-RFD-88219.',
      },
      {
        orderNumber: 'DEMO-ZMR-20261114-102',
        customerName: 'Vikramaditya Mehta [DEMO]',
        customerPhone: '+91 99999 00002',
        customerEmail: 'demo.patron.vikram@zimor-test.internal',
        category: 'Missing Accessory',
        description: 'Cotton canvas dustbag and warranty authenticity certificate card not inside main tote pocket.',
        date: formatDateString(getDateOffset(5, 17)),
        status: 'Resolved',
        resolutionNote: 'Overnighted presentation folio with embossed authenticity card & spare dustbag.',
      },
    ];

    const createdIssues = await Promise.all(
      demoIssuesData.map((iss) =>
        IssueModel.create({
          ...iss,
          category: iss.category as any,
          status: iss.status as any,
          isDemo: true,
          demoExpiresAt: expiresAt,
        } as any)
      )
    );

    // 6. Seed 10 Realistic Inventory Movement Logs
    const demoMovementsData = [
      {
        productId: prodMap['zimor-delo-tote']?._id?.toString() || 'delo-1',
        productName: 'ZIMOR DELO TOTE',
        variationColor: 'Rust',
        type: 'SALE_DEDUCTION',
        quantity: -1,
        balanceAfter: 13,
        referenceOrder: 'DEMO-ZMR-20261114-101',
        note: 'Order fulfillment dispatch — Samudra Mahal, Worli',
        timestamp: getDateOffset(6, 10).toISOString(),
      },
      {
        productId: prodMap['zimor-rabota-tote']?._id?.toString() || 'rabota-1',
        productName: 'ZIMOR RABOTA TOTE',
        variationColor: 'Cognac Brown',
        type: 'SALE_DEDUCTION',
        quantity: -1,
        balanceAfter: 9,
        referenceOrder: 'DEMO-ZMR-20261114-102',
        note: 'Order fulfillment dispatch — Embassy GolfLinks, BLR',
        timestamp: getDateOffset(6, 16).toISOString(),
      },
      {
        productId: prodMap['zimor-classic-shoulder-bag']?._id?.toString() || 'shoulder-1',
        productName: 'ZIMOR CLASSIC SHOULDER BAG',
        variationColor: 'Cream',
        type: 'SALE_DEDUCTION',
        quantity: -1,
        balanceAfter: 14,
        referenceOrder: 'DEMO-ZMR-20261114-102',
        note: 'Order fulfillment dispatch — Embassy GolfLinks, BLR',
        timestamp: getDateOffset(6, 16).toISOString(),
      },
      {
        productId: prodMap['zimor-delo-tote-noir']?._id?.toString() || 'delo-2',
        productName: 'ZIMOR DELO TOTE — NOIR',
        variationColor: 'Noir Black',
        type: 'SALE_DEDUCTION',
        quantity: -1,
        balanceAfter: 15,
        referenceOrder: 'DEMO-ZMR-20261115-103',
        note: 'Order fulfillment dispatch — Golf Links Blvd, ND',
        timestamp: getDateOffset(5, 11).toISOString(),
      },
      {
        productId: prodMap['zimor-rabota-tote-espresso']?._id?.toString() || 'rabota-2',
        productName: 'ZIMOR RABOTA TOTE — ESPRESSO',
        variationColor: 'Espresso Roast',
        type: 'SALE_DEDUCTION',
        quantity: -1,
        balanceAfter: 18,
        referenceOrder: 'DEMO-ZMR-20261115-104',
        note: 'Order fulfillment dispatch — Koregaon Park, Pune',
        timestamp: getDateOffset(5, 15).toISOString(),
      },
      {
        productId: prodMap['zimor-classic-shoulder-bag-tan']?._id?.toString() || 'shoulder-2',
        productName: 'ZIMOR CLASSIC SHOULDER BAG — SADDLE TAN',
        variationColor: 'Saddle Tan',
        type: 'SALE_DEDUCTION',
        quantity: -2,
        balanceAfter: 18,
        referenceOrder: 'DEMO-ZMR-20261116-105',
        note: 'Order fulfillment dispatch — Jubilee Hills, HYD',
        timestamp: getDateOffset(4, 9).toISOString(),
      },
      {
        productId: prodMap['zimor-rabota-tote']?._id?.toString() || 'rabota-1',
        productName: 'ZIMOR RABOTA TOTE',
        variationColor: 'Espresso Roast',
        type: 'RETURN_RESTOCK',
        quantity: +1,
        balanceAfter: 10,
        referenceOrder: 'DEMO-ZMR-20261116-107',
        note: 'Customer cancellation restock back to active inventory',
        timestamp: getDateOffset(4, 18).toISOString(),
      },
      {
        productId: prodMap['zimor-delo-tote']?._id?.toString() || 'delo-1',
        productName: 'ZIMOR DELO TOTE',
        variationColor: 'Rust',
        type: 'ATELIER_INWARD',
        quantity: +5,
        balanceAfter: 18,
        referenceOrder: 'BATCH-INW-2026-11B',
        note: 'Master artisan finishing batch received from Jaipur atelier',
        timestamp: getDateOffset(3, 11).toISOString(),
      },
      {
        productId: prodMap['zimor-classic-shoulder-bag']?._id?.toString() || 'shoulder-1',
        productName: 'ZIMOR CLASSIC SHOULDER BAG',
        variationColor: 'Cream',
        type: 'QUALITY_HOLD',
        quantity: -1,
        balanceAfter: 13,
        referenceOrder: 'QA-CHECK-772',
        note: 'Quarantine for brass edge trim re-burnishing inspection',
        timestamp: getDateOffset(2, 14).toISOString(),
      },
      {
        productId: prodMap['zimor-delo-tote']?._id?.toString() || 'delo-1',
        productName: 'ZIMOR DELO TOTE',
        variationColor: 'Rust',
        type: 'SALE_DEDUCTION',
        quantity: -1,
        balanceAfter: 17,
        referenceOrder: 'DEMO-ZMR-20261120-116',
        note: 'Order placed — awaiting packaging at atelier',
        timestamp: getDateOffset(0, 8).toISOString(),
      },
    ];

    const createdMovements = await Promise.all(
      demoMovementsData.map((m) =>
        InventoryMovementModel.create({
          ...m,
          type: m.type as any,
          isDemo: true,
          demoExpiresAt: expiresAt,
        } as any)
      )
    );

    return res.status(201).json({
      success: true,
      message: 'Realistic 7-day demo dataset created successfully with strict isolation.',
      summary: {
        customers: createdCustomers.length,
        orders: createdOrders.length,
        issues: createdIssues.length,
        inventoryMovements: createdMovements.length,
        lifespan: '7 Days',
        expiresAt: expiresAt.toISOString(),
        isolatedField: 'isDemo: true',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to seed demo data' });
  }
}

export async function getInventoryMovementsHandler(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const movements = await InventoryMovementModel.find().sort({ timestamp: -1 }).lean();
    return res.json({
      movements: movements.map((m: any) => ({
        ...m,
        id: m._id?.toString() || m.id,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch inventory movements' });
  }
}

