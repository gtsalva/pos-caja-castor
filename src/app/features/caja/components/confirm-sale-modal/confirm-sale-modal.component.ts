import { Component, inject, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { QuetzalesPipe } from '../../../../shared/pipes/quetzales.pipe';
import { CartService } from '../../services/cart.service';
import { CajaApiService } from '../../services/caja-api.service';
import { VoucherService } from '../../services/voucher.service';
import { PaymentMethod, Sale } from '../../../../shared/models/sale.model';

type Step = 'payment' | 'voucher' | 'success';

@Component({
  selector: 'app-confirm-sale-modal',
  standalone: true,
  imports: [
    FormsModule,
    QuetzalesPipe,
    NzModalModule,
    NzRadioModule,
    NzDescriptionsModule,
    NzIconModule,
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
  private readonly destroyRef = inject(DestroyRef);

  readonly step = signal<Step>('payment');
  readonly paymentMethod = signal<PaymentMethod>('CASH');
  readonly authNumber = signal('');
  readonly processing = signal(false);
  readonly receiptFile = signal<File | null>(null);
  readonly confirmedSale = signal<Sale | null>(null);

  readonly paymentLabels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };

  readonly requiresAuth = computed(() => this.paymentMethod() !== 'CASH');

  readonly canProceedToVoucher = computed(() =>
    !this.requiresAuth() || this.authNumber().trim().length > 0
  );

  readonly modalTitle = computed(() => {
    switch (this.step()) {
      case 'payment': return 'Confirmar venta';
      case 'voucher': return 'Comprobante';
      case 'success': return 'Venta registrada';
    }
  });

  goToVoucher(): void {
    this.step.set('voucher');
  }

  goBack(): void {
    this.step.set('payment');
  }

  handleReceiptFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.receiptFile.set(input.files?.[0] ?? null);
  }

  clearReceiptFile(): void {
    this.receiptFile.set(null);
  }

  confirm(): void {
    if (this.processing()) return;
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

    const receipt = this.receiptFile();

    type Uploads = { voucher_url: string; receipt_url: string | undefined };

    const uploads$: Observable<Uploads> = receipt
      ? forkJoin({
          voucher: this.api.uploadVoucher(voucherBlob),
          receipt: this.api.uploadReceipt(receipt),
        }).pipe(map(r => ({ voucher_url: r.voucher.url, receipt_url: r.receipt.url })))
      : this.api.uploadVoucher(voucherBlob).pipe(
          map(r => ({ voucher_url: r.url, receipt_url: undefined as string | undefined })),
        );

    uploads$.pipe(
      switchMap(({ voucher_url, receipt_url }: Uploads) => {
        const payload = this.cart.buildPayload(
          this.paymentMethod(),
          this.requiresAuth() ? this.authNumber().trim() : undefined,
          voucher_url,
          receipt_url,
        );
        return this.api.createSale(payload);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (sale: Sale) => {
        this.processing.set(false);
        this.confirmedSale.set(sale);
        this.cart.clear();
        this.saleCompleted.emit(sale);
        this.step.set('success');
      },
      error: (err: { error?: { message?: string } }) => {
        this.processing.set(false);
        const msg = err?.error?.message ?? 'Error al registrar la venta';
        this.message.error(msg);
      },
    });
  }

  closeSuccess(): void {
    this.confirmedSale.set(null);
    this.paymentMethod.set('CASH');
    this.authNumber.set('');
    this.receiptFile.set(null);
    this.step.set('payment');
    this.closed.emit();
  }

  cancel(): void {
    this.step.set('payment');
    this.authNumber.set('');
    this.receiptFile.set(null);
    this.closed.emit();
  }
}
