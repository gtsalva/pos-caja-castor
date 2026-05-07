import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NzListModule }   from 'ng-zorro-antd/list';
import { NzTagModule }    from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule }   from 'ng-zorro-antd/icon';
import { NzSpinModule }   from 'ng-zorro-antd/spin';
import { NzEmptyModule }  from 'ng-zorro-antd/empty';
import { QuetzalesPipe }  from '../../../shared/pipes/quetzales.pipe';
import { AuthService }    from '../../../core/services/auth.service';
import { CotizacionesApiService } from '../services/cotizaciones-api.service';
import { CustomOrder, CustomOrderStatus } from '../models/custom-order.model';

@Component({
  selector: 'app-cotizaciones-list',
  standalone: true,
  imports: [DatePipe, NzListModule, NzTagModule, NzButtonModule, NzIconModule, NzSpinModule, NzEmptyModule, QuetzalesPipe],
  templateUrl: './cotizaciones-list.component.html',
  styleUrl: './cotizaciones-list.component.less',
})
export class CotizacionesListComponent implements OnInit {
  private readonly api    = inject(CotizacionesApiService);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly orders  = signal<CustomOrder[]>([]);
  readonly loading = signal(false);

  readonly statusColors: Record<CustomOrderStatus, string> = {
    DRAFT: 'default', SENT: 'blue', APPROVED: 'cyan',
    IN_PRODUCTION: 'orange', DELIVERED: 'purple', COMPLETED: 'success', CANCELLED: 'error',
  };
  readonly statusLabels: Record<CustomOrderStatus, string> = {
    DRAFT: 'Borrador', SENT: 'Enviada', APPROVED: 'Aprobada',
    IN_PRODUCTION: 'En producción', DELIVERED: 'Entregada', COMPLETED: 'Completada', CANCELLED: 'Cancelada',
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.loading.set(true);
    this.api.getMias(user.user_id).subscribe({
      next: (result) => { this.orders.set(result.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  open(order: CustomOrder): void {
    this.router.navigate(['/cotizaciones', order.custom_order_id]);
  }

  goToNew(): void { this.router.navigate(['/cotizaciones/nueva']); }

  balance(o: CustomOrder): number { return Math.max(0, o.total - o.total_paid); }

  clientLabel(o: CustomOrder): string {
    return o.client?.full_name ?? o.client_name ?? 'Sin cliente';
  }
}
