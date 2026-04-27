import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { switchMap } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { CajaApiService } from '../../services/caja-api.service';
import { VoucherService } from '../../services/voucher.service';
import { PaymentMethod, Sale } from '../../../../shared/models/sale.model';

type Step = 'payment' | 'voucher';

@Component({
  selector: 'app-confirm-sale-modal',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    NzModalModule,
    NzRadioModule,
    NzDescriptionsModule,
    NzIconModule,
    NzTagModule,
    NzButtonModule,
    NzInputModule,
    NzDividerModule,
  ],
  templateUrl: './confirm-sale-modal.component.html',
  styleUrl: './confirm-sale-modal.component.less',
})
export class ConfirmSaleModalComponent {
  readonly visible = input.required<boolean>();
  readonly closed = output<void>();
  readonly saleCompleted = output<Sale>();

  readonly cart = inject(CartService);
  private readonly api = inject(CajaApiService);
  private readonly voucher = inject(VoucherService);
  private readonly message = inject(NzMessageService);

  readonly step = signal<Step>('payment');
  readonly paymentMethod = signal<PaymentMethod>('CASH');
  readonly authNumber = signal('');
  readonly processing = signal(false);

  readonly paymentLabels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };

  readonly requiresAuth = computed(() => this.paymentMethod() !== 'CASH');

  readonly canProceedToVoucher = computed(() =>
    !this.requiresAuth() || this.authNumber().trim().length > 0
  );

  readonly modalTitle = computed(() =>
    this.step() === 'payment' ? 'Confirmar venta' : 'Comprobante'
  );

  goToVoucher(): void {
    this.step.set('voucher');
  }

  goBack(): void {
    this.step.set('payment');
  }

  confirm(): void {
    const client = this.cart.client();
    if (!client) return;

    this.processing.set(true);

    const voucherBlob = this.voucher.generate({
      client,
      items: this.cart.items(),
      total: this.cart.total(),
      payment_method: this.paymentMethod(),
      payment_reference: this.requiresAuth() ? this.authNumber().trim() : undefined,
    });

    this.api.uploadVoucher(voucherBlob).pipe(
      switchMap(({ url }) => {
        const payload = this.cart.buildPayload(
          this.paymentMethod(),
          this.requiresAuth() ? this.authNumber().trim() : undefined,
          url,
        );
        return this.api.createSale(payload);
      }),
    ).subscribe({
      next: sale => {
        this.processing.set(false);
        this.cart.clear();
        this.paymentMethod.set('CASH');
        this.authNumber.set('');
        this.step.set('payment');
        this.saleCompleted.emit(sale);
        this.message.success(`Venta ${sale.sale_number} registrada`);
        this.closed.emit();
      },
      error: err => {
        this.processing.set(false);
        const msg = err?.error?.message ?? 'Error al registrar la venta';
        this.message.error(msg);
      },
    });
  }

  cancel(): void {
    this.step.set('payment');
    this.authNumber.set('');
    this.closed.emit();
  }
}
