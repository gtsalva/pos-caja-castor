# CLAUDE.md — pos-caja
## App del Vendedor — Mobile First

Lee primero el `CLAUDE.md` de la raíz del workspace, luego el `CLAUDE.md` de la raíz de este proyecto.
Este archivo agrega las reglas específicas de `pos-caja`.

---

## Propósito y Contexto

`pos-caja` es la app que usa el vendedor en su celular o tablet durante el turno de trabajo.
El flujo principal es: **buscar producto → agregar al carrito → confirmar venta**.
Todo lo demás (resumen del día, rendimiento) es secundario a ese flujo.

**El vendedor no debe pensar. La app debe ser obvia.**

---

## Mobile First — Reglas de Diseño

1. **Diseñar primero para 375px** de ancho. Luego escalar a tablet (768px) y desktop si aplica.
2. **Botones táctiles mínimo 48x48px** — especialmente "Agregar al carrito" y "Confirmar venta".
3. **Sin hover-only interactions** — todo debe funcionar con touch.
4. **Bottom navigation** para las secciones principales — no sidebar.
5. **El carrito es siempre visible** — un FAB o barra inferior fija con el total y el contador de ítems.
6. **Inputs numéricos con teclado numérico** — usar `type="number"` o `inputmode="numeric"`.
7. **Feedback inmediato** — cada acción del usuario tiene respuesta visual en < 200ms (NG Zorro spinners, estados de botón).

---

## Pantallas y Flujos

### Flujo principal: Caja (POS)
```
/caja
  ├── Barra de búsqueda (autocompletado con nz-auto-complete)
  ├── Grid de productos encontrados (nz-list o cards táctiles)
  ├── Carrito lateral o bottom sheet
  │   ├── Lista de ítems (nz-list)
  │   ├── Total
  │   └── Botón "Confirmar venta" (nz-button, size large, type primary)
  └── Modal de confirmación → selección método de pago → ticket
```

### Pantallas secundarias
```
/login          → solo email + password, sin extras
/mis-ventas     → nz-list de ventas del turno actual
/mi-rendimiento → nz-statistic (total vendido, comisión estimada) + nz-progress (meta)
```

---

## Estructura del Proyecto

```
pos-caja/src/app/
  ├── core/
  │   ├── guards/
  │   │   ├── auth.guard.ts
  │   │   └── caja-role.guard.ts       ← bloquea roles sin acceso a la caja
  │   ├── interceptors/
  │   │   ├── auth.interceptor.ts
  │   │   └── error.interceptor.ts
  │   └── services/
  │       ├── auth.service.ts
  │       └── session.service.ts
  │
  ├── shared/
  │   ├── components/
  │   │   ├── product-card/            ← card táctil de producto
  │   │   ├── cart-badge/              ← FAB o badge con total
  │   │   └── sale-ticket/             ← preview del ticket post-venta
  │   └── models/
  │       ├── product.model.ts
  │       ├── cart.model.ts
  │       ├── sale.model.ts
  │       └── index.ts
  │
  ├── features/
  │   ├── auth/
  │   │   └── login/
  │   ├── caja/                        ← feature principal
  │   │   ├── components/
  │   │   │   ├── product-search/      ← Dumb: input + lista de resultados
  │   │   │   ├── cart-panel/          ← Dumb: lista de ítems + total
  │   │   │   ├── payment-modal/       ← Dumb: selección método de pago
  │   │   │   └── ticket-modal/        ← Dumb: ticket post-venta
  │   │   ├── services/
  │   │   │   ├── caja-api.service.ts  ← HTTP: productos, crear venta
  │   │   │   └── cart.service.ts      ← estado del carrito con Signals
  │   │   ├── caja-shell/              ← Smart: orquesta el flujo
  │   │   └── caja.routes.ts
  │   │
  │   ├── mis-ventas/
  │   │   ├── mis-ventas.component.ts
  │   │   ├── mis-ventas-api.service.ts
  │   │   └── mis-ventas.routes.ts
  │   │
  │   └── mi-rendimiento/
  │       ├── mi-rendimiento.component.ts
  │       ├── mi-rendimiento-api.service.ts
  │       └── mi-rendimiento.routes.ts
  │
  ├── layout/
  │   └── bottom-nav/                  ← navegación inferior mobile
  │
  ├── app.component.ts
  ├── app.config.ts
  └── app.routes.ts
```

---

## NG Zorro — Componentes Clave

```typescript
// Importar solo lo que se usa (standalone, tree-shaking)
import { NzInputModule }        from 'ng-zorro-antd/input';
import { NzButtonModule }       from 'ng-zorro-antd/button';
import { NzListModule }         from 'ng-zorro-antd/list';
import { NzModalModule }        from 'ng-zorro-antd/modal';
import { NzStatisticModule }    from 'ng-zorro-antd/statistic';
import { NzProgressModule }     from 'ng-zorro-antd/progress';
import { NzBadgeModule }        from 'ng-zorro-antd/badge';
import { NzTagModule }          from 'ng-zorro-antd/tag';
import { NzInputNumberModule }  from 'ng-zorro-antd/input-number';
import { NzSpinModule }         from 'ng-zorro-antd/spin';
import { NzMessageModule }      from 'ng-zorro-antd/message'; // feedback acciones
import { NzDrawerModule }       from 'ng-zorro-antd/drawer'; // carrito en mobile
import { NzAutoCompleteModule } from 'ng-zorro-antd/auto-complete';
```

### Patrones específicos de pos-caja

**Botón de confirmar venta — siempre grande y primario:**
```html
<button nz-button nzType="primary" nzSize="large" nzBlock
  [disabled]="!canConfirm()" [nzLoading]="isProcessing()">
  Confirmar venta · Q{{ totalAmount() | number:'1.2-2' }}
</button>
```

**Carrito como Drawer en mobile:**
```html
<nz-drawer [nzVisible]="cartVisible()" nzPlacement="bottom" nzHeight="85vh"
  nzTitle="Carrito" (nzOnClose)="closeCart()">
  <ng-container *nzDrawerContent>
    <app-cart-panel [items]="cartItems()" [total]="totalAmount()"
      (itemRemoved)="removeFromCart($event)"
      (confirmed)="openPaymentModal()" />
  </ng-container>
</nz-drawer>
```

**Feedback de venta exitosa:**
```typescript
// En el componente Smart, después de confirmar
this.message.success('Venta registrada correctamente', { nzDuration: 3000 });
```

---

## Cart Service — Estado con Signals

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items       = this._items.asReadonly();
  readonly totalAmount = computed(() =>
    this._items().reduce((sum, i) => sum + i.subtotal, 0)
  );
  readonly itemCount   = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );
  readonly isEmpty     = computed(() => this._items().length === 0);
  readonly canConfirm  = computed(() => !this.isEmpty());

  addItem(product: Product, quantity = 1): void {
    this._items.update(items => {
      const idx = items.findIndex(i => i.productId === product.id);
      if (idx >= 0) {
        return items.map((item, i) =>
          i === idx
            ? { ...item, quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unitPrice }
            : item
        );
      }
      return [...items, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      }];
    });
  }

  removeItem(productId: string): void {
    this._items.update(items => items.filter(i => i.productId !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  buildSalePayload(salespersonId: string, paymentMethod: PaymentMethod): CreateSalePayload {
    return {
      salespersonId,
      paymentMethod,
      items: this._items().map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };
  }
}
```

---

## Arquitectura de Componentes (Obligatorio)

Tipos de componentes:

### Dumb (Presentacionales)
- Solo reciben `@Input` y emiten `@Output`
- NO contienen lógica de negocio
- NO hacen llamadas HTTP
- NO usan servicios directamente

### Smart (Contenedores)
- Orquestan lógica
- Llaman servicios
- Manejan estado

Regla:
- Claude NUNCA debe poner lógica de negocio en componentes Dumb

___

## Manejo de Estado

- El estado global del carrito vive exclusivamente en `CartService`
- Los componentes NO deben duplicar estado local del carrito
- Siempre consumir Signals desde servicios

Prohibido:
- `local cartItems = [...]` en componentes

## Consistencia con Backend (CRÍTICO)

- Todas las propiedades deben usar `snake_case`
- Nunca usar `camelCase` en modelos

Ejemplo correcto:
- `product_id`
- `unit_price`
- `salesperson_id`
___

## Performance Mobile

- Evitar renders innecesarios
- Usar `trackBy` en listas
- No usar pipes complejos en templates
- Evitar cálculos en HTML
- Preferir `computed()` sobre funciones en template

Objetivo:
- UI responde en < 200ms siempre

___

## Servicios API

- Todas las llamadas HTTP se hacen en `*-api.service.ts`
- Los componentes Smart consumen servicios API
- Nunca hacer HTTP directamente en componentes

Naming:
- `caja-api.service.ts`
- `mis-ventas-api.service.ts`

Regla:
- 1 servicio por feature

___

## Manejo de Errores UX

- Toda acción crítica (venta) debe manejar errores
- Mostrar mensaje claro con `NzMessageService`
- Nunca dejar al usuario sin feedback

Ejemplo:
- Error de red → "No se pudo registrar la venta. Intenta nuevamente."

___ 

## Flujo de Venta (CRÍTICO)

- No permitir doble submit
- Bloquear botón mientras procesa (`nzLoading`)
- Evitar ventas duplicadas
- Confirmar antes de enviar
- Limpiar carrito SOLO si la API responde exitosamente

___ 

## Estructura de Archivos por Feature (Obligatorio)

Cada feature sigue esta estructura fija:

```
feature/                     ← nombre de la feature (ej: caja, mis-ventas)
  ├── components/              ← solo componentes Dumb
  │   ├── product-search/      ← smart component
  │   │   ├── product-search.component.ts
  │   │   └── product-search.routes.ts
  │   └── cart-panel/          ← dumb component
  │       ├── cart-panel.component.ts
  │       └── cart-panel.routes.ts
  ├── services/
  │   ├── caja-api.service.ts  ← solo calls HTTP
  │   └── cart.service.ts      ←Signals globales
  └── caja.routes.ts
```

Reglas estrictas:
- Los Smart components están en la raíz de la feature
- Los Dumb components están en subcarpetas
- Nunca mezclar Smart y Dumb en la misma carpeta
- Rutas definidas en `*.routes.ts`

## Reglas Específicas de pos-caja

| Regla | Descripción |
|-------|-------------|
| **`snake_case` en propiedades** | Toda propiedad de modelo/interface usa `snake_case`: `product_id`, `unit_price`, `sale_id` |
| **`PascalCase` en clases e interfaces** | `Product`, `CartItem`, `Sale`, `CreateSalePayload` |
| **Cero `any`** | No `any` en ningún archivo. Crear el tipo/interface si no existe |
| **Mobile first siempre** | Todo componente nuevo se diseña en 375px primero |
| **Carrito persistente** | El carrito no se pierde al navegar entre pantallas del turno |
| **Confirmar antes de limpiar** | Siempre `nz-modal` de confirmación antes de vaciar el carrito |
| **Sin tablas** | En mobile no hay tablas. Usar `nz-list` con avatares e iconos |
| **Números de dinero formateados** | Siempre `Q 1,250.00` — CurrencyPipe con locale `es-GT` |
| **Sin acceso a `/admin`** | Si un admin inicia sesión en pos-caja, ve la caja normal |
| **Timeout de sesión visible** | Mostrar alerta 5 min antes de que expire el JWT (8h) |

---

## Inicialización del Proyecto

### Prerequisitos
- Node 20 LTS (`node -v` → `v20.x.x`)
- Angular CLI 19: `npm install -g @angular/cli@19`

### Crear el proyecto (solo primera vez)
```bash
# Desde la raíz del workspace
ng new pos-caja \
  --routing \
  --style=less \
  --strict \
  --standalone \
  --ssr=false \
  --skip-git
cd pos-caja
```

### Instalar NG Zorro 19
```bash
ng add ng-zorro-antd@19
# Cuando pregunte:
#   Icon style?           → outline
#   Set up custom theme?  → Yes
#   Enable all Components?→ No
#   Template?             → blank
#   Locale?               → es_ES
```

### `src/app/app.config.ts`
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { es_ES, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(NzMessageModule),
    { provide: NZ_I18N, useValue: es_ES },
    { provide: LOCALE_ID, useValue: 'es-GT' },
  ],
};
```

### `src/app/app.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { cajaRoleGuard } from './core/guards/caja-role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'caja', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'caja',
    canActivate: [authGuard, cajaRoleGuard],
    loadChildren: () =>
      import('./features/caja/caja.routes').then(m => m.cajaRoutes),
  },
  {
    path: 'mis-ventas',
    canActivate: [authGuard, cajaRoleGuard],
    loadComponent: () =>
      import('./features/mis-ventas/mis-ventas.component').then(m => m.MisVentasComponent),
  },
  {
    path: 'mi-rendimiento',
    canActivate: [authGuard, cajaRoleGuard],
    loadComponent: () =>
      import('./features/mi-rendimiento/mi-rendimiento.component').then(m => m.MiRendimientoComponent),
  },
  { path: '**', redirectTo: 'caja' },
];
```

### `src/app/core/interceptors/auth.interceptor.ts`
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (!token) return next(req);
  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
```

### `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
```

### `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://pos-api.railway.app/api',
};
```

### Levantar en desarrollo
```bash
ng serve   # http://localhost:4200
```

---

## Gotchas Conocidos

| # | Gotcha | Fix |
|---|--------|-----|
| 1 | **Signal timing en guards post-login** — `cajaRoleGuard` leía `currentUser()?.role` (computed signal) justo después de `router.navigate()`. En ese punto el computed puede no haber propagado aún → guard redirige a `/login`. | Usar `auth.isLoggedIn()` que lee `_token` (WritableSignal — siempre sincrónico). Regla: en guards que corren inmediatamente tras navigate programático, leer WritableSignal directo, no computed. |
| 2 | **TransformInterceptor double-wrap** — Respuestas paginadas llegan como `{ data: { data: T[], total, page, limit }, message, statusCode }`, NO con `total` en la raíz. | Usar `ApiPaginatedResponse<T>` con `data: PaginatedResult<T>` y mapear `res.data`. |
| 3 | **JWT sin `name`** — Si el backend no incluye `name` en el payload, `restoreUserFromToken()` no puede reconstruir `full_name` en refresh de página. | `JwtStrategy.validate()` debe retornar `name: user.full_name`. |

### Git (repositorio propio de pos-caja)
```bash
git init
git add .
git commit -m "chore: initial Angular 19 scaffold"
```

