# `bd_grupo_inmobiliario` — Joined

## ¿Qué representa?

El grupo empresarial para el esquema joined.

## ¿De dónde vienen los datos?

**Hardcoded** en `tables_db_source.py`, igual que las otras versiones. Para los joined se reutiliza la entrada de Evolta (`read_query_2`).

## Resultado

Una fila con `id_grupo_inmobiliario = 1`, `nombre = Grupo_2`, timestamps de auditoría.

## Cosas a tener en cuenta

- No se distingue entre el grupo de Evolta y el de Sperant — solo se usa el de Evolta.
- Si se necesita más granularidad por grupo en esquemas joined, hay que ajustar la lógica.

## Referencia al código

- `run_evolta_sperant_transform.py` → `run_bd_grupo_inmobiliario(...)`.
