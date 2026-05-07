import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';
import { NzButtonModule }      from 'ng-zorro-antd/button';
import { NzFormModule }        from 'ng-zorro-antd/form';
import { NzInputModule }       from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule }        from 'ng-zorro-antd/icon';
import { NzMessageService }    from 'ng-zorro-antd/message';
import { NzDividerModule }     from 'ng-zorro-antd/divider';
import { NzSelectModule }      from 'ng-zorro-antd/select';
import { NzSwitchModule }      from 'ng-zorro-antd/switch';
import { NzAlertModule }       from 'ng-zorro-antd/alert';
import { QuetzalesPipe }       from '../../../shared/pipes/quetzales.pipe';
import { CotizacionesApiService, Category } from '../services/cotizaciones-api.service';
import { CreateCustomOrderItemPayload } from '../models/custom-order.model';
import { ClientSelectorComponent }   from '../../caja/components/client-selector/client-selector.component';
import { SupplierSelectorComponent } from '../components/supplier-selector/supplier-selector.component';
import { Client }   from '../../../shared/models/client.model';
import { Supplier } from '../../../shared/models/supplier.model';

@Component({
  selector: 'app-cotizacion-nueva',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, QuetzalesPipe,
    NzButtonModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzIconModule, NzDividerModule, NzSelectModule, NzSwitchModule, NzAlertModule,
    ClientSelectorComponent, SupplierSelectorComponent,
  ],
  templateUrl: './cotizacion-nueva.component.html',
  styleUrl: './cotizacion-nueva.component.less',
})
export class CotizacionNuevaComponent implements OnInit {
  private readonly api     = inject(CotizacionesApiService);
  private readonly router  = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly fb      = inject(FormBuilder);

  readonly saving           = signal(false);
  readonly today            = new Date().toISOString().split('T')[0];
  readonly selectedClient   = signal<Client | null>(null);
  readonly selectedSupplier = signal<Supplier | null>(null);
  readonly categories       = signal<Category[]>([]);

  readonly agreedPrice          = signal<number | null>(null);
  readonly countsForIncentive   = signal(true);
  readonly showDiscountWarning  = computed(() => {
    const ap = this.agreedPrice();
    return ap !== null && ap < this.grandTotal;
  });

  readonly form = this.fb.group({
    delivery_date: [null as string | null],
    client_notes:  [''],
    items: this.fb.array([this.buildItemGroup()]),
  });

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: cats => this.categories.set(cats.filter(c => c.is_active)),
      error: () => {},
    });
  }

  buildItemGroup() {
    return this.fb.group({
      category_id: [null as string | null],
      description: ['', Validators.required],
      quantity:    [1,  [Validators.required, Validators.min(0.01)]],
      unit_price:  [0,  [Validators.required, Validators.min(0)]],
      notes:       [''],
    });
  }

  addItem(): void { this.itemsArray.push(this.buildItemGroup()); }

  removeItem(i: number): void {
    if (this.itemsArray.length > 1) this.itemsArray.removeAt(i);
  }

  subtotalOf(ctrl: AbstractControl): number {
    const qty   = Number(ctrl.get('quantity')?.value ?? 0);
    const price = Number(ctrl.get('unit_price')?.value ?? 0);
    return Math.round(qty * price * 100) / 100;
  }

  get grandTotal(): number {
    return this.itemsArray.controls.reduce((s, c) => s + this.subtotalOf(c), 0);
  }

  onClientSelected(client: Client | null): void   { this.selectedClient.set(client); }
  onSupplierSelected(s: Supplier | null): void { this.selectedSupplier.set(s); }

  back(): void { this.router.navigate(['/cotizaciones']); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const items: CreateCustomOrderItemPayload[] = (v.items ?? []).map(
      (i: { category_id?: string | null; description?: string | null; quantity?: number | null; unit_price?: number | null; notes?: string | null }) => ({
        category_id: i.category_id || undefined,
        description: i.description!,
        quantity:    Number(i.quantity),
        unit_price:  Number(i.unit_price),
        notes:       i.notes || undefined,
      })
    );

    const ap = this.agreedPrice();

    this.saving.set(true);
    this.api.create({
      client_id:            this.selectedClient()?.client_id,
      supplier_id:          this.selectedSupplier()?.supplier_id,
      delivery_date:        v.delivery_date || undefined,
      client_notes:         v.client_notes  || undefined,
      agreed_price:         ap !== null ? ap : undefined,
      counts_for_incentive: this.countsForIncentive(),
      items,
    }).subscribe({
      next: (order) => {
        this.message.success(`Cotización ${order.order_number} creada`);
        this.router.navigate(['/cotizaciones', order.custom_order_id]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.message.error(err?.error?.message ?? 'Error al crear la cotización');
      },
    });
  }
}
