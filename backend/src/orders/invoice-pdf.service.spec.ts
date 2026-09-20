import { InvoicePdfService, InvoiceOrderData } from './invoice-pdf.service';

describe('InvoicePdfService', () => {
  let service: InvoicePdfService;

  const order: InvoiceOrderData = {
    id: 'order-1',
    invoiceNumber: 'INV-2026-0001',
    issuedAt: new Date('2026-01-01'),
    totalAmount: '1298.00',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.co.za',
    address: {
      line1: '1 Main Rd',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
    },
    items: [
      {
        productName: 'Meridian Leather Gloves',
        quantity: 2,
        priceAtOrder: '649.00',
      },
    ],
    payments: [{ provider: 'PayFast', status: 'SUCCEEDED', amount: '1298.00' }],
  };

  beforeEach(() => {
    service = new InvoicePdfService();
  });

  it('produces a real PDF document', async () => {
    const buffer = await service.generate(order, 'Nhundzu');

    expect(Buffer.isBuffer(buffer)).toBe(true);
    // Every valid PDF file starts with this signature.
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it('handles an order with no payments yet', async () => {
    const buffer = await service.generate(
      { ...order, payments: [] },
      'Nhundzu',
    );

    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('handles multiple line items without throwing', async () => {
    const buffer = await service.generate(
      {
        ...order,
        items: [
          ...order.items,
          {
            productName: 'Meridian Linen Shirt',
            quantity: 1,
            priceAtOrder: '849.00',
          },
          {
            productName: 'Meridian Silk Tie',
            quantity: 3,
            priceAtOrder: '399.00',
          },
        ],
      },
      'Nhundzu',
    );

    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
