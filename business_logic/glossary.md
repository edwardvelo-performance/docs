# Glosario de términos de negocio

Vocabulario común que aparece en código, queries SQL, dashboards y documentación. Pensado para que alguien nuevo (técnico o de negocio) entienda los términos sin tener que leer todo el ETL.

---

## A

### Anulado
Estado de una unidad o proceso que fue **cancelado y no debe ser considerado** en los reportes. En Evolta `bi_stock.anulado = "No"` es el filtro estándar para excluir unidades anuladas.

### Asesor
Sinónimo de **vendedor** o **responsable comercial**. Persona del equipo que atiende clientes, agenda visitas, gestiona separaciones y cierra ventas. En el ETL se modelan en `bd_usuarios`.

---

## B

### `bd_*`
Prefijo que usa el ETL para nombrar las tablas **normalizadas y unificadas** que se cargan a BigQuery. Cada CRM (Evolta, Sperant) tiene sus tablas raw, pero después se transforman a un esquema común con prefijo `bd_*` (`bd_proyectos`, `bd_clientes`, etc.).

### `bi_*`
Prefijo que usa **Evolta** en sus tablas raw (Business Intelligence). Ejemplo: `bi_proyecto`, `bi_prospecto`, `bi_comercial`. No es ETL nuestro — viene del CRM.

### Blacklist (de unidades)
Lista de unidades que negocio quiere **ocultar del stock comercial** aunque estén marcadas como disponibles. Se carga desde `CONSOLIDADO_BLACKLIST_UNIDADES.csv` en GCS. Casos típicos: unidades en disputa legal, problemas constructivos, no comercializables temporalmente.

### Bigdata / LAL (Lookalike)
Campañas específicas de marketing digital que utilizan algoritmos de inteligencia artificial para buscar audiencias similares (lookalikes) a clientes históricos. En el ETL, los leads que provienen de estas campañas (identificados vía `utm_medium` hardcodeados) se filtran y aíslan en la tabla `kpis_bigdata` para evaluar el rendimiento particular de este canal frente al embudo comercial tradicional.

---

## C

### Canal de entrada
**Cómo se contactó** el cliente con la inmobiliaria: visita en sala, llamada telefónica, formulario web, WhatsApp, mail. No confundir con **medio de captación** (que es la fuente del lead).

### Captación
Acto de **registrar a un cliente nuevo** en el CRM. Una captación cuenta cuando se crea el prospecto (o cliente) por primera vez en un mes. Si el mismo lead aparece dos veces el mismo mes, solo cuenta una vez (regla `cliente_unico_mes = 'SI'`).

### Categoría de medio
Agrupación de medios de captación en buckets: **META** (Facebook + Instagram), **WEB**, **PORTALES** (urbania, adondevivir), **TIKTOK**, **MAILING**, **REFERIDO**, **VOLANTEO**, **OTROS**. Los primeros 5 se consideran "digital".

### Cita generada vs cita concretada
- **Cita generada** = el asesor agendó una visita futura con el cliente (`tipo_evento = 'SE CITÓ'`).
- **Cita concretada** = el cliente efectivamente vino al proyecto en una fecha posterior al acuerdo.

Tasa de concretación = concretadas / generadas. KPI clave del equipo comercial.

### Cliente
Persona registrada en el CRM. En el modelo Evolta puede ser:
- **`tipo_origen = 'CLIENTE'`** — alguien que ya tuvo una operación comercial (proforma o más).
- **`tipo_origen = 'PROSPECTO'`** — alguien que solo se registró pero aún no tuvo operación.

En Sperant todos son clasificados como `CLIENTE` (no hay distinción).

### Cliente único del mes
Un cliente solo cuenta una vez por mes en los KPIs, aunque haya tenido múltiples interacciones. Lo controla el campo `cliente_unico_mes = 'SI'` en `bd_clientes`.

### Cliente vencido
Cliente sin interacción reciente (>30, >60, >90 días según umbral) que no está cerrado. Aparece en `dashboard_data.clientes_vencidos` como alerta para reasignación.

### `codcontacto` / `codprospecto` / `codcliente`
Códigos identificadores en Evolta. Distintos roles del mismo o distintas personas:
- `codcontacto` — el contacto base (datos generales).
- `codprospecto` — registro de prospecto con UTMs y medio.
- `codcliente` — datos personales del cliente cuando ya hizo cotización.

Un mismo `codcontacto` puede tener varios `codprospecto` asociados.

### `codoc`
Código de **operación comercial** en Evolta. Una proforma o venta se identifica por su `codoc`. Liga `bi_inmueble_oc` (qué unidad) con `bi_comercial` (qué operación).

### Cohorte
Grupo de clientes captados en el mismo período (típicamente mes). Se usa para análisis de comportamiento: "los clientes captados en enero, ¿cuántos compraron a 90 días?".

---

## D

### Desistido / desistimiento
Cliente que **decidió no comprar** y se da de baja del flujo comercial. Se identifica con `ha_desistido = 'si'` y `razon_desistimiento`. No es lo mismo que un cliente vencido (que solo está inactivo).

### Devolución
Cuando una **venta o separación se cancela**. Se marca con `fecha_devolucion`. Una venta con devolución cuenta como venta bruta pero NO como venta activa.

---

## E

### Embudo comercial (funnel)
Secuencia de etapas del proceso de venta: **CAPTACIÓN → VISITA → CITA → SEPARACIÓN → VENTA**. Cada etapa es un subconjunto de la anterior. La tabla principal del dashboard se llama `kpis_embudo_comercial`.

### Empresa
La inmobiliaria propietaria del CRM. En Sperant siempre es **CHECOR**. En Evolta puede haber varias por esquema (Promotora X, Constructora Y).

### Esquema (sev_*, checor)
División lógica en la base de datos origen. Cada esquema corresponde a **un negocio o cliente** del ETL. Lista típica:
- `checor` — único esquema Sperant.
- `sev_4`, `sev_8`, `sev_10`, ..., `sev_162` — esquemas Evolta puros.
- `sev_9`, `sev_121` — esquemas joined (Evolta + Sperant simultáneo).

### Etapa (Evolta) / Subdivisión (Sperant)
Sinónimos. División interna de un proyecto: **torres, módulos, fases, sectores**. Un proyecto "Condominio Las Flores" puede tener Etapa 1, Etapa 2, Torre A, Torre B.

### Evolta
Uno de los dos CRMs que ingesta el ETL. Postgres en Azure. Se identifica por la convención `bi_*` en sus tablas raw.

---

## F

### `fecha_inicio` / `fecha_fin` (en procesos)
- En proceso de **separación**: `fecha_inicio` = cuándo se separó.
- En proceso de **venta**: `fecha_fin` = cuándo se cerró la venta.

Ambos pueden estar en una misma fila si el proceso pasó de separación a venta.

### Funnel
Forma alternativa de ver `kpis_embudo_comercial` — una fila por etapa en lugar de una columna por etapa. Tabla: `kpis_embudo_funnel_comercial`.

---

## G

### Grupo inmobiliario
Holding que agrupa varias empresas inmobiliarias. Hardcoded en el SQL para algunos proyectos: si `id_proyecto_evolta` es 1620 o 2001 → grupo "VYVE". Si no tiene grupo asignado → "NEW BUSINESS".

---

## H

### Histórico
Tablas con sufijo `_historico` que contienen **snapshots diarios** de las tablas dashboard. Particionadas por `fecha_creacion`. Permiten ver evolución temporal de los KPIs.

---

## I

### Interacción
Cualquier **contacto registrado** entre cliente y asesor: llamada, visita, mensaje, mail. Se modela en `bd_interacciones`. Tipos típicos: VISITA, LLAMADA, MAIL, WHATSAPP, SE CITÓ.

### `id_proyecto_evolta` / `id_proyecto_sperant`
IDs duales para trazabilidad. Cada `bd_*` tiene ambos campos:
- Si la fila viene de Evolta → `id_proyecto_evolta` poblado, `id_proyecto_sperant` = NULL.
- Si viene de Sperant → al revés.
- En joined → puede haber ambos.

Permite saber el origen real de cada fila sin perder los IDs originales.

### `is_visible`
Flag booleano que indica si un proyecto debe **mostrarse en los dashboards**. Regla: `is_visible = TRUE` si el proyecto tiene fila en `metas_kpis` (CSV de metas), FALSE si no. Es la forma de "ocultar" proyectos sin sacarlos del ETL.

---

## J

### Joined
Modalidad de pipeline donde un esquema procesa **datos de Evolta y Sperant simultáneamente**. Aplica a `sev_9` y `sev_121`. Configurado en `joined_sources_*` en `config.yaml`.

> Nota: dentro de `joined_sources_N` la convención es **invertida** respecto al config raíz: `source_1` apunta a Evolta y `source_2` a Sperant. En el config raíz es al revés.

---

## K

### KPI
**Key Performance Indicator**. Métrica clave del negocio. En el ETL los principales son CAPTACIONES, VISITAS, SEPARACIONES, VENTAS. Cada uno se calcula en `dashboard_data.kpis_embudo_comercial`.

---

## L

### Lead
**Captación que viene de un canal digital** (META, WEB, PORTALES, TIKTOK, MAILING). No todos los prospectos son leads — solo los digitales.

### Lead único por mes
Lead que aparece solo una vez en el mes calendario. Si la misma persona se registra dos veces en febrero (por ejemplo, llenando un form en Facebook y otro en Instagram), cuenta solo como **1 lead**. Lo controla `pros.leadunicoxmes`.

---

## M

### Mapping
Tabla auxiliar que **traduce IDs entre fuentes**. Ejemplos:
- `bd_proyectos_mapping` — cruza `id_proyecto_evolta` con `id_proyecto_sperant`.
- `idproyecto_bd_proyecto_mapping` — asigna IDs internos consistentes.

Los mappings vienen en parte de CSVs externos (`CONSOLIDADO_PROYECTOS_EVOLTA_SPERANT.csv`).

### Medio de captación
**De dónde vino el cliente**: Facebook, Google, Instagram, Portal Inmobiliario, Volanteo, Referido, etc. Se categoriza en buckets (META, WEB, PORTALES, TIKTOK, MAILING, REFERIDO, OTROS).

### Meta
Objetivo mensual definido por comercial: cuántas captaciones, cuántas visitas, cuántas ventas espera por proyecto y mes. Se carga desde `CONSOLIDADO_METAS.csv` a `dashboard_data.metas_kpis`.

### `mes_anio`
Formato string `"YYYY-MM"` (ej. `"2026-05"`). Se usa en todas las tablas de KPIs para agrupar por mes. Ordena alfabéticamente igual que cronológicamente.

### Minuta
Documento legal que formaliza la **venta**. Cuando una venta llega a "minuta firmada", el cliente pasa de "Comprador" a "Propietario" en el CRM.

### Modalidad de contrato
Tipo de financiamiento de la venta: **CONTADO**, **HIPOTECARIO**, **MIXTO**, **CRÉDITO DIRECTO**.

---

## N

### NEW BUSINESS
Grupo inmobiliario por defecto cuando un proyecto no tiene grupo asignado en `bd_team_performance`. Hardcoded en el SQL.

### NIF
Estado interno del proceso comercial vinculado a evaluación financiera. Solo se expone en Sperant (`fecha_nif`, `estado_nif`). En Evolta queda NULL.

### Normalizar columna
Función auxiliar `normalizar_columna()` en `general_utils.py`. Aplica a un string:
- Pasa a mayúsculas.
- Saca tildes.
- Reemplaza espacios por algo consistente.
- Trim.

Se usa para hacer joins por nombre cuando los datos vienen de fuentes con tipeos distintos.

### Funciones de normalización — diferencias

El ETL tiene **tres funciones** de normalización en `general_utils.py`. Se usan en contextos distintos:

| Función | Input | Output | Cuándo se usa |
|---|---|---|---|
| `normalizar_columna(col)` | Columna Spark (`F.col`) | STRING upper, sin tildes ni espacios | Joins en transformaciones Spark (proyectos, empresas, asesores) |
| `normalize_str(s)` | String Python | NFKD + strip + upper | Procesamiento fuera de Spark |
| `limpiar_celular(col)` | Columna Spark | Solo dígitos, sin prefijo `51` | Normalizar teléfonos celulares |

Ejemplo de `normalizar_columna`: `"  José María  "` → `"JOSEMARIA"`
Ejemplo de `limpiar_celular`: `"+51 987-654-321"` → `"987654321"`

---

## O

### OC (operación comercial)
En Evolta, sinónimo de **proforma + venta + devolución**. Se identifica con `codoc`.

---

## P

### Pago
Una **letra o cuota** dentro del cronograma de pagos de una venta. Se modela en `bd_pagos` (solo Sperant). Una venta puede tener decenas de pagos (uno por cuota).

### Pipeline
Sinónimo de "flujo del ETL para una fuente". Hay tres pipelines: **Evolta** (`run_evolta`), **Sperant** (`run_sperant`), **Joined** (`run_evolta_sperant`).

### Proceso (comercial)
Cualquier **paso comercial formal** sobre una unidad: separación, venta, anulación, devolución. Se modela en `bd_procesos`. Se distinguen por la columna `nombre`:
- `nombre = 'SEPARACION'` → separación.
- `nombre = 'VENTA'` → venta.

### Proforma
**Cotización formal** que se le entrega al cliente con detalle de precio, áreas, financiamiento. Es el paso intermedio entre interés y separación. Se modela en `bd_proformas`. Identificador: `codigo_proforma`.

### Prospecto
Cliente potencial que **aún no tiene operación comercial cerrada**. En Evolta se distingue del cliente "convertido" via `tipo_origen = 'PROSPECTO'`.

### Proyecto inmobiliario
Edificio, condominio, conjunto residencial. La unidad mínima de oferta. Se modela en `bd_proyectos`. Tiene subdivisiones (torres, etapas) y unidades (departamentos, casas).

---

## R

### Raw
Datos crudos tal como vienen de los CRMs, antes de cualquier transformación. Tablas raw: en Evolta tienen prefijo `bi_*`; en Sperant son `proyectos`, `clientes`, `unidades`, etc.

### Responsable
Sinónimo de **asesor**. La persona del CRM que atiende a un cliente o lleva una operación. Puede haber distintos responsables en distintas etapas (responsable de cita, responsable comercial, etc.).

### Responsable consolidado
Nombre real del asesor (no su username del CRM). Se mapea desde el CSV `RELACION_ASESORES.csv`. Si el username Sperant es `asesor_jr_42`, el `responsable_consolidado` puede ser "Juan Pérez".

---

## S

### Separación
**Reserva de unidad** por parte del cliente. Implica pagar una señal y comprometerse a cerrar la venta. Es el paso entre proforma y venta. En el CRM se registra como un proceso con `nombre = 'SEPARACION'`.

### Separación activa
Separación que **no fue devuelta** (`fecha_devolucion IS NULL`). KPI relevante para inventario.

### Separación digital
Separación cuyo cliente vino por canal digital (META, WEB, PORTALES, TIKTOK, MAILING). Marca el ROI de los canales digitales.

### Sperant
Uno de los dos CRMs que ingesta el ETL. Redshift (Postgres-compatible). Esquema único: `checor`.

### Stock comercial
Inventario de **unidades disponibles** para venta. Excluye separadas, vendidas, en blacklist.

### Sub-estado
Categorización interna del estado de un cliente dentro de un estado mayor. Por ejemplo, dentro de `estado_cliente = 'ACTIVO'` puede haber sub-estados como "EN NEGOCIACIÓN", "PIDE PRORROGA". Solo expuesto en algunos pipelines.

### Subdivisión
Sinónimo de **etapa** o **torre**. División interna de un proyecto.

---

## T

### Team performance
Equipo comercial dentro de un grupo inmobiliario. Se modela en `bd_team_performance`. Hoy hay un solo team por defecto (`Team_1_Evolta`, `Team_1_Sperant`), pero el modelo permite varios.

### TEA
**Tasa Efectiva Anual** del financiamiento. Solo expuesto en `bd_finanzas` (Sperant).

### Tipo de origen (cliente)
- `'CLIENTE'` — alguien con operación comercial (Evolta), o cliente registrado directamente (Sperant).
- `'PROSPECTO'` — solo en Evolta. Lead que se registró pero no tuvo operación.

### Tránsito
Visitas que llegan al proyecto **walk-in** (sin cita previa). Se cuenta como visita pero NO como cita concretada. KPI separado: `TRANSITO`.

---

## U

### UTM
Parámetros de tracking de campañas digitales que vienen en URLs:
- `utm_source` — fuente (facebook, google).
- `utm_medium` — tipo (cpc, organic, email).
- `utm_campaign` — campaña puntual.
- `utm_term` — término de búsqueda.
- `utm_content` — variante del anuncio.

Solo Evolta los expone en `bi_prospecto`.

### Unidad
Inmueble individual: departamento, casa, lote, oficina, local, estacionamiento, depósito. Se modela en `bd_unidades`. Los KPIs filtran por `tipo_unidad IN ('CASA', 'DEPARTAMENTO')` por default.

### Username
Identificador del asesor en Sperant. **Es la PK** (Sperant no usa IDs numéricos para asesores). En Evolta no existe — se usa `idresponsable` numérico.

---

## V

### Venta
Operación cerrada. El cliente firmó minuta y pagó la inicial. Se registra como `bd_procesos` con `nombre = 'VENTA'` y `fecha_fin IS NOT NULL`.

### Venta activa
Venta que **no fue devuelta** (`fecha_devolucion IS NULL`). KPI clave para reportes financieros.

### Visita
Cliente que **vino al proyecto** físicamente. Se modela como `bd_interacciones` con criterios específicos (`tipo_origen = 'INTERACCION_CLIENTE'`, `origen != 'SOLO PROFORMA'`, `visita_unica_mes = 'SI'`).

### Visita única del mes
Una visita por (cliente, proyecto, mes) — re-visitas en el mismo mes no cuentan.

### VYVE
Grupo inmobiliario hardcoded en el SQL para los proyectos con `id_proyecto_evolta IN (1620, 2001)`.

---

## Acrónimos rápidos

| Acrónimo | Qué significa |
|---|---|
| ETL | Extract, Transform, Load |
| CRM | Customer Relationship Management |
| KPI | Key Performance Indicator |
| BQ | BigQuery |
| GCS | Google Cloud Storage |
| OC | Operación comercial (Evolta) |
| TEA | Tasa Efectiva Anual |
| UTM | Urchin Tracking Module (campañas digitales) |
| NIF | Estado de evaluación financiera (Sperant) |
| JDBC | Java Database Connectivity (Spark conecta a las BDs por JDBC) |

---

## Referencias rápidas a campos críticos

| Concepto de negocio | Campo en `bd_*` |
|---|---|
| ¿Tiene meta cargada? | `dashboard_data.metas_kpis` (busqueda por nombre proyecto) |
| ¿Está visible en dashboard? | `is_visible` en KPIs |
| ¿Qué medio fue? | `medio_captacion`, `medio_captacion_categoria` |
| ¿Es venta activa? | `bd_procesos.nombre = 'VENTA'` AND `fecha_devolucion IS NULL` |
| ¿Es separación digital? | medio en (META, WEB, PORTALES, TIKTOK, MAILING) |
| ¿Cliente o prospecto? | `bd_clientes.tipo_origen` |
| ¿Asesor responsable? | `bd_interacciones.nombre_responsable` o `bd_procesos.aprobador_descuento` |
| ¿Cuándo se captó? | `bd_clientes.fecha_registro` o `bd_clientes_fechas_extension.fecha_registro` |
| ¿Cuándo separó? | `bd_procesos.fecha_inicio` (con `nombre = 'SEPARACION'`) |
| ¿Cuándo vendió? | `bd_procesos.fecha_fin` (con `nombre = 'VENTA'`) |
| ¿Cuándo se devolvió? | `bd_procesos.fecha_devolucion` |
