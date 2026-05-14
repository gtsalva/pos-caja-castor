import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SettingsApiResponse {
  data: { store_name: string; setting_id: number; updated_at: string };
}

@Injectable({ providedIn: 'root' })
export class StoreSettingsService {
  private readonly http = inject(HttpClient);
  private readonly _store_name = signal('Mueblería El Castor');

  readonly store_name = this._store_name.asReadonly();

  async load(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<SettingsApiResponse>(`${environment.apiUrl}/settings`),
      );
      this._store_name.set(res.data.store_name);
    } catch {
      // default preserved
    }
  }
}
