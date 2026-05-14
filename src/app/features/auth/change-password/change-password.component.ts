import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('new_password')?.value;
  const confirm = control.get('confirm_password')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule, NzInputModule, NzButtonModule, NzCardModule, NzIconModule,
  ],
  template: `
    <div class="page-wrap">
      <nz-card nzTitle="Cambiar contraseña">
        <form nz-form nzLayout="vertical" [formGroup]="form" (ngSubmit)="submit()">

          <nz-form-item>
            <nz-form-label nzRequired>Contraseña actual</nz-form-label>
            <nz-form-control [nzErrorTip]="currentErr">
              <nz-input-group [nzSuffix]="eyeCurrent" nzSize="large">
                <input nz-input [type]="showCurrent() ? 'text' : 'password'"
                  formControlName="current_password"
                  placeholder="Contraseña actual" />
              </nz-input-group>
              <ng-template #eyeCurrent>
                <span nz-icon [nzType]="showCurrent() ? 'eye' : 'eye-invisible'"
                  style="cursor:pointer" (click)="showCurrent.set(!showCurrent())"></span>
              </ng-template>
              <ng-template #currentErr>Campo requerido</ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Nueva contraseña</nz-form-label>
            <nz-form-control [nzErrorTip]="newErr">
              <nz-input-group [nzSuffix]="eyeNew" nzSize="large">
                <input nz-input [type]="showNew() ? 'text' : 'password'"
                  formControlName="new_password"
                  placeholder="Mínimo 8 caracteres" />
              </nz-input-group>
              <ng-template #eyeNew>
                <span nz-icon [nzType]="showNew() ? 'eye' : 'eye-invisible'"
                  style="cursor:pointer" (click)="showNew.set(!showNew())"></span>
              </ng-template>
              <ng-template #newErr>
                @if (form.get('new_password')?.hasError('required')) { Campo requerido }
                @else { Mínimo 8 caracteres }
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Confirmar nueva contraseña</nz-form-label>
            <nz-form-control [nzErrorTip]="confirmErr">
              <nz-input-group [nzSuffix]="eyeConfirm" nzSize="large">
                <input nz-input [type]="showConfirm() ? 'text' : 'password'"
                  formControlName="confirm_password"
                  placeholder="Repite la nueva contraseña" />
              </nz-input-group>
              <ng-template #eyeConfirm>
                <span nz-icon [nzType]="showConfirm() ? 'eye' : 'eye-invisible'"
                  style="cursor:pointer" (click)="showConfirm.set(!showConfirm())"></span>
              </ng-template>
              <ng-template #confirmErr>
                @if (form.get('confirm_password')?.hasError('required')) { Campo requerido }
                @else { Las contraseñas no coinciden }
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control>
              <button nz-button nzType="primary" nzSize="large" nzBlock
                [nzLoading]="submitting()"
                [disabled]="form.invalid || submitting()"
                type="submit">
                Actualizar contraseña
              </button>
            </nz-form-control>
          </nz-form-item>

        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .page-wrap {
      padding: 24px 16px;
      max-width: 480px;
      margin: 0 auto;
    }
  `],
})
export class ChangePasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  submitting = signal(false);
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  form = this.fb.group(
    {
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const { current_password, new_password } = this.form.value;
    this.auth.changePassword(current_password!, new_password!).subscribe({
      next: () => {
        this.message.success('Contraseña actualizada correctamente');
        this.form.reset();
        this.submitting.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'No se pudo cambiar la contraseña';
        this.message.error(msg);
        this.submitting.set(false);
      },
    });
  }
}
