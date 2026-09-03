export interface InvoiceEmailItem {
  name: string;
  quantity: number;
  priceAtOrder: string;
}

export interface Mailer {
  sendPasswordResetEmail(params: {
    to: string;
    resetUrl: string;
  }): Promise<void>;

  sendVerificationEmail(params: {
    to: string;
    firstName: string;
    verifyUrl: string;
  }): Promise<void>;

  sendInvoiceEmail(params: {
    to: string;
    firstName: string;
    orderId: string;
    invoiceNumber: string;
    items: InvoiceEmailItem[];
    totalAmount: string;
  }): Promise<void>;

  sendOrderStatusEmail(params: {
    to: string;
    firstName: string;
    orderId: string;
    status: 'SHIPPED' | 'DELIVERED';
  }): Promise<void>;
}
