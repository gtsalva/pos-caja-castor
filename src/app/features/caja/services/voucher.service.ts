import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { CartItem, PaymentMethod } from '../../../shared/models/sale.model';
import { Client } from '../../../shared/models/client.model';

export interface VoucherData {
  client: Client;
  items: CartItem[];
  total: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
}

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private readonly paymentLabels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };

  generate(data: VoucherData): Blob {
    const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const rightCol = pageW - margin;   // 134mm — TOTAL right edge
    const colQtyR = 84;                // CANT. right edge
    const colPriceR = 112;             // P. UNIT. right edge
    let y = 14;

    const formatQ = (n: number) =>
      `Q ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const addPageIfNeeded = (needed: number): void => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mueblería El Castor', pageW / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Venta', pageW / 2, y, { align: 'center' });
    y += 4;
    doc.text(new Date().toLocaleString('es-GT'), pageW / 2, y, { align: 'center' });
    y += 8;

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, y, rightCol, y);
    y += 6;

    // Client
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CLIENTE', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(data.client.full_name, margin, y);
    y += 5;
    if (data.client.nit) {
      doc.text(`NIT: ${data.client.nit}`, margin, y);
      y += 5;
    }
    if (data.client.billing_address) {
      const addrLines = doc.splitTextToSize(data.client.billing_address, pageW - 2 * margin) as string[];
      doc.text(addrLines, margin, y);
      y += addrLines.length * 5;
    }
    y += 3;

    // Divider
    doc.line(margin, y, rightCol, y);
    y += 6;

    // Items header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PRODUCTO', margin, y);
    doc.text('CANT.', colQtyR, y, { align: 'right' });
    doc.text('P. UNIT.', colPriceR, y, { align: 'right' });
    doc.text('TOTAL', rightCol, y, { align: 'right' });
    y += 4;
    doc.line(margin, y, rightCol, y);
    y += 5;

    // Items rows
    doc.setFont('helvetica', 'normal');
    for (const item of data.items) {
      const lineTotal = item.unit_price * item.quantity;
      const nameLines = doc.splitTextToSize(item.name, 68) as string[];
      addPageIfNeeded(nameLines.length * 5 + 2);
      doc.text(nameLines, margin, y);
      doc.text(String(item.quantity), colQtyR, y, { align: 'right' });
      doc.text(formatQ(item.unit_price), colPriceR, y, { align: 'right' });
      doc.text(formatQ(lineTotal), rightCol, y, { align: 'right' });
      y += nameLines.length * 5;
    }

    y += 3;
    addPageIfNeeded(30);
    doc.line(margin, y, rightCol, y);
    y += 6;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', margin, y);
    doc.text(formatQ(data.total), rightCol, y, { align: 'right' });
    y += 8;

    // Payment info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método de pago: ${this.paymentLabels[data.payment_method]}`, margin, y);
    y += 5;
    if (data.payment_reference) {
      doc.text(`No. autorización: ${data.payment_reference}`, margin, y);
      y += 5;
    }

    y += 6;
    doc.setFontSize(8);
    doc.text('Gracias por su compra.', pageW / 2, y, { align: 'center' });

    return doc.output('blob');
  }
}
