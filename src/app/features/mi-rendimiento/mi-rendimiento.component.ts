import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DatePipe } from '@angular/common';
import { QuetzalesPipe } from '../../shared/pipes/quetzales.pipe';
import { MiRendimientoApiService } from './services/mi-rendimiento-api.service';
import { MyPerformance } from './models/incentive.model';

@Component({
  selector: 'app-mi-rendimiento',
  standalone: true,
  imports: [NzProgressModule, NzSpinModule, NzTagModule, QuetzalesPipe, DatePipe],
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
              nzTrailColor="#E8D5C0"
              [nzFormat]="ringFormat"
              [nzStrokeWidth]="10"
            />
            <div class="ring-caption">
              <span class="ring-label">de {{ d.period.goal_amount | quetzales }} meta</span>
            </div>
          </div>

          <div class="commission-card">
            <div class="commission-label">Comisión proyectada</div>
            <div class="commission-amount">
              {{ d.commission_earned | quetzales }}
            </div>
            @if (d.is_liquidated) {
              <nz-tag nzColor="#52c41a" style="margin-top:8px">Liquidado</nz-tag>
            }
          </div>

          <div class="stats-row">
            <div class="stat-chip">
              <div class="stat-value">{{ d.amount_sold | quetzales }}</div>
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
      background: #FAF5EE;
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
      color: rgba(61, 52, 50, 0.45);
      font-weight: 600;
    }

    .rend-period-label {
      font-size: 22px;
      font-weight: 700;
      color: #3D3432;
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
      color: rgba(61, 52, 50, 0.55);
      font-size: 13px;
    }

    .commission-card {
      margin-top: 36px;
      text-align: center;
      padding: 24px 32px;
      background: #FFFFFF;
      border: 1px solid rgba(200, 90, 26, 0.18);
      border-radius: 16px;
      width: calc(100% - 40px);
      box-shadow: 0 2px 12px rgba(200, 90, 26, 0.07);
    }

    .commission-label {
      font-size: 12px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(61, 52, 50, 0.45);
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
      opacity: 0.7;
    }

    .stats-row {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      width: calc(100% - 40px);
      margin-top: 16px;
      background: #FFFFFF;
      border: 1px solid rgba(61, 52, 50, 0.08);
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
      color: #3D3432;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 11px;
      color: rgba(61, 52, 50, 0.5);
      margin-top: 2px;
    }

    .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(61, 52, 50, 0.12);
    }

    .period-dates {
      margin-top: 20px;
      font-size: 12px;
      color: rgba(61, 52, 50, 0.38);
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
      color: rgba(61, 52, 50, 0.5);
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
    if (pct >= 100) return '#5D9C59';
    if (pct >= 60) return '#C85A1A';
    return '#E8943A';
  });

  readonly ringFormat = (pct: number): string => `${pct}%`;

  ngOnInit(): void {
    this.api.getMyPerformance().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
