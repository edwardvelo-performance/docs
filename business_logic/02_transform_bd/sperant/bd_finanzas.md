# `bd_finanzas` — Sperant

## ¿Qué representa?

El **resumen financiero** de una venta: cuánto se separó, cuánto se financió, en cuántas cuotas, con qué TEA, fechas de aprobación, totales de intereses y descuentos.

Es la "vista contable" de una operación, complementaria a `bd_pagos` (que tiene el detalle por cuota).

Solo existe en el pipeline Sperant.

## ¿De dónde vienen los datos?

| Fuente | Aporta |
|---|---|
| `finanzas` (raw Sperant) | Tabla principal con ~45 columnas financieras |

## Reglas aplicadas

1. **`id_finanza`** asignado con `monotonically_increasing_id`.

2. **`id_pago_sperant`** = `finanzas.id`.

3. **Casteos:**
   - Fechas con `to_date`: `fecha_firma_contrato`, `fecha_1ra_cuota`, `fecha_creacion`, `fecha_aprobacion`, `fecha_solicitud`, `fecha_cancelacion`, `fecha_actualizacion`.
   - Floats: TEA, separación, totales, intereses, capital, descuentos, penalidad.
   - Integers: número de cuotas, montos cuota, número de orden, letra solicitada, tiempo espera.

4. **Sin transformaciones de negocio.** Mapeo casi 1:1 con renombrado mínimo.

5. Auditoría: `fecha_hora_creacion`, `fecha_hora_modificacion`, `fecha_creacion_aud`.

## Diagrama del flujo

```mermaid
flowchart LR
    A["finanzas raw Sperant"] --> B["Castear fechas con to_date"]
    B --> C["Castear floats e ints"]
    C --> D["Asignar id_finanza"]
    D --> E["bd_finanzas"]
```

## Resultado: columnas destacadas

| Categoría | Columnas |
|---|---|
| **IDs** | `id_finanza`, `id_pago_sperant`, `codigo_proforma`, `numero_contrato` |
| **Resumen contrato** | `tipo`, `nombre`, `tea` (tasa efectiva anual), `separacion`, `total_inicial`, `firma_contrato` |
| **Saldos y cuotas** | `saldo_inicial`, `saldo_financiar`, `num_cuotas_inicial`, `num_cuotas_saldo`, `monto_cuota_inicial`, `monto_cuota_financiar` |
| **Fechas clave** | `fecha_firma_contrato`, `fecha_1ra_cuota`, `fecha_aprobacion`, `fecha_solicitud`, `fecha_cancelacion` |
| **Aprobación** | `usuario_aprobador`, `tiempo_espera`, `observacion` |
| **Totales acumulados** | `total_int_compensatorio`, `total_int_diferido`, `total_int_inicial`, `total_int_mora`, `total_int_vencido`, `total_descuento`, `total_cancelar` |
| **Cancelación / penalidad** | `capital_pagado_resolucion`, `porcentaje_penalidad`, `monto_penalidad`, `devolucion_resolucion`, `penalidad_aplicada`, `monto_condonado` |
| **Otros** | `tipo_cuota`, `numero_orden`, `recepcionado`, `estado`, `subtotal`, `domicilio`, `letra_solicitada` |

## Cosas a tener en cuenta

- **No tiene `id_cliente` directo.** Para vincular con un cliente hay que pasar por `codigo_proforma` o `numero_contrato`.
- **TEA** es la tasa efectiva anual. Útil para reportes financieros.
- **`monto_cuota_inicial` y `monto_cuota_financiar` están casteados a `int`** — perdiendo decimales. Si los montos tienen centavos, se truncan. Verificar con negocio si es deseado.
- Esta tabla **no se usa en los dashboards comerciales actuales** — está disponible para reportes financieros futuros.

## Referencia al código

- `run_sperant_transform.py` → `run_bd_finanzas(...)` y `run_bd_finanzas_transform(...)`.
- Esta tabla NO existe en Evolta ni Joined.
