import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ShiftApiService } from '../caja/services/shift-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ShiftClose } from '../caja/models/shift.model';

@Component({
  selector: 'app-cierre-turno',
  standalone: true,
  imports: [
    NzCardModule, NzStatisticModule, NzButtonModule, NzResultModule,
    NzSpinModule, NzTagModule, NzGridModule, NzDividerModule, DatePipe,
  ],
  templateUrl: './cierre-turno.component.html',
  styleUrl: './cierre-turno.component.less',
})
export class CierreTurnoComponent implements OnInit {
  private readonly shiftApi = inject(ShiftApiService);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(NzModalService);
  private readonly msg = inject(NzMessageService);

  readonly currentUser = this.auth.currentUser;
  readonly shift = signal<ShiftClose | null>(null);
  readonly loading = signal(true);
  readonly closing = signal(false);

  ngOnInit(): void {
    this.loadShift();
  }

  private loadShift(): void {
    this.loading.set(true);
    this.shiftApi.getMyShiftToday().subscribe({
      next: (s) => {
        this.shift.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.msg.error('No se pudo cargar el estado del turno. Intenta de nuevo.');
      },
    });
  }

  confirmClose(): void {
    this.modal.confirm({
      nzTitle: '¿Cerrar turno de hoy?',
      nzContent: 'No podrás registrar más ventas hasta el día siguiente. Un gerente puede reabrir tu turno.',
      nzOkText: 'Sí, cerrar',
      nzOkDanger: true,
      nzOnOk: () => this.doClose(),
    });
  }

  private doClose(): void {
    this.closing.set(true);
    this.shiftApi.closeShift().subscribe({
      next: (s) => {
        this.shift.set(s);
        this.closing.set(false);
        this.msg.success('Turno cerrado exitosamente');
      },
      error: (err: { error?: { message?: string } }) => {
        this.closing.set(false);
        this.msg.error(err?.error?.message ?? 'Error al cerrar turno');
      },
    });
  }
}
