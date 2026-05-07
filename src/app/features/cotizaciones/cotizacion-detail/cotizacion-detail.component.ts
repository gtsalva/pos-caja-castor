import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
export class CotizacionDetailComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly api     = inject(CotizacionesApiService);
  private readonly message = inject(NzMessageService);
  private readonly fb      = inject(FormBuilder);

  readonly order   = signal<CustomOrder | null>(null);
  readonly loading = signal(false);
  readonly acting  = signal(false);
  readonly paymentModalVisible = signal(false);
  readonly cancelModalVisible  = signal(false);

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
    if (!o || o.total === 0) return 0;
    return Math.min(100, Math.round((o.total_paid / o.total) * 100));
  });

  readonly balance = computed(() => {
    const o = this.order();
    return o ? Math.max(0, o.total - o.total_paid) : 0;
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

  loadOrder(id: string): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/cotizaciones']); },
    });
  }

  back(): void { this.router.navigate(['/cotizaciones']); }

  clientLabel(): string {
    const o = this.order();
    return o?.client?.full_name ?? o?.client_name ?? 'Sin cliente';
  }

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
