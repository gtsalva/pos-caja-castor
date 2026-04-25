import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NzIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.less',
})
export class BottomNavComponent {}
