import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DecimalPipe, DatePipe, NgIf } from '@angular/common';
import { MiRendimientoApiService } from './services/mi-rendimiento-api.service';
import { MyPerformance } from './models/incentive.model';

@Component({
  selector: 'app-mi-rendimiento',
  standalone: true,
  imports: [NzProgressModule, NzSpinModule, NzTagModule, DecimalPipe, DatePipe, NgIf],
  template: `
    <div class="rendimiento-shell">
      @if (loading()) {
        <div class="loading-center">
          <nz-spin [nzSize]="'large'" />
        </div>
      }

      @if (!loading() && data(); as d) {
        <div class="rend-header">
          <span class="rend-title">Mi rendimiento</span>
          @if (d.period) {
            <span class="rend-period-label">{{ d.period.name }}</span>
          }
        </div>

        @if (!d.period) {
          <div class="no-period">
            <span class="no-period-icon">🏆</span>
            <p>No hay período de incentivos activo</p>
          </div>
        } @else {
          <div class="ring-section">
            <nz-progress
              nzType="circle"
              [nzPercent]="ringPct()"
              [nzWidth]="200"
              [nzStrokeColor]="ringColor()"
              nzTrailColor="rgba(255,255,255,0.08)"
              [nzFormat]="ringFormat"
              [nzStrokeWidth]="10"
            />
            <div class="ring-caption">
              <span class="ring-label">de Q {{ d.period.goal_amount | number:'1.0-0' }} meta</span>
            </div>
          </div>

          <div class="commission-card">
            <div class="commission-label">Comisión proyectada</div>
            <div class="commission-amount">
              <span class="commission-currency">Q</span>
              {{ d.commission_earned | number:'1.2-2' }}
            </div>
            @if (d.is_liquidated) {
              <nz-tag nzColor="#52c41a" style="margin-top:8px">Liquidado</nz-tag>
            }
          </div>

          <div class="stats-row">
            <div class="stat-chip">
              <div class="stat-value">Q {{ d.amount_sold | number:'1.0-0' }}</div>
              <div class="stat-label">Vendido en período</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-chip">
              <div class="stat-value">{{ d.transaction_count }}</div>
              <div class="stat-label">Transacciones</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-chip">
              <div class="stat-value">{{ d.period.commission_rate }}%</div>
              <div class="stat-label">Tasa</div>
            </div>
          </div>

          <div class="period-dates">
            {{ d.period.start_date | date:'dd MMM' }} — {{ d.period.end_date | date:'dd MMM yyyy' }}
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .rendimiento-shell {
      min-height: calc(100vh - 112px);
      background: #3D3432;
      padding: 0 0 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .loading-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
    }

    .rend-header {
      width: 100%;
      padding: 20px 20px 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .rend-title {
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(245, 230, 211, 0.5);
      font-weight: 600;
    }

    .rend-period-label {
      font-size: 22px;
      font-weight: 700;
      color: #F5E6D3;
      line-height: 1.2;
    }

    .ring-section {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .ring-caption {
      text-align: center;
    }

    .ring-label {
      color: rgba(245, 230, 211, 0.6);
      font-size: 13px;
    }

    .commission-card {
      margin-top: 36px;
      text-align: center;
      padding: 24px 32px;
      background: rgba(245, 230, 211, 0.06);
      border: 1px solid rgba(200, 90, 26, 0.3);
      border-radius: 16px;
      width: calc(100% - 40px);
    }

    .commission-label {
      font-size: 12px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(245, 230, 211, 0.5);
      margin-bottom: 6px;
    }

    .commission-amount {
      font-size: 42px;
      font-weight: 800;
      color: #C85A1A;
      line-height: 1;
    }

    .commission-currency {
      font-size: 24px;
      font-weight: 400;
      margin-right: 4px;
      opacity: 0.8;
    }

    .stats-row {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      width: calc(100% - 40px);
      margin-top: 24px;
      background: rgba(245, 230, 211, 0.04);
      border-radius: 12px;
      padding: 16px 8px;
    }

    .stat-chip {
      text-align: center;
      flex: 1;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #F5E6D3;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 11px;
      color: rgba(245, 230, 211, 0.45);
      margin-top: 2px;
    }

    .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(245, 230, 211, 0.1);
    }

    .period-dates {
      margin-top: 20px;
      font-size: 12px;
      color: rgba(245, 230, 211, 0.35);
      letter-spacing: 0.5px;
    }

    .no-period {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 12px;
    }

    .no-period-icon {
      font-size: 48px;
    }

    .no-period p {
      color: rgba(245, 230, 211, 0.5);
      font-size: 16px;
      margin: 0;
      text-align: center;
    }
  `],
})
export class MiRendimientoComponent implements OnInit {
  private readonly api = inject(MiRendimientoApiService);

  readonly loading = signal(true);
  readonly data = signal<MyPerformance | null>(null);

  readonly ringPct = computed(() => {
    const d = this.data();
    if (!d) return 0;
    return Math.min(Math.round(d.goal_pct), 100);
  });

  readonly ringColor = computed(() => {
    const pct = this.ringPct();
    if (pct >= 100) return '#52c41a';
    if (pct >= 60) return '#C85A1A';
    return '#faad14';
  });

  readonly ringFormat = (pct: number): string => `${pct}%`;

  ngOnInit(): void {
    this.api.getMyPerformance().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
