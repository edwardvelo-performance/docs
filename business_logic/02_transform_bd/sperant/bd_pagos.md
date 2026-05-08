# `bd_pagos` — Sperant

## ¿Qué representa?

Las **letras o cuotas de pago** asociadas a una venta. Cada fila es una cuota individual con su monto programado, monto pagado, mora, intereses, descuentos y estado.

Esta tabla solo existe en el lado Sperant — Evolta no expone este nivel de detalle financiero.

## ¿De dónde vienen los datos?

| Fuente | Aporta |
|---|---|
| `pagos` (raw Sperant) | Tabla principal con todo el detalle por cuota |

Se leen ~50 columnas con `get_data_table_configurable`.

## Reglas aplicadas

1. **`id_pago`** se asigna con `monotonically_increasing_id`.

2. **Casteos de tipo:**
   - Fechas con `to_date(...)`: `fecha_contrato`, `fecha_vcto`, `fecha_pago`, `fecha_nif`, `fecha_creacion`, `fecha_reprogramacion`, `fecha_aplicacion_reprogramacion`, `fecha_actualizacion`, `fecha_base`, `fecha_recepcion`.
   - Floats: montos, saldos, intereses, descuentos.
   - Integer: `id`, `proceso_id`, `orden_proceso`, `letra_reprogramada_id`.

3. **IDs Sperant:**
   - `id_proyecto_sperant` = `codigo_proyecto`.
   - `id_cliente_sperant` = `nombres_cliente` (atípico — el ID es el nombre).

4. **Sin transformaciones de negocio.** Es una transposición casi 1:1 desde Sperant. La lógica está en cómo se interpretan los campos en el dashboard, no aquí.

5. Auditoría: `fecha_hora_creacion`, `fecha_hora_modificacion`, `fecha_creacion_aud`.

## Diagrama del flujo

```mermaid
flowchart LR
    A["pagos raw Sperant"] --> B["Castear todas las fechas con to_date"]
    B --> C["Castear montos a float y conteos a int"]
    C --> D["Asignar id_pago"]
    D --> E["bd_pagos"]
```

## Resultado: columnas destacadas

| Categoría | Columnas |
|---|---|
| **IDs** | `id_pago`, `id_proyecto_sperant`, `id_cliente_sperant`, `codigo_proforma`, `numero_contrato`, `proceso_id` |
| **Fechas** | `fecha_contrato`, `fecha_vcto`, `fecha_pago`, `fecha_nif`, `fecha_creacion`, `fecha_reprogramacion`, `fecha_recepcion` |
| **Cuota** | `nombre`, `etiqueta`, `tipo`, `tipo_letra`, `tipo_cuenta`, `tipo_cronograma`, `orden_proceso` |
| **Montos** | `monto_programado`, `monto_pagado`, `saldo`, `saldo_capital`, `saldo_precio`, `mora`, `capital`, `interes_compensatorio`, `interes_inicial`, `interes_diferido`, `interes_vencido`, `descuento` |
| **Reprogramación** | `reprogramado`, `letra_reprogramada_id`, intereses nuevos y descuentos asociados |
| **Estado** | `estado`, `estado_nif`, `activo`, `motivo_inactivo`, `recepcionado`, `cronograma_aprobado` |
| **Banco** | `banco`, `cuenta_bancaria` |
| **Otros** | `codigo_unico`, `proceso`, `ubicacion`, `ubicacion_anterior`, `observacion` |

## Cosas a tener en cuenta

- **`id_cliente_sperant` es el nombre del cliente, no un número.** Este es un patrón atípico — pagos no tiene una FK numérica al cliente. Para vincular con `bd_clientes` hay que matchear por nombre, lo cual es frágil.
- **Una venta tiene múltiples filas en `bd_pagos`** (una por letra/cuota). Si negocio quiere agregados, hacer group by por `numero_contrato` o `codigo_proforma`.
- **`reprogramado`, `nuevo_interes_*`, `descuento_interes_*`** describen reprogramaciones de cuotas. Útil para reportes financieros pero no para dashboard comercial.
- Pagos con `activo = false` o `estado` específicos pueden no contar para reportes — verificar con negocio antes de filtrar.

## Referencia al código

- `run_sperant_transform.py` → `run_bd_pagos(...)` y `run_bd_pagos_transform(...)`.
- Esta tabla NO existe en Evolta ni Joined.
