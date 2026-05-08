# `bd_grupo_inmobiliario` — Evolta

## ¿Qué representa?

El grupo empresarial al que pertenece la inmobiliaria. Una empresa puede ser parte de un grupo más grande (holding inmobiliario).

## ¿De dónde vienen los datos?

**Hardcoded** en `tables_db_source.py` vía SQL inline. No se lee de ninguna tabla raw.

## Reglas aplicadas

Esto es una tabla maestra de una sola fila. La transformación es prácticamente nula:

```sql
SELECT 1 AS id_grupo_inmobiliario, 'Grupo_2' AS nombre,
       NOW() AS fecha_hora_creacion_aud,
       NOW() AS fecha_hora_modificacion_aud,
       CURRENT_DATE AS fecha_creacion_aud
```

## Resultado

Una fila con:
- `id_grupo_inmobiliario` = 1
- `nombre` = `Grupo_2`
- Timestamps de auditoría

## Cosas a tener en cuenta

- Si se quiere cambiar el nombre del grupo o agregar más grupos, hay que editar `tables_db_source.py` directamente.
- El ID está fijo en 1 — todas las empresas Evolta apuntan al mismo grupo.

## Referencia al código

- `tables_db_source.py` → entrada `bd_grupo_inmobiliario` en `read_query_2`.
- Orquestador: `run_evolta_transform.py` → `run_bd_grupo_inmobiliario(...)`.
