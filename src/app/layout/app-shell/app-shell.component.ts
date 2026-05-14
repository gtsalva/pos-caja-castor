import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, NzIconModule, NzDropDownModule, NzMenuModule, NzAvatarModule, BottomNavComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.less',
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  readonly avatarInitials = computed(() => {
    const name = this.currentUser()?.full_name ?? '';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  });

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
