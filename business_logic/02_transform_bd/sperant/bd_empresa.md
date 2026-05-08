# `bd_empresa` — Sperant

## ¿Qué representa?

La empresa que usa el CRM Sperant. En este pipeline siempre es **una sola: CHECOR**.

## ¿De dónde vienen los datos?

A diferencia de Evolta, Sperant **no expone una tabla de empresas**. Por eso los datos son hardcoded:

- En `tables_db_source.py` se inyecta vía SQL inline: `SELECT 1 AS id, 'CHECOR' AS empresa, 1 AS id_team_performance ...`.
- Después en transformación se reorganizan las columnas.

## Reglas aplicadas

1. Se hace un join con un mapping interno (`idempresa_bd_empresa_mapping`) para asignar el ID final.
2. Se renombra `empresa` → `nombre`.
3. Se hardcodea `id_team_performance = 1`.
4. `distinct` para evitar duplicados.
5. Auditoría con timestamps.

## Diagrama del flujo

```mermaid
flowchart LR
    A["SQL inline en tables_db_source"] --> B["Join con mapping interno"]
    B --> C["Renombrar empresa = nombre"]
    C --> D["bd_empresa con id_empresa = 1"]
```

## Resultado

| Columna | Valor |
|---|---|
| `id_empresa` | 1 |
| `nombre` | CHECOR |
| `id_team_performance` | 1 |
| `fecha_hora_creacion_aud`, `fecha_hora_modificacion_aud` | Timestamp actual |

## Cosas a tener en cuenta

- Si en el futuro hay otro cliente que use Sperant, hay que **editar `tables_db_source.py`** y ajustar la lógica del mapping. No basta con agregar una nueva empresa al CRM.
- El nombre "CHECOR" está literal en el código.

## Referencia al código

- `transformation_sperant_operations.py` → `transform_bd_empresa(df, idempresa_bd_empresa_mapping)`.
- SQL inline: `tables_db_source.py` → entrada `bd_empresa` en `read_query_1`.
- Orquestador: `run_sperant_transform.py`.
