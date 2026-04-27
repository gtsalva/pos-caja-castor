import { Component, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CartService } from '../../services/cart.service';
import { CajaApiService } from '../../services/caja-api.service';
import { PaymentMethod, Sale } from '../../../../shared/models/sale.model';

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
  ],
  templateUrl: './confirm-sale-modal.component.html',
})
export class ConfirmSaleModalComponent {
  readonly visible = input.required<boolean>();
  readonly closed = output<void>();
  readonly saleCompleted = output<Sale>();

  readonly cart = inject(CartService);
  private readonly api = inject(CajaApiService);
  private readonly message = inject(NzMessageService);

  readonly paymentMethod = signal<PaymentMethod>('CASH');
  readonly processing = signal(false);

  readonly paymentLabels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };

  confirm(): void {
    this.processing.set(true);
    const payload = this.cart.buildPayload(this.paymentMethod());
    this.api.createSale(payload).subscribe({
      next: sale => {
        this.processing.set(false);
        this.cart.clear();
        this.paymentMethod.set('CASH');
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
    this.closed.emit();
  }
}
