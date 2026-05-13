# pos-caja

App del vendedor para Mueblería El Castor. Diseñada mobile-first para registrar ventas desde celular o tablet durante el turno de trabajo.

**Stack:** Angular 19 · NG Zorro · TypeScript

## Funcionalidades

- Búsqueda de productos y carrito de compras
- Confirmación de venta con selección de método de pago
- Historial de ventas del turno
- Seguimiento de rendimiento e incentivos

## Desarrollo local

```bash
npm install
ng serve        # http://localhost:4200
```

La API se consume desde `http://localhost:3001/api` en desarrollo.

## Deploy

Cada push a `main` dispara un deploy automático a Cloudflare Pages vía GitHub Actions.
