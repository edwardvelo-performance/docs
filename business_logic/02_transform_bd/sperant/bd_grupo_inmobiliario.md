# `bd_grupo_inmobiliario` — Sperant

## ¿Qué representa?

El grupo empresarial al que pertenece la inmobiliaria que usa Sperant.

## ¿De dónde vienen los datos?

**Hardcoded** en `tables_db_source.py`. Misma lógica que la versión Evolta pero con valor distinto:

```sql
SELECT 1 AS id_grupo_inmobiliario, 'Grupo_2_Sperant' AS nombre, ...
```

## Resultado

Una fila con:
- `id_grupo_inmobiliario` = 1
- `nombre` = `Grupo_2_Sperant`
- Timestamps de auditoría

## Cosas a tener en cuenta

- El sufijo `_Sperant` permite distinguir esta fila de la del pipeline Evolta cuando se observa una tabla unida.
- Tabla de una sola fila — sin transformación real.

## Referencia al código

- `tables_db_source.py` → entrada `bd_grupo_inmobiliario` en `read_query_1`.
- Orquestador: `run_sperant_transform.py` → `run_bd_grupo_inmobiliario(...)`.
