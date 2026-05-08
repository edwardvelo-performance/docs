# `bd_procesos` — Sperant

## ¿Qué representa?

Los procesos comerciales en Sperant. Mucho más rica que la versión Evolta porque Sperant tiene una tabla `procesos` dedicada con todos los detalles del flujo (separación, venta, anulación, NIF, devolución, penalidades).

## ¿De dónde vienen los datos?

| Fuente | Aporta |
|---|---|
| `procesos` (raw Sperant) | Tabla principal — todos los datos del proceso |
| `unidades`, `proyectos` (raw) | Para los códigos |
| `idunidad_bd_unidad_mapping`, `idproyecto_bd_cod_mapping`, `idproforma_bd_mapping` | IDs finales |

## Reglas aplicadas

1. **`id_proceso` secuencial** vía `row_number` ordenando por `procesos.id`.

2. **Joins:**
   - `procesos.codigo_unidad` ↔ `unidades.codigo` (left).
   - `procesos.codigo_proyecto` ↔ `proyectos.codigo` (left).
   - `procesos.proforma_id` ↔ `proforma_mapping.id_proforma_original` (left).
   - Mappings para IDs finales.

3. **Mayúsculas** en muchos campos: `origen_proforma`, `modalidad_contrato`, `tipo_financiamiento`, `banco`, `nombre`, `completado`, `flujo_anulacion`, `tipo_cronograma`, `estado_contrato`, `observacion_devolucion`, `motivo_caida`, `proceso_anulacion`, `paso_actual`.

4. **Casteos:**
   - Fechas → `date` (con `to_date` para los strings).
   - Montos → `double`.
   - Conteos → `integer`.

5. **`nombre`** se mantiene tal cual viene del CRM (en mayúsculas). NO se renombra a `nombre_proceso` (importante para que los dashboards puedan filtrar `WHERE pr.nombre = 'SEPARACION'`).

6. Auditoría con timestamps.

## Diagrama del flujo

```mermaid
flowchart LR
    A["procesos raw Sperant"] --> J["Joins con unidades, proyectos, mappings"]
    J --> I["Asignar id_proceso secuencial"]
    I --> U["Uppercase a categoricos"]
    U --> C["Castear fechas y montos"]
    C --> R["bd_procesos"]
```

## Resultado

Estructura **mucho más completa** que la versión Evolta:

| Columna | Sperant | Evolta |
|---|---|---|
| `completado` | Real | NULL |
| `total_pendiente` | Real | NULL |
| `fecha_nif`, `estado_nif` | Real | NULL |
| `flujo_anulacion` | Real | NULL |
| `fecha_anulacion` | Real | NULL |
| `tipo_cronograma`, `estado_contrato` | Real | NULL |
| `devolucion`, `fecha_devolucion`, `excedente` | Real | NULL |
| `motivo_caida`, `paso_actual`, `terminado` | Real | NULL |
| `penalidad`, `proceso_anulacion` | Real | NULL |
| `fecha_minuta`, `fecha_impresion_contrato` | Real | NULL |

## Cosas a tener en cuenta

- **`nombre`** sigue siendo el campo que define el tipo de proceso (`SEPARACION`, `VENTA`). Está en mayúsculas (el CRM Sperant ya guarda en mayúsculas).
- **No se renombra a `nombre_proceso`** intencionalmente — el dashboard espera `nombre`.
- Como Sperant expone mucho más detalle, los reportes que dependen de fechas de minuta, NIF, anulación, etc. solo funcionan plenamente con esta versión.

## Referencia al código

- `transformation_sperant_operations.py` → `transform_bd_procesos(...)`.
