import PDFDocument from 'pdfkit';
import { Order } from '../types/index.js';

/**
 * Generates an executive, luxury-branded Tax Invoice PDF for an order.
 * Returns a Promise that resolves with the complete PDF Buffer.
 */
export async function generateInvoicePdf(order: Order): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `ZIMOR Tax Invoice - ${order.orderNumber}`,
          Author: 'ZIMOR INDIA (VS Creation)',
          Subject: `Tax Invoice for Order #${order.orderNumber}`,
          Keywords: 'Zimor, Tax Invoice, Handbags, Luxury Carry',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#111111';
      const accentColor = '#B44220';
      const mutedColor = '#666666';
      const lineColor = '#E0E0E0';
      const pageMargin = 40;
      const contentWidth = 595.28 - pageMargin * 2; // A4 width = 595.28 pt

      // ==================== 1. BRAND HEADER ====================
      doc.rect(pageMargin, pageMargin, contentWidth, 3).fill(primaryColor);

      // Top Brand Titles
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(primaryColor)
        .text('Z I M O R', pageMargin, pageMargin + 12, { characterSpacing: 4 });

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text('INDIA • ARCHITECTURAL LUXURY CARRY', pageMargin, pageMargin + 38, { characterSpacing: 1.5 });

      // Invoice Badge on Top Right
      const badgeX = contentWidth + pageMargin - 180;
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(accentColor)
        .text('TAX INVOICE', badgeX, pageMargin + 12, { align: 'right', width: 180 });

      const invoiceNum = `INV-${order.orderNumber.replace(/[^a-zA-Z0-9-]/g, '')}`;
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(primaryColor)
        .text(`Invoice No: ${invoiceNum}`, badgeX, pageMargin + 30, { align: 'right', width: 180 });

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text(`Date: ${order.date || new Date().toISOString().split('T')[0]}`, badgeX, pageMargin + 44, { align: 'right', width: 180 });

      // Horizontal Divider
      doc
        .strokeColor(lineColor)
        .lineWidth(0.8)
        .moveTo(pageMargin, pageMargin + 60)
        .lineTo(pageMargin + contentWidth, pageMargin + 60)
        .stroke();

      // ==================== 2. SELLER & BUYER DETAILS ====================
      const colWidth = (contentWidth - 20) / 2;
      const detailsTop = pageMargin + 72;

      // Seller Column (Left)
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text('SOLD BY / SELLER DETAILS:', pageMargin, detailsTop, { characterSpacing: 1 });

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primaryColor)
        .text('ZIMOR INDIA', pageMargin, detailsTop + 14);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text('Marketed & Managed by VS Creation', pageMargin, detailsTop + 27)
        .text('Registered Atelier & Fulfillment Center', pageMargin, detailsTop + 39)
        .text('Email: care@zimorindia.com | zimorindia@gmail.com', pageMargin, detailsTop + 51)
        .text('Support WhatsApp: +91 89536 96928', pageMargin, detailsTop + 63)
        .text('GST Status: Registered Taxable Person', pageMargin, detailsTop + 75);

      // Buyer Column (Right)
      const buyerX = pageMargin + colWidth + 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text('BILLED & DELIVERED TO:', buyerX, detailsTop, { characterSpacing: 1 });

      const addr = order.shippingAddress || ({} as any);
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primaryColor)
        .text(addr.fullName || 'Valued Customer', buyerX, detailsTop + 14);

      let buyerY = detailsTop + 27;
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(mutedColor);

      if (addr.addressLine1) {
        doc.text(addr.addressLine1, buyerX, buyerY);
        buyerY += 12;
      }
      if (addr.addressLine2) {
        doc.text(addr.addressLine2, buyerX, buyerY);
        buyerY += 12;
      }
      const cityStateZip = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
      if (cityStateZip) {
        doc.text(cityStateZip, buyerX, buyerY);
        buyerY += 12;
      }
      doc.text(`Contact: ${addr.phone || 'N/A'}`, buyerX, buyerY);
      buyerY += 12;
      if (order.customerEmail) {
        doc.text(`Email: ${order.customerEmail}`, buyerX, buyerY);
        buyerY += 12;
      }

      // ==================== 3. ORDER & PAYMENT REFERENCE ====================
      const metaBoxY = Math.max(detailsTop + 95, buyerY + 8);
      doc
        .rect(pageMargin, metaBoxY, contentWidth, 34)
        .fill('#F9F9F9')
        .strokeColor(lineColor)
        .lineWidth(0.6)
        .stroke();

      const metaQuarter = contentWidth / 4;
      const printMetaCell = (label: string, val: string, idx: number) => {
        const x = pageMargin + idx * metaQuarter + 10;
        doc
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor(mutedColor)
          .text(label.toUpperCase(), x, metaBoxY + 7);
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text(val, x, metaBoxY + 18, { width: metaQuarter - 15, ellipsis: true });
      };

      printMetaCell('Order Reference', `#${order.orderNumber}`, 0);
      printMetaCell('Payment Method', order.paymentMethod || 'Razorpay Online', 1);
      printMetaCell('Transaction Ref', order.razorpayPaymentId || order.paymentStatus || 'Verified Paid', 2);
      printMetaCell('Logistics Provider', order.courierPartner || order.courierName || 'Shiprocket Express', 3);

      // ==================== 4. ITEMISED PRODUCTS TABLE ====================
      const tableTop = metaBoxY + 48;
      doc
        .rect(pageMargin, tableTop, contentWidth, 22)
        .fill(primaryColor);

      // Table Headers
      const colPos = {
        idx: pageMargin + 10,
        item: pageMargin + 35,
        variant: pageMargin + 260,
        qty: pageMargin + 360,
        price: pageMargin + 410,
        total: pageMargin + 480,
      };

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#FFFFFF');

      doc.text('#', colPos.idx, tableTop + 7);
      doc.text('ITEM DESCRIPTION', colPos.item, tableTop + 7);
      doc.text('VARIANT / SPECS', colPos.variant, tableTop + 7);
      doc.text('QTY', colPos.qty, tableTop + 7, { align: 'center', width: 35 });
      doc.text('UNIT PRICE', colPos.price, tableTop + 7, { align: 'right', width: 60 });
      doc.text('AMOUNT', colPos.total, tableTop + 7, { align: 'right', width: contentWidth - (colPos.total - pageMargin) - 10 });

      let currentY = tableTop + 24;

      order.items.forEach((item, idx) => {
        const rowHeight = 28;
        // Alternating row background
        if (idx % 2 === 1) {
          doc.rect(pageMargin, currentY, contentWidth, rowHeight).fill('#FAFAFA');
        }

        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(mutedColor)
          .text(String(idx + 1), colPos.idx, currentY + 8);

        // Name
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(primaryColor)
          .text(item.name, colPos.item, currentY + 5, { width: 220, ellipsis: true });

        // SKU/Category note
        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor(mutedColor)
          .text(`HSN/SAC: 4202 • SKU: ${item.slug}`, colPos.item, currentY + 16, { width: 220 });

        // Variant
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(primaryColor)
          .text(`${item.color || 'Standard'} • ${item.size || 'Standard'}`, colPos.variant, currentY + 8, { width: 90 });

        // Qty
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(primaryColor)
          .text(String(item.quantity), colPos.qty, currentY + 8, { align: 'center', width: 35 });

        // Unit Price
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(primaryColor)
          .text(`₹${item.price.toLocaleString('en-IN')}`, colPos.price, currentY + 8, { align: 'right', width: 60 });

        // Line Total
        const lineTotal = item.price * item.quantity;
        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(primaryColor)
          .text(`₹${lineTotal.toLocaleString('en-IN')}`, colPos.total, currentY + 8, {
            align: 'right',
            width: contentWidth - (colPos.total - pageMargin) - 10,
          });

        currentY += rowHeight;

        // Bottom row border
        doc
          .strokeColor(lineColor)
          .lineWidth(0.5)
          .moveTo(pageMargin, currentY)
          .lineTo(pageMargin + contentWidth, currentY)
          .stroke();
      });

      // ==================== 5. TOTALS & SUMMARY ====================
      const summaryY = currentY + 12;
      const summaryWidth = 220;
      const summaryX = pageMargin + contentWidth - summaryWidth;

      // Left Column: Terms & Notes
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(primaryColor)
        .text('TAX & WARRANTY DECLARATION', pageMargin, summaryY);

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text('• All prices include applicable Goods and Services Tax (GST @ 18%).', pageMargin, summaryY + 12)
        .text('• Covered by the 6-Month Master Hardware Warranty covering metallic components.', pageMargin, summaryY + 23)
        .text('• Returns for defects or transit damage must be notified within 24 hours of delivery.', pageMargin, summaryY + 34)
        .text('• This is a computer-generated tax invoice. No signature required.', pageMargin, summaryY + 45);

      // Right Column: Financial Calculation Breakdown
      const subtotal = order.subtotal || order.total;
      const discount = order.discount || 0;
      const shippingFee = order.shippingFee || 0;
      const finalTotal = order.total;
      const estimatedTax = Math.round((finalTotal * 18) / 118);
      const taxableValue = finalTotal - estimatedTax;

      const printSummaryRow = (lbl: string, val: string, yPos: number, isBold: boolean = false) => {
        doc
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isBold ? 9.5 : 8.5)
          .fillColor(isBold ? primaryColor : mutedColor)
          .text(lbl, summaryX, yPos);

        doc
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isBold ? 10 : 8.5)
          .fillColor(isBold ? accentColor : primaryColor)
          .text(val, summaryX + 110, yPos, { align: 'right', width: summaryWidth - 110 });
      };

      let sumRowY = summaryY;
      printSummaryRow('Subtotal:', `₹${subtotal.toLocaleString('en-IN')}`, sumRowY);
      sumRowY += 14;

      if (discount > 0) {
        printSummaryRow('Promotional Discount:', `- ₹${discount.toLocaleString('en-IN')}`, sumRowY);
        sumRowY += 14;
      }

      printSummaryRow('Express Shipping:', shippingFee > 0 ? `₹${shippingFee.toLocaleString('en-IN')}` : 'Complimentary (₹0)', sumRowY);
      sumRowY += 14;

      printSummaryRow('Taxable Value:', `₹${taxableValue.toLocaleString('en-IN')}`, sumRowY);
      sumRowY += 14;

      printSummaryRow('Estimated GST (18% incl):', `₹${estimatedTax.toLocaleString('en-IN')}`, sumRowY);
      sumRowY += 18;

      // Total Box
      doc
        .rect(summaryX - 6, sumRowY - 4, summaryWidth + 6, 24)
        .fill('#F5F5F5')
        .strokeColor(primaryColor)
        .lineWidth(0.8)
        .stroke();

      printSummaryRow('TOTAL AMOUNT PAID:', `₹${finalTotal.toLocaleString('en-IN')}`, sumRowY + 3, true);

      // ==================== 6. FOOTER SIGN OFF ====================
      const footerY = 595.28 * 1.4142 - pageMargin - 50; // standard A4 height = 841.89 pt
      doc
        .strokeColor(lineColor)
        .lineWidth(0.6)
        .moveTo(pageMargin, footerY)
        .lineTo(pageMargin + contentWidth, footerY)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(primaryColor)
        .text('FOR ZIMOR INDIA (VS CREATION)', pageMargin, footerY + 10);

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text('Authorized Signatory • Handcrafted in India • zimorindia.com', pageMargin, footerY + 22);

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text('Customer Support: care@zimorindia.com | +91 89536 96928', pageMargin, footerY + 10, {
          align: 'right',
          width: contentWidth,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
