import { Component } from '@angular/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-mis-ventas',
  standalone: true,
  imports: [NzEmptyModule],
  template: `
    <div style="padding: 24px 16px;">
      <h3 style="color: #3d3432; margin-bottom: 16px;">Mis ventas del día</h3>
      <nz-empty nzNotFoundContent="Aún no tienes ventas hoy" />
    </div>
  `,
})
export class MisVentasComponent {}
