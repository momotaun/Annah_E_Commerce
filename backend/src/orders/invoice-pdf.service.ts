import { Injectable } from '@nestjs/common';
import { join } from 'path';
import PDFDocument from 'pdfkit';

// The real "EliteCommerce - Monochrome Black Logo" brand-kit asset (see the
// mobile app's assets/brand/monochrome_black_logo.svg — this is the same
// kit, rasterized once at build time since pdfkit embeds raster images,
// not SVG) — the intended print/single-color use case for that asset.
const LOGO_PATH = join(__dirname, 'assets', 'monochrome-logo.png');

const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4 in points
const CONTENT_RIGHT = PAGE_WIDTH - PAGE_MARGIN;

export interface InvoiceItemData {
  productName: string;
  quantity: number;
  priceAtOrder: string;
}

export interface InvoicePaymentData {
  provider: string;
  status: string;
  amount: string;
}

export interface InvoiceOrderData {
  id: string;
  invoiceNumber: string;
  issuedAt: Date;
  totalAmount: string;
  customerName: string;
  customerEmail: string;
  address: {
    line1: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: InvoiceItemData[];
  payments: InvoicePaymentData[];
}

function formatCurrency(amount: number): string {
  return `R ${amount.toFixed(2)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/// Renders a real invoice/receipt document for an order — only real data
/// already on the order (items, prices, address, invoice number) plus the
/// site's actual name, no invented tax/registration figures.
@Injectable()
export class InvoicePdfService {
  generate(order: InvoiceOrderData, siteName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.renderHeader(doc, order);
      this.renderBillTo(doc, order);
      const totalsBottom = this.renderItemsTable(doc, order);
      this.renderPayments(doc, order, totalsBottom);
      this.renderFooter(doc, siteName);

      doc.end();
    });
  }

  private renderHeader(doc: PDFKit.PDFDocument, order: InvoiceOrderData): void {
    doc.image(LOGO_PATH, PAGE_MARGIN, 40, { width: 170 });

    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#111827')
      .text('TAX INVOICE', PAGE_MARGIN, 110);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6b7280')
      .text(`Invoice ${order.invoiceNumber}`, PAGE_MARGIN, 134)
      .text(`Issued ${formatDate(order.issuedAt)}`, PAGE_MARGIN, 148)
      .text(`Order ${order.id}`, PAGE_MARGIN, 162);
  }

  private renderBillTo(doc: PDFKit.PDFDocument, order: InvoiceOrderData): void {
    const x = 340;
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#6b7280')
      .text('BILLED TO', x, 110);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#111827')
      .text(order.customerName, x, 124)
      .fontSize(9)
      .fillColor('#6b7280')
      .text(order.customerEmail, x, 140)
      .text(order.address.line1, x, 154)
      .text(
        `${order.address.city}, ${order.address.province} ${order.address.postalCode}`,
        x,
        168,
      );
  }

  private renderItemsTable(
    doc: PDFKit.PDFDocument,
    order: InvoiceOrderData,
  ): number {
    const colItem = PAGE_MARGIN;
    const colQty = 340;
    const colUnit = 390;
    const colTotal = 470;
    const colTotalWidth = CONTENT_RIGHT - colTotal;

    let y = 220;
    doc
      .moveTo(PAGE_MARGIN, y)
      .lineTo(CONTENT_RIGHT, y)
      .strokeColor('#e5e7eb')
      .stroke();
    y += 10;

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#6b7280');
    doc.text('ITEM', colItem, y);
    doc.text('QTY', colQty, y, { width: colUnit - colQty, align: 'right' });
    doc.text('UNIT PRICE', colUnit, y, {
      width: colTotal - colUnit,
      align: 'right',
    });
    doc.text('TOTAL', colTotal, y, { width: colTotalWidth, align: 'right' });
    y += 14;

    doc
      .moveTo(PAGE_MARGIN, y)
      .lineTo(CONTENT_RIGHT, y)
      .strokeColor('#e5e7eb')
      .stroke();
    y += 10;

    doc.font('Helvetica').fillColor('#111827').fontSize(9.5);
    for (const item of order.items) {
      const unit = parseFloat(item.priceAtOrder);
      const lineTotal = unit * item.quantity;
      const rowTop = y;
      doc.text(item.productName, colItem, rowTop, {
        width: colQty - colItem - 10,
      });
      doc.text(String(item.quantity), colQty, rowTop, {
        width: colUnit - colQty,
        align: 'right',
      });
      doc.text(formatCurrency(unit), colUnit, rowTop, {
        width: colTotal - colUnit,
        align: 'right',
      });
      doc.text(formatCurrency(lineTotal), colTotal, rowTop, {
        width: colTotalWidth,
        align: 'right',
      });
      y =
        rowTop +
        Math.max(
          16,
          doc.heightOfString(item.productName, {
            width: colQty - colItem - 10,
          }) + 4,
        );
    }

    y += 6;
    doc
      .moveTo(colUnit, y)
      .lineTo(CONTENT_RIGHT, y)
      .strokeColor('#e5e7eb')
      .stroke();
    y += 10;

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827');
    doc.text('TOTAL', colUnit, y, {
      width: colTotal - colUnit,
      align: 'right',
    });
    doc.text(formatCurrency(parseFloat(order.totalAmount)), colTotal, y, {
      width: colTotalWidth,
      align: 'right',
    });
    y += 24;

    return y;
  }

  private renderPayments(
    doc: PDFKit.PDFDocument,
    order: InvoiceOrderData,
    startY: number,
  ): void {
    if (order.payments.length === 0) return;

    let y = startY;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#6b7280');
    doc.text('PAYMENT', PAGE_MARGIN, y);
    y += 14;

    doc.font('Helvetica').fontSize(9.5).fillColor('#111827');
    for (const payment of order.payments) {
      doc.text(
        `${payment.provider} · ${payment.status} · ${formatCurrency(
          parseFloat(payment.amount),
        )}`,
        PAGE_MARGIN,
        y,
      );
      y += 14;
    }
  }

  private renderFooter(doc: PDFKit.PDFDocument, siteName: string): void {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `${siteName} — generated ${formatDate(new Date())}`,
        PAGE_MARGIN,
        780,
        { width: CONTENT_RIGHT - PAGE_MARGIN, align: 'center' },
      );
  }
}
