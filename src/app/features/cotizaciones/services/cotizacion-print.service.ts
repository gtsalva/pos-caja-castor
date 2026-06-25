import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import { CustomOrder } from '../models/custom-order.model';
import { StoreSettingsService } from '../../../shared/services/store-settings.service';
import { PDF_COLOR, TYPO, drawContinuationMark, drawLetterhead, drawSignatures, setType } from '../../../shared/print/print-branding';

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

    const page = (): void => { doc.addPage(); y = drawContinuationMark(doc); };
    const need = (h: number): void => { if (y + h > pH - m) page(); };
    const divider = (): void => {
      doc.setDrawColor(200); doc.line(m, y, rEdge, y); y += 5;
    };
    const labelVal = (label: string, val: string): void => {
      setType(doc, TYPO.body);
      doc.setFont('helvetica', 'bold');   doc.text(label, m, y);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(val, rEdge - (m + 34)) as string[];
      doc.text(lines, m + 34, y);
      y += Math.max(1, lines.length) * 6;
    };

    const statusLabels: Record<string, string> = {
      DRAFT: 'Borrador', SENT: 'Enviada', APPROVED: 'Aprobada',
      IN_PRODUCTION: 'En producción', DELIVERED: 'Entregada',
      COMPLETED: 'Completada', CANCELLED: 'Cancelada',
    };
    const payLabels: Record<string, string> = {
      CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', VISACUOTAS: 'Visa Cuotas',
    };

    // ── Membrete ──────────────────────────────────────────────────────────────
    y = drawLetterhead(doc, {
      storeName,
      docTitle: 'Comprobante de Cotización',
      metaLines: [`${order.order_number} · ${statusLabels[order.status] ?? order.status}`],
    });

    // ── Client info ─────────────────────────────────────────────────────────
    doc.setTextColor(PDF_COLOR.ink);
    setType(doc, TYPO.section);
    doc.text('INFORMACIÓN DEL CLIENTE', m, y);
    y += 6;
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
    setType(doc, TYPO.tableHead);
    doc.setTextColor(PDF_COLOR.gray);
    doc.text('DESCRIPCIÓN', m, y);
    doc.text('CANT.',    colQty,  y, { align: 'right' });
    doc.text('P.UNIT.',  colUnit, y, { align: 'right' });
    doc.text('SUBTOTAL', rEdge,   y, { align: 'right' });
    y += 5;
    doc.setDrawColor(200); doc.line(m, y, rEdge, y); y += 5;

    setType(doc, TYPO.body);
    doc.setTextColor(PDF_COLOR.ink);
    for (const item of order.items) {
      const descLines = doc.splitTextToSize(item.description, colQty - m - 4) as string[];
      need(descLines.length * 6 + 2);
      doc.text(descLines, m, y);
      doc.text(String(item.quantity), colQty,  y, { align: 'right' });
      doc.text(fmt(item.unit_price),  colUnit, y, { align: 'right' });
      doc.text(fmt(item.subtotal),    rEdge,   y, { align: 'right' });
      y += descLines.length * 6;
      if (item.notes) {
        const noteLines = doc.splitTextToSize(`  ${item.notes}`, colQty - m - 4) as string[];
        setType(doc, TYPO.note); doc.setTextColor(PDF_COLOR.muted);
        doc.text(noteLines, m, y); y += noteLines.length * 5;
        setType(doc, TYPO.body); doc.setTextColor(PDF_COLOR.ink);
      }
    }

    need(18);
    doc.setDrawColor(180); doc.line(m, y, rEdge, y); y += 6;
    setType(doc, TYPO.total);
    if (order.agreed_price != null) {
      doc.text('Total calculado', m, y);
      doc.text(fmt(order.total), rEdge, y, { align: 'right' });
      y += 7;
      need(9);
      doc.setTextColor(...PDF_COLOR.terracotta);
      doc.text('Total acordado', m, y);
      doc.text(fmt(order.agreed_price), rEdge, y, { align: 'right' });
      doc.setTextColor(PDF_COLOR.ink);
    } else {
      doc.text('TOTAL', m, y);
      doc.text(fmt(order.total), rEdge, y, { align: 'right' });
    }
    y += 9;
    divider();

    // ── Payment progress ─────────────────────────────────────────────────────
    need(22);
    setType(doc, TYPO.section);
    doc.setTextColor(PDF_COLOR.gray);
    doc.text('AVANCE DE PAGO', m, y); y += 6;

    setType(doc, TYPO.body);
    doc.setTextColor(PDF_COLOR.ink);
    doc.text(`Pagado: ${fmt(order.total_paid)}`, m, y);
    doc.setTextColor(...PDF_COLOR.terracotta);
    doc.text(`Saldo: ${fmt(balance)}`, rEdge, y, { align: 'right' });
    doc.setTextColor(PDF_COLOR.ink);
    y += 6;

    const barW = rEdge - m;
    const filledW = (percent / 100) * barW;
    doc.setFillColor(230, 230, 230); doc.rect(m, y, barW,     3, 'F');
    doc.setFillColor(...PDF_COLOR.terracotta);  doc.rect(m, y, filledW, 3, 'F');
    y += 7;
    setType(doc, TYPO.note); doc.setTextColor(PDF_COLOR.muted);
    doc.text(
      `${percent}% pagado${order.agreed_price != null ? ' (sobre total acordado)' : ''}`,
      rEdge, y, { align: 'right' },
    );
    y += 8;

    // ── Payments received ────────────────────────────────────────────────────
    if (order.payments.length > 0) {
      need(14);
      divider();
      setType(doc, TYPO.section);
      doc.setTextColor(PDF_COLOR.gray);
      doc.text('PAGOS RECIBIDOS', m, y); y += 6;

      const colMethod = m + 40;
      const colBy     = m + 80;
      setType(doc, TYPO.tableHead);
      doc.setTextColor(130);
      doc.text('FECHA',        m,         y);
      doc.text('MÉTODO',       colMethod, y);
      doc.text('RECIBIDO POR', colBy,     y);
      doc.text('MONTO',        rEdge,     y, { align: 'right' });
      y += 5;
      doc.setDrawColor(220); doc.line(m, y, rEdge, y); y += 5;

      setType(doc, TYPO.body);
      doc.setTextColor(PDF_COLOR.ink);
      for (const p of order.payments) {
        need(8);
        doc.text(new Date(p.created_at).toLocaleDateString('es-GT'), m, y);
        doc.text(payLabels[p.payment_method] ?? p.payment_method,    colMethod, y);
        doc.text(p.received_by.full_name,                             colBy,     y);
        doc.text(fmt(p.amount),                                       rEdge,     y, { align: 'right' });
        y += 6;
      }
      y += 2;
    }

    // ── Client notes ─────────────────────────────────────────────────────────
    if (order.client_notes) {
      need(16);
      divider();
      setType(doc, TYPO.section);
      doc.setTextColor(PDF_COLOR.gray);
      doc.text('NOTAS PARA EL CLIENTE', m, y); y += 6;
      setType(doc, TYPO.body);
      doc.setTextColor(PDF_COLOR.ink);
      const noteLines = doc.splitTextToSize(order.client_notes, rEdge - m) as string[];
      need(noteLines.length * 6 + 4);
      doc.text(noteLines, m, y); y += noteLines.length * 6 + 4;
    }

    // ── Firmas ────────────────────────────────────────────────────────────────
    drawSignatures(doc, y);

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerY = pH - 14;
    doc.setDrawColor(220); doc.line(m, footerY - 4, rEdge, footerY - 4);
    setType(doc, TYPO.note);
    doc.setTextColor(PDF_COLOR.faint);
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
