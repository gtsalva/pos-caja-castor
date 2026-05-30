import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NzListModule }        from 'ng-zorro-antd/list';
import { NzTagModule }         from 'ng-zorro-antd/tag';
import { NzButtonModule }      from 'ng-zorro-antd/button';
import { NzModalModule }       from 'ng-zorro-antd/modal';
import { NzInputModule }       from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule }        from 'ng-zorro-antd/form';
import { NzSelectModule }      from 'ng-zorro-antd/select';
import { NzSpinModule }        from 'ng-zorro-antd/spin';
import { NzIconModule }        from 'ng-zorro-antd/icon';
import { NzProgressModule }    from 'ng-zorro-antd/progress';
import { NzMessageService }    from 'ng-zorro-antd/message';
import { NzDividerModule }     from 'ng-zorro-antd/divider';
import { QuetzalesPipe }       from '../../../shared/pipes/quetzales.pipe';
import { CotizacionesApiService } from '../services/cotizaciones-api.service';
import { CotizacionPrintService } from '../services/cotizacion-print.service';
import { CustomOrder, CustomOrderStatus, RegisterPaymentPayload } from '../models/custom-order.model';
import { PaymentMethod } from '../../../shared/models/sale.model';

@Component({
  selector: 'app-cotizacion-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe, QuetzalesPipe,
    NzListModule, NzTagModule, NzButtonModule, NzModalModule,
    NzInputModule, NzInputNumberModule, NzFormModule, NzSelectModule,
    NzSpinModule, NzIconModule, NzProgressModule, NzDividerModule,
  ],
  templateUrl: './cotizacion-detail.component.html',
  styleUrl: './cotizacion-detail.component.less',
})
export class CotizacionDetailComponent implements OnInit, OnDestroy {
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);
  private readonly api       = inject(CotizacionesApiService);
  private readonly printer   = inject(CotizacionPrintService);
  private readonly message   = inject(NzMessageService);
  private readonly fb        = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly blobUrls: string[] = [];

  readonly order    = signal<CustomOrder | null>(null);
  readonly loading  = signal(false);
  readonly acting   = signal(false);
  readonly printing = signal(false);

  readonly paymentModalVisible = signal(false);
  readonly cancelModalVisible  = signal(false);

  // ── Doc viewer (mismo patrón que mis-ventas) ────────────────────────────
  readonly docViewerVisible = signal(false);
  readonly docViewerTitle   = signal('');
  readonly docViewerLoading = signal(false);
  readonly docViewerBlobUrl = signal<string | null>(null);
  readonly docViewerIsImage = signal(false);

  readonly docViewerSafeUrl = computed((): SafeResourceUrl | null => {
    const url = this.docViewerBlobUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  readonly paymentForm = this.fb.group({
    payment_method:    ['CASH' as PaymentMethod, Validators.required],
    amount:            [0, [Validators.required, Validators.min(0.01)]],
    payment_reference: [''],
    notes:             [''],
  });

  readonly statusColors: Record<CustomOrderStatus, string> = {
    DRAFT: 'default', SENT: 'blue', APPROVED: 'cyan',
    IN_PRODUCTION: 'orange', DELIVERED: 'purple', COMPLETED: 'success', CANCELLED: 'error',
  };
  readonly statusLabels: Record<CustomOrderStatus, string> = {
    DRAFT: 'Borrador', SENT: 'Enviada', APPROVED: 'Aprobada',
    IN_PRODUCTION: 'En producción', DELIVERED: 'Entregada', COMPLETED: 'Completada', CANCELLED: 'Cancelada',
  };
  readonly paymentLabels: Record<string, string> = {
    CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', VISACUOTAS: 'Visa Cuotas',
  };
  readonly paymentMethods = [
    { label: 'Efectivo',      value: 'CASH'      },
    { label: 'Tarjeta',       value: 'CARD'       },
    { label: 'Transferencia', value: 'TRANSFER'   },
    { label: 'Visa Cuotas',   value: 'VISACUOTAS' },
  ];

  readonly paidPercent = computed(() => {
    const o = this.order();
    if (!o) return 0;
    const base = o.agreed_price ?? o.total;
    if (base === 0) return 0;
    return Math.min(100, Math.round((o.total_paid / base) * 100));
  });

  readonly balance = computed(() => {
    const o = this.order();
    if (!o) return 0;
    return Math.max(0, (o.agreed_price ?? o.total) - o.total_paid);
  });

  readonly canCancel = computed(() => {
    const o = this.order();
    return o?.status === 'DRAFT' || o?.status === 'SENT';
  });

  readonly canPay = computed(() => {
    const o = this.order();
    return o?.status !== 'CANCELLED' && o?.status !== 'COMPLETED';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/cotizaciones']); return; }
    this.loadOrder(id);
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach(u => URL.revokeObjectURL(u));
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/cotizaciones']); },
    });
  }

  back(): void { this.router.navigate(['/cotizaciones']); }

  readonly clientInfo = computed(() => {
    const o = this.order();
    const c = o?.client ?? null;
    const addressParts = [c?.billing_address, c?.billing_city, c?.billing_department]
      .filter((p): p is string => !!p);
    return {
      name:          c?.full_name ?? o?.client_name ?? 'Sin cliente',
      business_name: c?.business_name ?? null,
      nit:           c?.nit ?? null,
      phone:         c?.phone ?? o?.client_phone ?? null,
      email:         c?.email ?? o?.client_email ?? null,
      address:       addressParts.length > 0 ? addressParts.join(', ') : null,
    };
  });

  // ── Doc viewer ────────────────────────────────────────────────────────────

  openDocViewer(url: string, title: string): void {
    this.docViewerTitle.set(title);
    this.docViewerLoading.set(true);
    this.docViewerVisible.set(true);
    this.docViewerBlobUrl.set(null);
    this.api.getDocumentBlob(url).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.blobUrls.push(objectUrl);
        this.docViewerBlobUrl.set(objectUrl);
        this.docViewerIsImage.set(blob.type.startsWith('image/'));
        this.docViewerLoading.set(false);
      },
      error: () => {
        this.docViewerLoading.set(false);
        this.docViewerVisible.set(false);
        this.message.error('No se pudo cargar el documento');
      },
    });
  }

  closeDocViewer(): void {
    this.docViewerVisible.set(false);
    this.docViewerBlobUrl.set(null);
  }

  // ── Print ─────────────────────────────────────────────────────────────────

  printReceipt(): void {
    const o = this.order();
    if (!o) return;
    this.printing.set(true);

    let blob: Blob;
    try {
      blob = this.printer.generate(o, new Date());
    } catch {
      this.printing.set(false);
      this.message.error('Error al generar el comprobante');
      return;
    }

    // Mostrar inmediatamente desde el blob local
    const blobUrl = URL.createObjectURL(blob);
    this.blobUrls.push(blobUrl);
    this.docViewerTitle.set('Comprobante de cotización');
    this.docViewerBlobUrl.set(blobUrl);
    this.docViewerIsImage.set(false);
    this.docViewerLoading.set(false);
    this.docViewerVisible.set(true);

    // Subir al storage en segundo plano
    const file = new File([blob], `comprobante-${o.order_number}.pdf`, { type: 'application/pdf' });
    this.api.savePrintReceipt(o.custom_order_id, file).subscribe({
      next: (updated) => { this.order.set(updated); this.printing.set(false); },
      error: () => {
        this.printing.set(false);
        this.message.warning('PDF generado pero no se pudo guardar en el historial');
      },
    });
  }

  // ── Payment ───────────────────────────────────────────────────────────────

  openPaymentModal(): void {
    const remaining = this.balance();
    this.paymentForm.reset({ payment_method: 'CASH', amount: remaining });
    this.paymentModalVisible.set(true);
  }

  confirmPayment(): void {
    if (this.paymentForm.invalid) return;
    const v = this.paymentForm.value;
    const payload: RegisterPaymentPayload = {
      payment_method:    v.payment_method as PaymentMethod,
      amount:            Number(v.amount),
      payment_reference: v.payment_reference || undefined,
      notes:             v.notes || undefined,
    };
    this.paymentModalVisible.set(false);
    this.acting.set(true);
    this.api.registerPayment(this.order()!.custom_order_id, payload).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.acting.set(false);
        this.message.success(`Pago de Q ${payload.amount.toFixed(2)} registrado`);
      },
      error: (err: { error?: { message?: string } }) => {
        this.acting.set(false);
        this.message.error(err?.error?.message ?? 'Error al registrar pago');
      },
    });
  }

  confirmCancel(): void {
    this.cancelModalVisible.set(false);
    this.acting.set(true);
    this.api.cancel(this.order()!.custom_order_id).subscribe({
      next: () => {
        this.acting.set(false);
        this.message.success('Cotización cancelada');
        this.router.navigate(['/cotizaciones']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.acting.set(false);
        this.message.error(err?.error?.message ?? 'Error al cancelar');
      },
    });
  }
}
