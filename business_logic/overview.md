# Documentación Lógica y Reglas de Negocio — ETL `infra/src/etl/`

> Esta carpeta documenta **qué hace cada capa del ETL**, **por qué existe cada tabla**, y **qué reglas de negocio aplica cada transformación**.
> Para detalles de implementación / código → leer los archivos `.py` directamente.
> Para *qué* y *por qué* → estos docs.

---

## 1. Visión general

El ETL ingesta datos de dos CRMs inmobiliarios distintos (**Evolta** y **Sperant**), los normaliza a un esquema común `bd_*`, los carga a BigQuery, y a partir de ahí calcula tablas de dashboards comerciales (`dashboard_data.*`).

**Fuentes:**

| Fuente | Tipo | Origen | Schemas |
|---|---|---|---|
| **Sperant** (Source 1 / TYPE 1) | CRM ventas inmobiliarias | Redshift (Postgres-compatible) | `checor` |
| **Evolta** (Source 2 / TYPE 2) | CRM ventas inmobiliarias | Postgres Azure | `sev_4`, `sev_8`, `sev_10`, `sev_11`, `sev_13`, `sev_14`, `sev_15`, `sev_17`, `sev_18`, `sev_19`, `sev_20`, `sev_21`, `sev_22`, `sev_34`, `sev_35`, `sev_36`, `sev_40`, `sev_83`, `sev_84`, `sev_87`, `sev_88`, `sev_106`, `sev_111`, `sev_157`, `sev_162` |
| **Joined** (TYPE 3) | Evolta + Sperant unificados | Ambos | `sev_9`, `sev_121` (configurados en `joined_sources_*`) |

**Destino:** BigQuery — proyecto `etlperformanceprod`.

**Archivos auxiliares (GCS):**
- Bucket `carga_archivo_metas_prod` — metas mensuales por proyecto.
- Bucket `carga_archivos_maestros_etl_prod` — blacklist unidades, asesores, medios de captación, data empresa.

---

## 2. Arquitectura por capas

```mermaid
flowchart TD
    subgraph EXT["Fuentes externas"]
        SP[(Sperant<br/>Redshift)]
        EV[(Evolta<br/>Postgres Azure)]
        GCS[(GCS<br/>CSVs maestros)]
    end

    subgraph C1["Capa 1 - Extract"]
        C1F["extract.py<br/>tables_db_source.py<br/>run_*_utils.py"]
    end

    subgraph C2["Capa 2 - Transform bd_*"]
        C2F["transformations2.py + _operations.py (Evolta)<br/>transformation_sperant.py + _operations.py (Sperant)"]
    end

    subgraph C3["Capa 3 - Orquestador bd_*"]
        C3F["run_evolta.py · run_sperant.py · run_evolta_sperant.py<br/>run_*_transform.py (funciones run_bd_*)"]
    end

    subgraph C4["Capa 4 - Load bd_*"]
        C4F["load2.py<br/>(skip de insert si 0 rows,<br/>pero la tabla ya fue recreada)"]
    end

    subgraph C5["Capa 5 - Dashboard DDL"]
        C5F["dashboard_tables_helper.py<br/>(CREATE/ALTER en dashboard_data)"]
    end

    subgraph C6["Capa 6 - Dashboard Calc"]
        C6F["dashboard_operations.py (comun)<br/>dashboard_operations_evolta.py<br/>dashboard_operations_sperant.py<br/>dashboard_operations_sperant_evolta.py"]
    end

    subgraph C7["Capa 7 - Dashboard Runner"]
        C7F["dashboard_runner.py"]
    end

    subgraph C8["Capa 8 - Historizacion"]
        C8F["crear_tablas_historico_*<br/>(snapshots diarios *_historico)"]
    end

    BQRAW[(BigQuery<br/>bd_* por esquema)]
    BQDASH[(BigQuery<br/>dashboard_data.*)]
    BQHIST[(BigQuery<br/>dashboard_data.*_historico)]

    SP --> C1F
    EV --> C1F
    GCS --> C1F
    C1F --> C2F
    C2F --> C3F
    C3F --> C4F
    C4F --> BQRAW
    BQRAW --> C6F
    C5F --> BQDASH
    C6F --> BQDASH
    C7F -.orquesta.-> C5F
    C7F -.orquesta.-> C6F
    BQDASH --> C8F
    C8F --> BQHIST
```

---

## 3. Flujo de ejecución (`run.py main()`)

Orden controlado por flags en `config.yaml`:

| Flag | Comportamiento |
|---|---|
| `only_run_calculations: False` | Ejecuta pipeline completo (capas 1 a 8) |
| `only_run_calculations: True`  | Salta capas 1 a 4, ejecuta solo capas 5 a 8 |
| `source_1.active: False` | Salta procesamiento Sperant |
| `source_2.active: False` | Salta procesamiento Evolta |
| `joined_sources_N.active: False` | Salta esquema joined N |

**Secuencia completa:**

```mermaid
sequenceDiagram
    participant M as run.py main()
    participant S as Sperant pipeline
    participant E as Evolta pipeline
    participant J as Joined pipeline
    participant D as Dashboard runner
    participant BQ as BigQuery

    Note over M: only_run_calculations = False
    loop por cada esquema en source_1.schemas
        M->>S: run_sperant(spark, esquema, ...)
        S->>BQ: bd_* (checor)
        Note over S: SparkSession nueva por esquema
    end
    loop por cada esquema en source_2.schemas
        M->>E: run_evolta(spark, esquema, ...)
        E->>BQ: bd_* (sev_*)
        Note over E: SparkSession nueva por esquema
    end
    loop por cada joined_sources_N
        M->>J: run_evolta_sperant(spark, esquema, ...)
        J->>BQ: bd_* (sev_9, sev_121, ...)
    end
    M->>D: run_calculus_operations(spark, config)
    D->>BQ: dashboard_data.* (DDL + calc)
    D->>BQ: dashboard_data.*_historico (snapshots)
```

**Aislamiento entre esquemas:** cada esquema crea/destruye su propia `SparkSession` (limpia caché y libera memoria entre corridas con `spark.catalog.clearCache()` + `spark.stop()` + `gc.collect()`).

---

## 4. Tablas `bd_*` generadas (capa 2)

Cada fuente produce el mismo conjunto base de tablas normalizadas. La capa joined las une en una sola por esquema.

```mermaid
graph LR
    subgraph SP[Sperant raw]
        S1[proyectos]
        S2[clientes]
        S3[unidades]
        S4[interacciones]
        S5[pagos]
    end
    subgraph EV[Evolta raw]
        E1[bi_proyecto]
        E2[bi_prospecto]
        E3[bi_unidad]
        E4[bi_interaccion]
        E5[bi_proforma]
    end
    subgraph BD[bd_* normalizado]
        B1[bd_proyectos]
        B2[bd_clientes]
        B3[bd_unidades]
        B4[bd_interacciones]
        B5[bd_proformas]
        B6[bd_procesos]
        B7[bd_usuarios]
        B8[bd_subdivision]
        B9[bd_empresa]
        B10[bd_tipo_interaccion]
    end
    SP --> BD
    EV --> BD
    BD --> JOIN[bd_* joined<br/>evolta + sperant unionByName]
```

| Tabla | Contenido |
|---|---|
| `bd_empresa` | Datos de la empresa propietaria del CRM |
| `bd_grupo_inmobiliario` | Grupo inmobiliario al que pertenece la empresa |
| `bd_proyectos` | Proyectos inmobiliarios |
| `bd_proyecto_extension` | Atributos extra de proyectos |
| `bd_proyectos_mapping` | Mapping códigos proyecto entre Evolta y Sperant |
| `bd_subdivision` | Subdivisiones / etapas / torres por proyecto |
| `bd_unidades` | Unidades inmobiliarias (deptos, casas, lotes) |
| `bd_usuarios` | Asesores / vendedores |
| `bd_clientes` | Clientes / prospectos |
| `bd_clientes_fechas_extension` | Fechas hito por cliente (captación, separación, venta) |
| `bd_tipo_interaccion` | Catálogo tipos de interacción |
| `bd_interacciones` | Interacciones cliente-asesor (visitas, llamadas, citas) |
| `bd_proformas` | Proformas / cotizaciones |
| `bd_procesos` | Procesos comerciales (separación, venta, desistimiento) |
| `bd_metas` | Metas mensuales por proyecto (CSV externo) |
| `bd_team_performance` | Indicadores por equipo / asesor |

> Detalle completo de cada tabla: ver `02_transform_bd/{evolta,sperant,joined}/\<tabla\>.md`.

---

## 5. Tablas dashboard generadas (capa 6)

Esquema destino: `dashboard_data`.

```mermaid
graph TD
    BD[bd_* en BigQuery] --> KPIS[KPIs principales]
    BD --> AGG[Agregaciones cliente]
    BD --> INV[Inventario]
    BD --> DET[Detalles operativos]
    CSV[CSVs maestros GCS] --> MAE[Tablas maestras]

    KPIS --> K1[kpis_embudo_comercial]
    KPIS --> K2[kpis_medio_comercial + _detalle]
    KPIS --> K3[kpis_medio_proforma_comercial]
    KPIS --> K4[kpis_bigdata]
    KPIS --> K5[canal_digital]

    AGG --> A1[cliente_diario_comercial]
    AGG --> A2[cliente_mensual_comercial]
    AGG --> A3[acciones_cliente]

    INV --> I1[stock_comercial]
    INV --> I2[proyecto_data]

    MAE --> M1[metas_kpis]
    MAE --> M2[blacklist_unidades]

    DET --> D1[prospectos_detalle]
    DET --> D2[visitas_detalle]
    DET --> D3[citas_generadas_detalle]
    DET --> D4[citas_concretadas_detalle]
    DET --> D5[separaciones_detalle]
    DET --> D6[ventas_detalle]
    DET --> D7[clientes_vencidos]
    DET --> D8[perfil_cliente]
```

**KPIs principales:**
- `kpis_embudo_comercial` — funnel comercial (prospectos → visitas → separaciones → ventas).
- `kpis_medio_comercial` / `kpis_medio_comercial_detalle` — KPIs por medio de captación / canal.
- `kpis_medio_proforma_comercial` — KPIs proformas por medio.
- `kpis_bigdata` — métricas analíticas BigData.
- `canal_digital` — desempeño por canal digital.

**Agregaciones de cliente:**
- `cliente_diario_comercial` — agregado diario.
- `cliente_mensual_comercial` (+ `_prueba`) — agregado mensual.
- `acciones_cliente` — eventos por cliente.

**Inventario:**
- `stock_comercial` — unidades disponibles (excluye `blacklist_unidades`).
- `proyecto_data` — data agregada por proyecto.

**Maestros (cargados de CSV):**
- `metas_kpis` — metas mensuales (`CONSOLIDADO_METAS.csv`).
- `blacklist_unidades` — unidades excluidas del stock (`CONSOLIDADO_BLACKLIST_UNIDADES.csv`).

**Detalles operativos:** `prospectos_detalle`, `visitas_detalle`, `citas_generadas_detalle`, `citas_concretadas_detalle`, `separaciones_detalle`, `ventas_detalle`, `clientes_vencidos`, `perfil_cliente`.

**Historización:** cada tabla anterior tiene su par `*_historico` con snapshots diarios.

---

## 6. Índice de documentación

```
docs/business_logic/
├── README.md                         <- este archivo
├── glossary.md                       <- terminos negocio (proforma, separacion, etc.)
├── config_reference.md               <- referencia config.yaml + SparkSession
├── 01_extract/
│   ├── jdbc_extraction.md
│   └── source_tables_catalog.md
├── 02_transform_bd/
│   ├── README.md
│   ├── evolta/\<tabla\>.md
│   ├── sperant/\<tabla\>.md
│   └── joined/
│       ├── \<tabla\>.md
│       └── bd_proyectos_mapping.md   <- mapeo Evolta↔Sperant (CSV)
├── 03_load_bd/
│   └── spark_to_bigquery.md
├── 04_dashboard_ddl/
│   └── table_schemas.md
└── 05_dashboard_calc/
    ├── README.md                     <- incluye seccion variantes _prueba
    ├── kpis_embudo.md
    ├── kpis_medio_captacion.md
    ├── kpis_proforma.md
    ├── stock_comercial.md
    ├── perfil_cliente.md
    ├── bigdata.md
    ├── canal_digital.md
    ├── cliente_diario_mensual.md
    ├── clientes_vencidos.md
    ├── proyecto_data.md
    ├── acciones_cliente.md
    ├── metas_y_blacklist.md
    ├── funnel_post_procesamiento.md  <- incluye kpis_embudo_funnel_comercial_metas
    ├── fact_kpis.md                  <- tabla de hechos consolidada (real vs meta)
    ├── visitas_data.md               <- expediente por visita con contexto comercial
    ├── prospectos_data.md            <- ficha completa por cliente/prospecto
    └── detalles/
        ├── README.md
        ├── prospectos.md
        ├── visitas.md
        ├── citas.md
        ├── separaciones.md
        └── ventas.md
```

> **Pendiente:** `06_historization/` — se documentará después.

---

## 7. Convención de cada doc de tabla

Cada `.md` de tabla individual sigue este template:

```markdown
# bd_\<nombre\> — \<fuente\>

## Propósito de negocio
\<qué representa, qué pregunta de negocio responde\>

## Tabla(s) fuente
\<schemas y tablas raw de las que se construye\>

## Reglas de filtro / join
\<filtros WHERE, condiciones JOIN, exclusiones\>

## Columnas calculadas
| Columna | Fórmula | Por qué |
|---|---|---|

## Output schema
\<tipos finales BigQuery\>

## Consumidores downstream
\<qué queries dashboard la usan\>

## Notas / gotchas
\<edge cases, divergencias entre fuentes, bugs históricos\>
```

---

## 8. Cómo mantener esta doc

- **Cada vez que cambie una regla de negocio** (filtro, fórmula, join) → actualizar el `.md` de esa tabla.
- **Cada vez que se agregue una tabla `bd_*` o `dashboard_data.*`** → crear el `.md` correspondiente.
- **Cada vez que se descubra un gotcha** (tipo divergente, columna ausente en una fuente, etc.) → registrarlo en la sección "Notas / gotchas".
- Los `.md` viven cerca del código (`docs/business_logic/`), no en wiki externa, para que el PR que cambia código incluya el doc en el mismo commit.
