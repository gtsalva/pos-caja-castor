import {
  Component,
  computed,
  inject,
  signal,
  output,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CajaApiService } from '../../services/caja-api.service';
import { Client, CreateClientPayload } from '../../../../shared/models/client.model';
import {
  DEPARTAMENTOS_GUATEMALA,
  DEFAULT_DEPARTAMENTO,
  DEFAULT_MUNICIPIO,
  getMunicipios,
} from '../../../../shared/data/guatemala-locations';

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
  ],
  templateUrl: './client-selector.component.html',
  styleUrl: './client-selector.component.less',
})
export class ClientSelectorComponent implements OnDestroy {
  private readonly api = inject(CajaApiService);
  private readonly message = inject(NzMessageService);
  private readonly search$ = new Subject<string>();

  readonly clientSelected = output<Client | null>();

  readonly searchText = signal('');
  readonly results = signal<Client[]>([]);
  readonly searching = signal(false);
  readonly showDropdown = signal(false);
  readonly selectedClient = signal<Client | null>(null);

  readonly showNewModal = signal(false);
  readonly saving = signal(false);

  readonly departamentos = DEPARTAMENTOS_GUATEMALA;
  readonly selectedDept = signal(DEFAULT_DEPARTAMENTO);
  readonly currentMunicipios = computed(() => getMunicipios(this.selectedDept()));

  readonly newClient: CreateClientPayload = {
    full_name: '',
    phone: '',
    nit: 'CF',
    email: '',
    billing_address: '',
    billing_department: DEFAULT_DEPARTAMENTO,
    billing_city: DEFAULT_MUNICIPIO,
  };

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) { this.results.set([]); return of([]); }
        this.searching.set(true);
        return this.api.searchClients(term);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: clients => {
        this.results.set(clients);
        this.searching.set(false);
        this.showDropdown.set(true);
      },
      error: () => this.searching.set(false),
    });
  }

  onSearchInput(value: string): void {
    this.searchText.set(value);
    if (!value) { this.clearClient(); return; }
    this.search$.next(value);
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.searchText.set(client.full_name);
    this.showDropdown.set(false);
    this.results.set([]);
    this.clientSelected.emit(client);
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.searchText.set('');
    this.results.set([]);
    this.showDropdown.set(false);
    this.clientSelected.emit(null);
  }

  onDeptChange(dept: string): void {
    this.selectedDept.set(dept);
    this.newClient.billing_city = this.currentMunicipios()[0] ?? '';
  }

  openNewModal(): void {
    this.newClient.full_name = this.searchText();
    this.newClient.phone = '';
    this.newClient.nit = 'CF';
    this.newClient.email = '';
    this.newClient.billing_address = '';
    this.newClient.billing_department = DEFAULT_DEPARTAMENTO;
    this.newClient.billing_city = DEFAULT_MUNICIPIO;
    this.selectedDept.set(DEFAULT_DEPARTAMENTO);
    this.showDropdown.set(false);
    this.showNewModal.set(true);
  }

  saveNewClient(): void {
    if (!this.newClient.full_name.trim()) return;
    if (!this.newClient.billing_address.trim()) return;
    this.saving.set(true);
    this.api.createClient(this.newClient).subscribe({
      next: client => {
        this.saving.set(false);
        this.showNewModal.set(false);
        this.selectClient(client);
        this.message.success(`Cliente "${client.full_name}" creado`);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Error al crear el cliente';
        this.message.error(msg);
      },
    });
  }

  // Guatemala: 8 digits → XXXX-XXXX, with +502 prefix stripped for display
  formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    const local = digits.startsWith('502') ? digits.slice(3) : digits;
    if (local.length === 8) return `${local.slice(0, 4)}-${local.slice(4)}`;
    return phone;
  }

  ngOnDestroy(): void {
    this.search$.complete();
  }
}
