import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { QuetzalesPipe } from '../../../../shared/pipes/quetzales.pipe';
import { CartService } from '../../services/cart.service';
import { CajaApiService } from '../../services/caja-api.service';
import { VoucherService } from '../../services/voucher.service';
import { StoreSettingsService } from '../../../../shared/services/store-settings.service';
import { PaymentMethod, Sale, SalePaymentItem } from '../../../../shared/models/sale.model';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  auth_number: string;
}

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
    NzInputNumberModule,
    NzDividerModule,
    NzTagModule,
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
  readonly store_name = inject(StoreSettingsService).store_name;

  readonly step = signal<Step>('payment');
  readonly paymentSplits = signal<PaymentSplit[]>([{ method: 'CASH', amount: 0, auth_number: '' }]);
  readonly activeSlotIndex = signal<number>(0);
  readonly processing = signal(false);
  readonly receiptFile = signal<File | null>(null);
  readonly confirmedSale = signal<Sale | null>(null);

  readonly paymentLabels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    VISACUOTAS: 'Visa Cuotas',
  };

  readonly allocatedAmount = computed(() =>
    this.paymentSplits().reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  );

  readonly remainingAmount = computed(() =>
    Math.round((this.cart.total() - this.allocatedAmount()) * 100) / 100
  );

  readonly canAddSplit = computed(() => this.remainingAmount() > 0.005);

  readonly canProceedToVoucher = computed(() => {
    const balanced = Math.abs(this.remainingAmount()) < 0.01;
    const authOk = this.paymentSplits().every(
      s => s.method === 'CASH' || s.auth_number.trim().length > 0
    );
    return balanced && authOk;
  });

  readonly modalTitle = computed(() => {
    switch (this.step()) {
      case 'payment': return 'Confirmar venta';
      case 'voucher': return 'Comprobante';
      case 'success': return 'Venta registrada';
    }
  });

  readonly splitIcons: Record<PaymentMethod, string> = {
    CASH: 'dollar',
    CARD: 'credit-card',
    TRANSFER: 'swap',
    VISACUOTAS: 'percentage',
  };

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.paymentSplits.set([{ method: 'CASH', amount: this.cart.total(), auth_number: '' }]);
        this.activeSlotIndex.set(0);
        this.step.set('payment');
        this.receiptFile.set(null);
      }
    });
  }

  splitRequiresAuth(split: PaymentSplit): boolean {
    return split.method !== 'CASH';
  }

  setActiveSlot(index: number): void {
    this.activeSlotIndex.set(index);
  }

  updateSplitMethod(index: number, method: PaymentMethod): void {
    this.paymentSplits.update(splits =>
      splits.map((s, i) => i === index ? { ...s, method, auth_number: '' } : s)
    );
  }

  updateSplitAmount(index: number, amount: number): void {
    this.paymentSplits.update(splits =>
      splits.map((s, i) => i === index ? { ...s, amount: amount ?? 0 } : s)
    );
  }

  updateSplitAuth(index: number, auth: string): void {
    this.paymentSplits.update(splits =>
      splits.map((s, i) => i === index ? { ...s, auth_number: auth } : s)
    );
  }

  addSplit(): void {
    const remaining = this.remainingAmount();
    const newIndex = this.paymentSplits().length;
    this.paymentSplits.update(splits => [
      ...splits,
      { method: 'CASH', amount: remaining > 0 ? remaining : 0, auth_number: '' },
    ]);
    this.activeSlotIndex.set(newIndex);
  }

  removeSplit(index: number): void {
    const current = this.activeSlotIndex();
    this.paymentSplits.update(splits => splits.filter((_, i) => i !== index));
    this.activeSlotIndex.set(current > index ? current - 1 : Math.max(0, current));
  }

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

  private buildSalePayments(): SalePaymentItem[] {
    return this.paymentSplits().map(s => ({
      payment_method: s.method,
      amount: Number(s.amount),
      ...(s.auth_number.trim() ? { payment_reference: s.auth_number.trim() } : {}),
    }));
  }

  confirm(): void {
    if (this.processing()) return;
    const client = this.cart.client();
    if (!client) return;

    this.processing.set(true);

    const salePayments = this.buildSalePayments();

    const voucherBlob = this.voucher.generate({
      client,
      items: this.cart.items(),
      total: this.cart.total(),
      payments: salePayments,
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
        const payload = this.cart.buildPayload(salePayments, voucher_url, receipt_url);
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
    this.paymentSplits.set([{ method: 'CASH', amount: 0, auth_number: '' }]);
    this.receiptFile.set(null);
    this.step.set('payment');
    this.closed.emit();
  }

  cancel(): void {
    this.step.set('payment');
    this.paymentSplits.set([{ method: 'CASH', amount: 0, auth_number: '' }]);
    this.receiptFile.set(null);
    this.closed.emit();
  }
}
