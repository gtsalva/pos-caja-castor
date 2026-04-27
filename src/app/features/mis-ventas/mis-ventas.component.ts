import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CajaApiService } from '../caja/services/caja-api.service';
import { Sale } from '../../shared/models/sale.model';

@Component({
  selector: 'app-mis-ventas',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    NzListModule,
    NzTagModule,
    NzEmptyModule,
    NzSpinModule,
    NzStatisticModule,
    NzDrawerModule,
    NzDescriptionsModule,
    NzDividerModule,
  ],
  templateUrl: './mis-ventas.component.html',
  styleUrl: './mis-ventas.component.less',
})
export class MisVentasComponent implements OnInit {
  private readonly api = inject(CajaApiService);

  readonly sales = signal<Sale[]>([]);
  readonly isLoading = signal(false);
  readonly selectedSale = signal<Sale | null>(null);
  readonly drawerVisible = signal(false);
  readonly totalHoy = signal(0);

  readonly paymentLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.isLoading.set(true);
    this.api.getMySales(today).subscribe({
      next: res => {
        this.sales.set(res.data);
        this.totalHoy.set(
          res.data
            .filter(s => s.status === 'COMPLETED')
            .reduce((sum, s) => sum + Number(s.total), 0)
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openDetail(sale: Sale): void {
    this.selectedSale.set(sale);
    this.drawerVisible.set(true);
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedSale.set(null);
  }
}
