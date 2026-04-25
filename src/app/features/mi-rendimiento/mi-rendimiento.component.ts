import { Component } from '@angular/core';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-mi-rendimiento',
  standalone: true,
  imports: [NzStatisticModule, NzCardModule],
  template: `
    <div style="padding: 16px;">
      <h3 style="color: #3d3432; margin-bottom: 16px;">Mi rendimiento</h3>
      <nz-card>
        <nz-statistic nzTitle="Ventas del período" [nzValue]="0" nzPrefix="Q" />
      </nz-card>
    </div>
  `,
})
export class MiRendimientoComponent {}
