import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
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
    NzIconModule,
    NzModalModule,
  ],
  templateUrl: './mis-ventas.component.html',
  styleUrl: './mis-ventas.component.less',
})
export class MisVentasComponent implements OnInit {
  private readonly api = inject(CajaApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly message = inject(NzMessageService);

  readonly sales = signal<Sale[]>([]);
  readonly isLoading = signal(false);
  readonly selectedSale = signal<Sale | null>(null);
  readonly isLoadingDetail = signal(false);
  readonly drawerVisible = signal(false);
  readonly totalHoy = signal(0);

  readonly docViewerVisible = signal(false);
  readonly docViewerTitle = signal('');
  readonly docViewerLoading = signal(false);
  readonly docViewerBlobUrl = signal<string | null>(null);
  readonly docViewerIsImage = signal(false);

  readonly docViewerSafeUrl = computed((): SafeResourceUrl | null => {
    const url = this.docViewerBlobUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

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
    this.isLoadingDetail.set(true);
    this.api.getSale(sale.sale_id).subscribe({
      next: full => {
        this.selectedSale.set(full);
        this.isLoadingDetail.set(false);
      },
      error: () => this.isLoadingDetail.set(false),
    });
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedSale.set(null);
  }

  openDocViewer(url: string, title: string): void {
    this.docViewerTitle.set(title);
    this.docViewerLoading.set(true);
    this.docViewerVisible.set(true);
    this.docViewerBlobUrl.set(null);

    this.api.getDocumentBlob(url).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
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
    const url = this.docViewerBlobUrl();
    if (url) URL.revokeObjectURL(url);
    this.docViewerBlobUrl.set(null);
    this.docViewerVisible.set(false);
  }
}
