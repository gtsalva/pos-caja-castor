import { Component, inject, signal, output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzInputModule }   from 'ng-zorro-antd/input';
import { NzIconModule }    from 'ng-zorro-antd/icon';
import { NzModalModule }   from 'ng-zorro-antd/modal';
import { NzFormModule }    from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CotizacionesApiService } from '../../services/cotizaciones-api.service';
import { Supplier, CreateSupplierPayload } from '../../../../shared/models/supplier.model';

@Component({
  selector: 'app-supplier-selector',
  standalone: true,
  imports: [FormsModule, NzInputModule, NzIconModule, NzModalModule, NzFormModule],
  templateUrl: './supplier-selector.component.html',
  styleUrl:    './supplier-selector.component.less',
})
export class SupplierSelectorComponent implements OnDestroy {
  private readonly api     = inject(CotizacionesApiService);
  private readonly message = inject(NzMessageService);
  private readonly search$ = new Subject<string>();

  readonly supplierSelected = output<Supplier | null>();

  readonly searchText       = signal('');
  readonly results          = signal<Supplier[]>([]);
  readonly searching        = signal(false);
  readonly showDropdown     = signal(false);
  readonly selectedSupplier = signal<Supplier | null>(null);

  readonly showNewModal = signal(false);
  readonly saving       = signal(false);
  readonly newSupplier: CreateSupplierPayload = { name: '', phone: '', contact_name: '' };

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) { this.results.set([]); return of([]); }
        this.searching.set(true);
        return this.api.searchSuppliers(term);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: suppliers => {
        this.results.set(suppliers);
        this.searching.set(false);
        this.showDropdown.set(true);
      },
      error: () => this.searching.set(false),
    });
  }

  onSearchInput(value: string): void {
    this.searchText.set(value);
    if (!value) { this.clearSupplier(); return; }
    this.search$.next(value);
  }

  selectSupplier(s: Supplier): void {
    this.selectedSupplier.set(s);
    this.searchText.set(s.name);
    this.showDropdown.set(false);
    this.results.set([]);
    this.supplierSelected.emit(s);
  }

  clearSupplier(): void {
    this.selectedSupplier.set(null);
    this.searchText.set('');
    this.results.set([]);
    this.showDropdown.set(false);
    this.supplierSelected.emit(null);
  }

  openNewModal(): void {
    this.newSupplier.name         = this.searchText();
    this.newSupplier.phone        = '';
    this.newSupplier.contact_name = '';
    this.showDropdown.set(false);
    this.showNewModal.set(true);
  }

  saveNewSupplier(): void {
    if (!this.newSupplier.name.trim()) return;
    this.saving.set(true);
    this.api.createSupplier(this.newSupplier).subscribe({
      next: supplier => {
        this.saving.set(false);
        this.showNewModal.set(false);
        this.selectSupplier(supplier);
        this.message.success(`Proveedor "${supplier.name}" creado`);
      },
      error: (err) => {
        this.saving.set(false);
        this.message.error(err?.error?.message ?? 'Error al crear el proveedor');
      },
    });
  }

  formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    const local = digits.startsWith('502') ? digits.slice(3) : digits;
    if (local.length === 8) return `${local.slice(0, 4)}-${local.slice(4)}`;
    return phone;
  }

  ngOnDestroy(): void { this.search$.complete(); }
}
