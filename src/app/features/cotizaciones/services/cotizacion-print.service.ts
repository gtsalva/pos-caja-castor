import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import { CustomOrder } from '../models/custom-order.model';
import { StoreSettingsService } from '../../../shared/services/store-settings.service';

@Injectable({ providedIn: 'root' })
export class CotizacionPrintService {
  private readonly storeSettings = inject(StoreSettingsService);

  generate(order: CustomOrder, printedAt: Date): Blob {
    const storeName = this.storeSettings.store_name();
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pW = doc.internal.pageSize.getWidth();
    const pH = doc.internal.pageSize.getHeight();
    const m  = 14;
    const rEdge   = pW - m;
    const colQty  = rEdge - 56;
    const colUnit = rEdge - 28;
    let y = 14;

    const agreedTotal = order.agreed_price ?? order.total;
    const balance     = Math.max(0, agreedTotal - order.total_paid);
    const percent     = agreedTotal > 0
      ? Math.min(100, Math.round((order.total_paid / agreedTotal) * 100))
      : 0;

    const c = order.client;
    const clientName     = c?.full_name ?? order.client_name ?? 'Sin nombre';
    const clientBusiness = c?.business_name ?? null;
    const clientNit      = c?.nit ?? null;
    const clientDpi      = c?.dpi ?? null;
    const clientPhone    = c?.phone ?? order.client_phone ?? null;
    const clientEmail    = c?.email ?? order.client_email ?? null;
    const clientAddress  = [c?.billing_address, c?.billing_city, c?.billing_department]
      .filter((p): p is string => !!p)
      .join(', ') || null;

    const fmt = (n: number) =>
      `Q ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const fmtDate = (s: string) =>
      new Date(s).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const page = (): void => { doc.addPage(); y = m; };
    const need = (h: number): void => { if (y + h > pH - m) page(); };
    const divider = (): void => {
      doc.setDrawColor(200); doc.line(m, y, rEdge, y); y += 5;
    };
    const labelVal = (label: string, val: string): void => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');   doc.text(label, m, y);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(val, rEdge - (m + 30)) as string[];
      doc.text(lines, m + 30, y);
      y += Math.max(1, lines.length) * 5;
    };

    const statusLabels: Record<string, string> = {
      DRAFT: 'Borrador', SENT: 'Enviada', APPROVED: 'Aprobada',
      IN_PRODUCTION: 'En producción', DELIVERED: 'Entregada',
      COMPLETED: 'Completada', CANCELLED: 'Cancelada',
    };
    const payLabels: Record<string, string> = {
      CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', VISACUOTAS: 'Visa Cuotas',
    };

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 90, 26);
    doc.text(storeName, pW / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Ventas, diseño y fabricación de muebles', pW / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text('Comprobante de Cotización', pW / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`${order.order_number} · ${statusLabels[order.status] ?? order.status}`, pW / 2, y, { align: 'center' });
    y += 7;
    doc.setDrawColor(200, 90, 26);
    doc.setLineWidth(0.6);
    doc.line(m, y, rEdge, y);
    doc.setLineWidth(0.2);
    y += 6;

    // ── Client info ─────────────────────────────────────────────────────────
    doc.setTextColor(50);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', m, y);
    y += 5;
    labelVal('Cliente:', clientName);
    if (clientBusiness)     labelVal('Empresa:', clientBusiness);
    if (clientNit)          labelVal('NIT:', clientNit);
    if (clientDpi)          labelVal('DPI:', clientDpi);
    if (clientPhone)        labelVal('Teléfono:', clientPhone);
    if (clientEmail)        labelVal('Correo:', clientEmail);
    if (clientAddress)      labelVal('Dirección:', clientAddress);
    if (order.delivery_date) labelVal('Fecha entrega:', order.delivery_date);
    labelVal('Vendedor:', order.salesperson.full_name);
    labelVal('Fecha cotización:', fmtDate(order.created_at));
    y += 2;
    divider();

    // ── Items ────────────────────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('DESCRIPCIÓN', m, y);
    doc.text('CANT.',    colQty,  y, { align: 'right' });
    doc.text('P.UNIT.',  colUnit, y, { align: 'right' });
    doc.text('SUBTOTAL', rEdge,   y, { align: 'right' });
    y += 4;
    doc.setDrawColor(200); doc.line(m, y, rEdge, y); y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    for (const item of order.items) {
      const descLines = doc.splitTextToSize(item.description, colQty - m - 4) as string[];
      need(descLines.length * 5 + 2);
      doc.text(descLines, m, y);
      doc.text(String(item.quantity), colQty,  y, { align: 'right' });
      doc.text(fmt(item.unit_price),  colUnit, y, { align: 'right' });
      doc.text(fmt(item.subtotal),    rEdge,   y, { align: 'right' });
      y += descLines.length * 5;
      if (item.notes) {
        const noteLines = doc.splitTextToSize(`  ${item.notes}`, colQty - m - 4) as string[];
        doc.setFontSize(7.5); doc.setTextColor(140);
        doc.text(noteLines, m, y); y += noteLines.length * 4.5;
        doc.setFontSize(9); doc.setTextColor(50);
      }
    }

    need(16);
    doc.setDrawColor(180); doc.line(m, y, rEdge, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    if (order.agreed_price != null) {
      doc.text('Total calculado', m, y);
      doc.text(fmt(order.total), rEdge, y, { align: 'right' });
      y += 6;
      need(8);
      doc.setTextColor(200, 90, 26);
      doc.text('Total acordado', m, y);
      doc.text(fmt(order.agreed_price), rEdge, y, { align: 'right' });
      doc.setTextColor(50);
    } else {
      doc.text('TOTAL', m, y);
      doc.text(fmt(order.total), rEdge, y, { align: 'right' });
    }
    y += 8;
    divider();

    // ── Payment progress ─────────────────────────────────────────────────────
    need(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('AVANCE DE PAGO', m, y); y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50);
    doc.text(`Pagado: ${fmt(order.total_paid)}`, m, y);
    doc.setTextColor(200, 90, 26);
    doc.text(`Saldo: ${fmt(balance)}`, rEdge, y, { align: 'right' });
    doc.setTextColor(50);
    y += 5;

    const barW = rEdge - m;
    const filledW = (percent / 100) * barW;
    doc.setFillColor(230, 230, 230); doc.rect(m, y, barW,     3, 'F');
    doc.setFillColor(200, 90, 26);  doc.rect(m, y, filledW, 3, 'F');
    y += 6;
    doc.setFontSize(8); doc.setTextColor(140);
    doc.text(
      `${percent}% pagado${order.agreed_price != null ? ' (sobre total acordado)' : ''}`,
      rEdge, y, { align: 'right' },
    );
    y += 7;

    // ── Payments received ────────────────────────────────────────────────────
    if (order.payments.length > 0) {
      need(12);
      divider();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('PAGOS RECIBIDOS', m, y); y += 5;

      const colMethod = m + 40;
      const colBy     = m + 80;
      doc.setTextColor(130);
      doc.text('FECHA',        m,         y);
      doc.text('MÉTODO',       colMethod, y);
      doc.text('RECIBIDO POR', colBy,     y);
      doc.text('MONTO',        rEdge,     y, { align: 'right' });
      y += 4;
      doc.setDrawColor(220); doc.line(m, y, rEdge, y); y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50);
      for (const p of order.payments) {
        need(7);
        doc.text(new Date(p.created_at).toLocaleDateString('es-GT'), m, y);
        doc.text(payLabels[p.payment_method] ?? p.payment_method,    colMethod, y);
        doc.text(p.received_by.full_name,                             colBy,     y);
        doc.text(fmt(p.amount),                                       rEdge,     y, { align: 'right' });
        y += 5;
      }
      y += 2;
    }

    // ── Client notes ─────────────────────────────────────────────────────────
    if (order.client_notes) {
      need(14);
      divider();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('NOTAS PARA EL CLIENTE', m, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50);
      const noteLines = doc.splitTextToSize(order.client_notes, rEdge - m) as string[];
      need(noteLines.length * 5 + 4);
      doc.text(noteLines, m, y); y += noteLines.length * 5 + 4;
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerY = pH - 14;
    doc.setDrawColor(220); doc.line(m, footerY - 4, rEdge, footerY - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160);
    const fmtDt = printedAt.toLocaleDateString('es-GT') + ' ' +
      printedAt.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    doc.text(`Documento generado el ${fmtDt}`, pW / 2, footerY - 1, { align: 'center' });
    doc.text(
      `${storeName} — Este comprobante es informativo y no constituye factura oficial.`,
      pW / 2, footerY + 3, { align: 'center' },
    );

    return doc.output('blob');
  }
}
