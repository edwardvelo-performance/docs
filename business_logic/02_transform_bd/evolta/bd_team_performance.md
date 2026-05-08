# `bd_team_performance` — Evolta

## ¿Qué representa?

El **equipo comercial** asignado al grupo inmobiliario. Sirve para reportar performance por equipo cuando hay varios.

## ¿De dónde vienen los datos?

**Hardcoded** en `tables_db_source.py`:

```sql
SELECT 1 AS id_team_performance, 'Team_1_Evolta' AS nombre,
       1 AS id_grupo_inmobiliario, ...
```

## Resultado

Una fila con:
- `id_team_performance` = 1
- `nombre` = `Team_1_Evolta`
- `id_grupo_inmobiliario` = 1

## Cosas a tener en cuenta

- Solo hay un team por defecto. Si se quiere segmentar reportes por equipo, hay que cargar más filas (editando código o pasando a una tabla externa).
- El ID 1 es referenciado por `bd_empresa.id_team_performance`.

## Referencia al código

- `tables_db_source.py` → entrada `bd_team_performance` en `read_query_2`.
- Orquestador: `run_evolta_transform.py` → `run_bd_team_performance(...)`.
