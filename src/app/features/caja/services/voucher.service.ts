import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import { CartItem, PaymentMethod, SalePaymentItem } from '../../../shared/models/sale.model';
import { Client } from '../../../shared/models/client.model';
import { StoreSettingsService } from '../../../shared/services/store-settings.service';
import { PDF_COLOR, TYPO, drawContinuationMark, drawLetterhead, drawSignatures, setType } from '../../../shared/print/print-branding';

export interface VoucherData {
  client: Client;
  items: CartItem[];
  total: number;
  payments: SalePaymentItem[];
}

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private readonly storeSettings = inject(StoreSettingsService);

  private readonly paymentLabels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    VISACUOTAS: 'Visa Cuotas',
  };

  generate(data: VoucherData): Blob {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = doc.internal.pageSize.getWidth();    // 210
    const pageH = doc.internal.pageSize.getHeight();   // 297
    const margin = 14;
    const rightCol = pageW - margin;     // TOTAL right edge
    const colQtyR = rightCol - 56;       // CANT. right edge
    const colPriceR = rightCol - 28;     // P. UNIT. right edge
    let y = 14;

    const formatQ = (n: number) =>
      `Q ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const addPageIfNeeded = (needed: number): void => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = drawContinuationMark(doc);
      }
    };

    // Membrete
    y = drawLetterhead(doc, {
      storeName: this.storeSettings.store_name(),
      docTitle: 'Comprobante de Venta',
      metaLines: [new Date().toLocaleString('es-GT')],
    });

    // Client
    setType(doc, TYPO.section);
    doc.setTextColor(PDF_COLOR.gray);
    doc.text('CLIENTE', margin, y);
    y += 6;
    setType(doc, TYPO.body);
    doc.setTextColor(PDF_COLOR.ink);
    doc.text(data.client.full_name, margin, y);
    y += 6;
    if (data.client.business_name) {
      doc.text(data.client.business_name, margin, y);
      y += 6;
    }
    if (data.client.nit) {
      doc.text(`NIT: ${data.client.nit}`, margin, y);
      y += 6;
    }
    if (data.client.dpi) {
      doc.text(`DPI: ${data.client.dpi}`, margin, y);
      y += 6;
    }
    if (data.client.phone) {
      doc.text(`Tel: ${data.client.phone}`, margin, y);
      y += 6;
    }
    if (data.client.email) {
      doc.text(data.client.email, margin, y);
      y += 6;
    }
    const addr = [data.client.billing_address, data.client.billing_city, data.client.billing_department]
      .filter((p): p is string => !!p)
      .join(', ');
    if (addr) {
      const addrLines = doc.splitTextToSize(addr, pageW - 2 * margin) as string[];
      doc.text(addrLines, margin, y);
      y += addrLines.length * 6;
    }
    y += 3;

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, y, rightCol, y);
    y += 6;

    // Items header
    setType(doc, TYPO.tableHead);
    doc.setTextColor(PDF_COLOR.gray);
    doc.text('PRODUCTO', margin, y);
    doc.text('CANT.', colQtyR, y, { align: 'right' });
    doc.text('P. UNIT.', colPriceR, y, { align: 'right' });
    doc.text('TOTAL', rightCol, y, { align: 'right' });
    y += 5;
    doc.setDrawColor(200);
    doc.line(margin, y, rightCol, y);
    y += 6;

    // Items rows
    setType(doc, TYPO.body);
    doc.setTextColor(PDF_COLOR.ink);
    for (const item of data.items) {
      const effectivePrice = item.custom_price ?? item.unit_price;
      const lineTotal      = effectivePrice * item.quantity;
      const nameLines = doc.splitTextToSize(item.name, colQtyR - margin - 4) as string[];
      addPageIfNeeded(nameLines.length * 6 + 2);
      doc.text(nameLines, margin, y);
      doc.text(String(item.quantity), colQtyR, y, { align: 'right' });
      doc.text(formatQ(effectivePrice), colPriceR, y, { align: 'right' });
      doc.text(formatQ(lineTotal), rightCol, y, { align: 'right' });
      y += nameLines.length * 6;
    }

    y += 3;
    addPageIfNeeded(34);
    doc.setDrawColor(180);
    doc.line(margin, y, rightCol, y);
    y += 7;

    // Total
    setType(doc, TYPO.total);
    doc.text('TOTAL', margin, y);
    doc.text(formatQ(data.total), rightCol, y, { align: 'right' });
    y += 9;

    // Payment info
    setType(doc, TYPO.section);
    doc.setTextColor(PDF_COLOR.gray);
    doc.text('FORMA DE PAGO', margin, y);
    y += 6;
    setType(doc, TYPO.body);
    doc.setTextColor(PDF_COLOR.ink);
    for (const p of data.payments) {
      addPageIfNeeded(12);
      const label = this.paymentLabels[p.payment_method];
      const amountStr = formatQ(p.amount);
      doc.text(`${label}: ${amountStr}`, margin, y);
      y += 6;
      if (p.payment_reference) {
        doc.text(`  No. autorización: ${p.payment_reference}`, margin, y);
        y += 6;
      }
    }

    // Firmas (garantiza > media página)
    drawSignatures(doc, y);

    setType(doc, TYPO.note);
    doc.setTextColor(PDF_COLOR.faint);
    doc.text('Gracias por su compra.', pageW / 2, pageH - 14, { align: 'center' });

    return doc.output('blob');
  }
}
