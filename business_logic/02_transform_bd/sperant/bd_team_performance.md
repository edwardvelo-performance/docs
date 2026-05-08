# `bd_team_performance` — Sperant

## ¿Qué representa?

El equipo comercial asignado al grupo de Sperant.

## ¿De dónde vienen los datos?

**Hardcoded**:

```sql
SELECT 1 AS id_team_performance, 'Team_1_Sperant' AS nombre,
       1 AS id_grupo_inmobiliario, ...
```

## Resultado

Una sola fila con `nombre = Team_1_Sperant`.

## Cosas a tener en cuenta

- Solo hay un team default. El sufijo `_Sperant` permite distinguir cuando se mira la tabla en BigQuery.

## Referencia al código

- `tables_db_source.py` → entrada `bd_team_performance` en `read_query_1`.
- Orquestador: `run_sperant_transform.py`.
