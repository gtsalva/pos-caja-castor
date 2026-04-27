import { Component, OnInit, inject, signal } from '@angular/core';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CajaApiService } from '../caja/services/caja-api.service';

@Component({
  selector: 'app-mi-rendimiento',
  standalone: true,
  imports: [NzStatisticModule, NzCardModule, NzGridModule, NzSpinModule],
  template: `
    <div style="padding: 16px;">
      <h3 style="color: #3d3432; margin-bottom: 16px;">Mi rendimiento</h3>
      @if (loading()) {
        <nz-spin nzTip="Cargando..." />
      } @else {
        <nz-row [nzGutter]="12">
          <nz-col [nzSpan]="12">
            <nz-card>
              <nz-statistic
                nzTitle="Ventas del día"
                [nzValue]="totalHoy()"
                nzPrefix="Q"
                [nzValueStyle]="{ color: '#C85A1A', fontSize: '22px' }"
              />
            </nz-card>
          </nz-col>
          <nz-col [nzSpan]="12">
            <nz-card>
              <nz-statistic
                nzTitle="Transacciones"
                [nzValue]="countHoy()"
                [nzValueStyle]="{ color: '#3D3432', fontSize: '22px' }"
              />
            </nz-card>
          </nz-col>
        </nz-row>
      }
    </div>
  `,
})
export class MiRendimientoComponent implements OnInit {
  private readonly api = inject(CajaApiService);

  readonly loading = signal(true);
  readonly totalHoy = signal(0);
  readonly countHoy = signal(0);

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.api.getMySales(today, 1, 200).subscribe({
      next: result => {
        const completed = result.data.filter(s => s.status === 'COMPLETED');
        this.totalHoy.set(completed.reduce((sum, s) => sum + Number(s.total), 0));
        this.countHoy.set(completed.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
