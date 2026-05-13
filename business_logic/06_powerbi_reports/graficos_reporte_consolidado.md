# Graficos de la Pagina Reporte Consolidado

## Proposito

Este archivo documenta como se construyen los visuales de la pagina **Reporte consolidado** del reporte Power BI: tablas calculadas, campos del visual, filtros y lectura de negocio.

---

## Pagina: Reporte consolidado

La pagina consolida la evolucion mensual de los principales KPIs del embudo por canal:

| Bloque | Alcance |
|---|---|
| Embudo total | Todos los medios de captacion |
| Canal digital | Medios digitales |
| Canal tradicional | Medios no digitales |

El primer bloque documentado aqui es la matriz mensual del **Embudo total**.

Filtros principales de la pagina:

| Slicer | Funcion |
|---|---|
| Grupo | Filtra por grupo inmobiliario |
| Team | Filtra por equipo comercial |
| Empresa | Filtra por empresa |
| Proyecto | Filtra por proyecto |
| Año-Mes | Filtra el mes analizado |

---

## Tabla calculada: KPIs_Despivotada

### Objetivo

Convierte las columnas de KPIs de `kpis_medio_embudo_comercial` en filas. Esto permite usar una matriz donde:

```text
Filas    = KPI
Columnas = Año-Mes
Valores  = Valor
```

Sin esta tabla despivotada, Power BI tendria que colocar cada KPI como una medida separada y seria mas dificil controlar el orden de filas.

---

### Formula DAX

```DAX
KPIs_Despivotada =
VAR Base = kpis_medio_embudo_comercial
VAR Raw =
    UNION(
        SELECTCOLUMNS(
            Base,
            "KPI", "Captaciones",
            "Año-Mes", [mes_anio],
            "Valor", [CAPTACIONES],
            "ProjectMonthKey", [ProjectMonthKey],
            "medio_captacion_categoria", [medio_captacion_categoria]
        ),
        SELECTCOLUMNS(
            Base,
            "KPI", "Visitas",
            "Año-Mes", [mes_anio],
            "Valor", [VISITAS],
            "ProjectMonthKey", [ProjectMonthKey],
            "medio_captacion_categoria", [medio_captacion_categoria]
        ),
        SELECTCOLUMNS(
            Base,
            "KPI", "Separaciones totales",
            "Año-Mes", [mes_anio],
            "Valor", [SEPARACIONES],
            "ProjectMonthKey", [ProjectMonthKey],
            "medio_captacion_categoria", [medio_captacion_categoria]
        ),
        SELECTCOLUMNS(
            Base,
            "KPI", "Ventas totales",
            "Año-Mes", [mes_anio],
            "Valor", [VENTAS],
            "ProjectMonthKey", [ProjectMonthKey],
            "medio_captacion_categoria", [medio_captacion_categoria]
        )
    )
RETURN
ADDCOLUMNS(
    Raw,
    "KPIOrder", LOOKUPVALUE(KPI_Order[KPIOrder], KPI_Order[KPI], [KPI])
)
```

---

### Resultado de la transformacion

Cada fila de `kpis_medio_embudo_comercial` se expande en cuatro filas:

| KPI generado | Campo origen |
|---|---|
| `Captaciones` | `kpis_medio_embudo_comercial[CAPTACIONES]` |
| `Visitas` | `kpis_medio_embudo_comercial[VISITAS]` |
| `Separaciones totales` | `kpis_medio_embudo_comercial[SEPARACIONES]` |
| `Ventas totales` | `kpis_medio_embudo_comercial[VENTAS]` |

Tambien conserva:

| Campo conservado | Uso |
|---|---|
| `Año-Mes` | Columna de la matriz |
| `ProjectMonthKey` | Relacion con dimensiones de proyecto/mes |
| `medio_captacion_categoria` | Permite filtrar por canal/medio |
| `KPIOrder` | Ordena las filas de KPI |

---

## Visual 1: Matriz - Embudo total

### Objetivo

Muestra la evolucion mensual de los KPIs principales del embudo total:

```text
Captaciones
Visitas
Separaciones totales
Ventas totales
```

Lectura de negocio:

```text
Cada fila es un KPI del embudo.
Cada columna es un mes.
El valor muestra el volumen mensual del KPI.
```

---

### Configuracion del visual

Tipo de visual:

```text
Matriz
```

Campos:

| Bucket | Campo |
|---|---|
| Filas | `KPIs_Despivotada[KPI]` |
| Columnas | `KPIs_Despivotada[Año-Mes]` |
| Valores | `SUM(KPIs_Despivotada[Valor])` |

Orden recomendado:

```text
KPIs_Despivotada[KPI] ordenar por KPIs_Despivotada[KPIOrder]
```

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `KPI` | no es `Separaciones netas` ni otros KPIs fuera del embudo total |
| `Año-Mes` | todos |
| `SUM(Valor)` | todos |
| `EsUltimo12Meses` | `1` |

El filtro clave es:

```text
EsUltimo12Meses = 1
```

Con esto la matriz muestra solo la ventana reciente de 12 meses.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `KPIs_Despivotada` | Tabla base del visual: KPI, Año-Mes y Valor |
| `kpis_medio_embudo_comercial` | Tabla origen desde donde se despivotan los KPIs |
| `KPI_Order` | Define el orden de aparicion de los KPIs |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla contexto de meses y calculos de ultimos 12 meses |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> KPIs_Despivotada[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar una celda:

```text
Valor =
SUM(KPIs_Despivotada[Valor])
filtrado por KPI y Año-Mes
```

Ejemplo conceptual:

```text
KPI = Captaciones
Año-Mes = 2026-05

Valor = SUM(CAPTACIONES del mes 2026-05)
```

Para validar contra la tabla origen:

| KPI en matriz | Validacion en origen |
|---|---|
| `Captaciones` | `SUM(kpis_medio_embudo_comercial[CAPTACIONES])` |
| `Visitas` | `SUM(kpis_medio_embudo_comercial[VISITAS])` |
| `Separaciones totales` | `SUM(kpis_medio_embudo_comercial[SEPARACIONES])` |
| `Ventas totales` | `SUM(kpis_medio_embudo_comercial[VENTAS])` |

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| KPI aparece desordenado | `KPIOrder` o relacion con `KPI_Order` |
| Meses fuera de rango | Filtro `EsUltimo12Meses = 1` |
| Total duplicado | Relacion con `DimProyectoMes` o granularidad de `kpis_medio_embudo_comercial` |
| Slicer no filtra | `ProjectMonthKey` en `KPIs_Despivotada` |
| Medio/canal inesperado | Filtro sobre `medio_captacion_categoria` |

---

### Resumen

```text
Visual: Embudo total
Tipo: Matriz
Filas: KPI
Columnas: Año-Mes
Valores: SUM(Valor)
Tabla: KPIs_Despivotada
Origen: kpis_medio_embudo_comercial
Filtro visual clave: EsUltimo12Meses = 1
Pagina: Reporte consolidado
```

---

## Visuales 2-4: Indicadores de conversion - Embudo total

### Objetivo

Muestran ratios consolidados de conversion del embudo total. Cada indicador resume una etapa clave:

| Indicador | Lectura |
|---|---|
| `Visitas/Captaciones` | Que porcentaje de captaciones llega a visita |
| `Separaciones/Visitas` | Que porcentaje de visitas termina en separacion |
| `Ventas/Separaciones` | Que porcentaje de separaciones termina en venta |

Estos indicadores usan la tabla `fact_kpis` y responden a los slicers de la pagina: grupo, team, empresa, proyecto y año-mes.

---

### Visual 2: Indicador - Visitas/Captaciones

Tipo de visual:

```text
Tarjeta / Card
```

Campo:

| Bucket | Campo |
|---|---|
| Campos | `RatioVisitas` |

Medida DAX:

```DAX
RatioVisitas =
DIVIDE(
    SUM(fact_kpis[real_visitas]),
    SUM(fact_kpis[real_captaciones]),
    0
)
```

Interpretacion:

```text
Visitas/Captaciones = visitas reales / captaciones reales
```

---

### Visual 3: Indicador - Separaciones/Visitas

Tipo de visual:

```text
Tarjeta / Card
```

Campo:

| Bucket | Campo |
|---|---|
| Campos | `Ratio separaciones` |

Medida DAX:

```DAX
Ratio separaciones =
DIVIDE(
    SUM(fact_kpis[real_separaciones]),
    SUM(fact_kpis[real_visitas]),
    0
)
```

Interpretacion:

```text
Separaciones/Visitas = separaciones reales / visitas reales
```

---

### Visual 4: Indicador - Ventas/Separaciones

Tipo de visual:

```text
Tarjeta / Card
```

Campo:

| Bucket | Campo |
|---|---|
| Campos | `Ratio ventas` |

Medida DAX:

```DAX
Ratio ventas =
DIVIDE(
    SUM(fact_kpis[real_ventas]),
    SUM(fact_kpis[real_separaciones]),
    0
)
```

Interpretacion:

```text
Ventas/Separaciones = ventas reales / separaciones reales
```

---

### Filtros de los indicadores

Cada tarjeta mantiene el contexto de la pagina y no aplica filtros restrictivos adicionales sobre la medida.

| Indicador | Filtro del objeto visual |
|---|---|
| `Visitas/Captaciones` | todos |
| `Separaciones/Visitas` | todos |
| `Ventas/Separaciones` | todos |

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `fact_kpis` | Aporta los valores reales: captaciones, visitas, separaciones y ventas |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> fact_kpis[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

```text
Visitas/Captaciones   = SUM(real_visitas) / SUM(real_captaciones)
Separaciones/Visitas  = SUM(real_separaciones) / SUM(real_visitas)
Ventas/Separaciones   = SUM(real_ventas) / SUM(real_separaciones)
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Indicador aparece en 0 | Denominador en cero; `DIVIDE(..., 0)` devuelve 0 |
| Valor no coincide con la matriz | La matriz usa `KPIs_Despivotada`; el indicador usa `fact_kpis` |
| Slicer no filtra | Relacion por `ProjectMonthKey` con `DimProyectoMes` |
| Mes incorrecto | Relacion con `CalendarioMes` |

---

### Resumen

```text
Visuales: Indicadores de conversion - Embudo total
Tipo: Tarjetas / Cards
Indicadores:
  - RatioVisitas = SUM(real_visitas) / SUM(real_captaciones)
  - Ratio separaciones = SUM(real_separaciones) / SUM(real_visitas)
  - Ratio ventas = SUM(real_ventas) / SUM(real_separaciones)
Tabla: fact_kpis
Pagina: Reporte consolidado
```

---

## Visual 5: Matriz - Canal digital

### Objetivo

Muestra la evolucion mensual de los KPIs principales del embudo, filtrados solo a medios digitales.

El bloque corresponde al texto de pagina:

```text
Canal digital: Incluye Meta, Web, LinkedIn, TikTok, Portales, Mailing, WhatsApp, Mantra
```

Lectura de negocio:

```text
Cada fila es un KPI del embudo digital.
Cada columna es un mes.
El valor muestra el volumen mensual del KPI solo para medios digitales.
```

---

### Configuracion del visual

Tipo de visual:

```text
Matriz
```

Campos:

| Bucket | Campo |
|---|---|
| Filas | `KPIs_Despivotada[KPI]` |
| Columnas | `KPIs_Despivotada[Año-Mes]` |
| Valores | `SUM(KPIs_Despivotada[Valor])` |

Orden recomendado:

```text
KPIs_Despivotada[KPI] ordenar por KPIs_Despivotada[KPIOrder]
```

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `KPI` | no es `Separaciones netas` ni `Ventas netas` |
| `Año-Mes` | todos |
| `SUM(Valor)` | todos |
| `medio_captacion_categoria` | medios digitales |
| `EsUltimo12Meses` | `1` |

Filtro de medios digitales:

```text
medio_captacion_categoria IN (
  META,
  WEB,
  LINKEDIN,
  TIKTOK,
  PORTALES,
  MAILING,
  WHATSAPP,
  MANTRA,
  ...
)
```

El filtro `EsUltimo12Meses = 1` mantiene la matriz en la ventana reciente de 12 meses.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `KPIs_Despivotada` | Tabla base del visual: KPI, Año-Mes, Valor y medio |
| `kpis_medio_embudo_comercial` | Tabla origen desde donde se despivotan los KPIs |
| `KPI_Order` | Define el orden de aparicion de los KPIs |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla contexto de meses y ultimos 12 meses |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> KPIs_Despivotada[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar una celda:

```text
Valor digital =
SUM(KPIs_Despivotada[Valor])
filtrado por KPI, Año-Mes y medios digitales
```

Validacion contra origen:

| KPI en matriz | Validacion en origen |
|---|---|
| `Captaciones` | `SUM(CAPTACIONES)` filtrado por medios digitales |
| `Visitas` | `SUM(VISITAS)` filtrado por medios digitales |
| `Separaciones totales` | `SUM(SEPARACIONES)` filtrado por medios digitales |
| `Ventas totales` | `SUM(VENTAS)` filtrado por medios digitales |

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Total digital no coincide | Lista de `medio_captacion_categoria` incluida en el filtro |
| KPI aparece desordenado | `KPIOrder` |
| Meses fuera de rango | `EsUltimo12Meses = 1` |
| Slicer no filtra | Relacion por `ProjectMonthKey` |
| Valores duplicados | Granularidad de `kpis_medio_embudo_comercial` |

---

### Resumen

```text
Visual: Canal digital
Tipo: Matriz
Filas: KPI
Columnas: Año-Mes
Valores: SUM(Valor)
Tabla: KPIs_Despivotada
Filtro clave: medio_captacion_categoria en medios digitales
Filtro temporal: EsUltimo12Meses = 1
Pagina: Reporte consolidado
```

---

## Visuales 6-8: Indicadores de conversion - Canal digital

### Objetivo

Muestran ratios de conversion del embudo filtrado solo a medios digitales. Estos indicadores acompañan la matriz de **Canal digital**.

| Indicador | Lectura |
|---|---|
| `Visitas/Captaciones` | Que porcentaje de captaciones digitales llega a visita |
| `Separaciones/Visitas` | Que porcentaje de visitas digitales termina en separacion |
| `Ventas/Separaciones` | Que porcentaje de separaciones digitales termina en venta |

Estos indicadores usan la tabla `kpis_medio_embudo_comercial` y tienen filtro visual sobre `medio_captacion_categoria`.

---

### Filtro comun de canal digital

Los tres indicadores aplican un filtro de medios digitales:

```text
medio_captacion_categoria IN (
  LINKEDIN,
  MAILING,
  MANTRA,
  META,
  PORTALES,
  TIKTOK,
  WEB,
  WHATSAPP,
  ...
)
```

El listado exacto debe mantenerse alineado con la definicion de `canal_captacion_categoria = "DIGITAL"`.

---

### Visual 6: Indicador - Visitas/Captaciones digital

Tipo de visual:

```text
Tarjeta / Card
```

Campo:

| Bucket | Campo |
|---|---|
| Campos | `Visitas/Captaciones` |

Medida DAX:

```DAX
Visitas/Captaciones =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[VISITAS]),
    SUM(kpis_medio_embudo_comercial[CAPTACIONES]),
    0
)
```

Interpretacion:

```text
Visitas/Captaciones digital = visitas digitales / captaciones digitales
```

---

### Visual 7: Indicador - Separaciones/Visitas digital

Tipo de visual:

```text
Tarjeta / Card
```

Campo:

| Bucket | Campo |
|---|---|
| Campos | `Separaciones/Visitas` |

Medida DAX:

```DAX
Separaciones/Visitas =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[SEPARACIONES]),
    SUM(kpis_medio_embudo_comercial[VISITAS]),
    0
)
```

Interpretacion:

```text
Separaciones/Visitas digital = separaciones digitales / visitas digitales
```

---

### Visual 8: Indicador - Ventas/Separaciones digital

Tipo de visual:

```text
Tarjeta / Card
```

Campo:

| Bucket | Campo |
|---|---|
| Campos | `Ventas/Separaciones` |

Medida DAX:

```DAX
Ventas/Separaciones =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[VENTAS]),
    SUM(kpis_medio_embudo_comercial[SEPARACIONES]),
    0
)
```

Interpretacion:

```text
Ventas/Separaciones digital = ventas digitales / separaciones digitales
```

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta KPIs por medio de captacion |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

```text
Visitas/Captaciones   = SUM(VISITAS) / SUM(CAPTACIONES)
Separaciones/Visitas  = SUM(SEPARACIONES) / SUM(VISITAS)
Ventas/Separaciones   = SUM(VENTAS) / SUM(SEPARACIONES)
```

Todas las validaciones deben aplicarse con el mismo filtro de medios digitales.

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Indicador aparece en 0 | Denominador en cero; `DIVIDE(..., 0)` devuelve 0 |
| Valor no coincide con matriz digital | Filtro de `medio_captacion_categoria` distinto |
| Medio digital faltante | Lista de medios del filtro vs `canal_captacion_categoria` |
| Slicer no filtra | Relacion por `ProjectMonthKey` |

---

### Resumen

```text
Visuales: Indicadores de conversion - Canal digital
Tipo: Tarjetas / Cards
Indicadores:
  - Visitas/Captaciones = SUM(VISITAS) / SUM(CAPTACIONES)
  - Separaciones/Visitas = SUM(SEPARACIONES) / SUM(VISITAS)
  - Ventas/Separaciones = SUM(VENTAS) / SUM(SEPARACIONES)
Tabla: kpis_medio_embudo_comercial
Filtro clave: medio_captacion_categoria en medios digitales
Pagina: Reporte consolidado
```

---

## Visual 9: Matriz - Canal tradicional

### Objetivo

Muestra la evolucion mensual de los KPIs principales del embudo, filtrados solo a medios tradicionales.

El bloque corresponde al texto de pagina:

```text
Canal tradicional: Todos los demas medios de captacion.
```

Lectura de negocio:

```text
Es la misma matriz del canal digital, pero excluyendo los medios clasificados como digitales.
```

---

### Configuracion del visual

Tipo de visual:

```text
Matriz
```

Campos:

| Bucket | Campo |
|---|---|
| Filas | `KPIs_Despivotada[KPI]` |
| Columnas | `KPIs_Despivotada[Año-Mes]` |
| Valores | `SUM(KPIs_Despivotada[Valor])` |

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `KPI` | no es `Separaciones netas` ni `Ventas netas` |
| `Año-Mes` | todos |
| `SUM(Valor)` | todos |
| `medio_captacion_categoria` | no es medios digitales |
| `EsUltimo12Meses` | `1` |

Filtro de canal tradicional:

```text
medio_captacion_categoria NOT IN (
  MANTRA,
  META,
  TIKTOK,
  WEB,
  LINKEDIN,
  PORTALES,
  MAILING,
  WHATSAPP,
  ...
)
```

En la practica, este bloque representa el complemento del canal digital: todo medio que no entra en la lista digital queda dentro de tradicional.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `KPIs_Despivotada` | Tabla base del visual: KPI, Año-Mes, Valor y medio |
| `kpis_medio_embudo_comercial` | Tabla origen desde donde se despivotan los KPIs |
| `KPI_Order` | Define el orden de aparicion de los KPIs |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla contexto de meses y ultimos 12 meses |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> KPIs_Despivotada[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar una celda:

```text
Valor tradicional =
SUM(KPIs_Despivotada[Valor])
filtrado por KPI, Año-Mes y medios no digitales
```

Validacion contra origen:

| KPI en matriz | Validacion en origen |
|---|---|
| `Captaciones` | `SUM(CAPTACIONES)` filtrado por medios no digitales |
| `Visitas` | `SUM(VISITAS)` filtrado por medios no digitales |
| `Separaciones totales` | `SUM(SEPARACIONES)` filtrado por medios no digitales |
| `Ventas totales` | `SUM(VENTAS)` filtrado por medios no digitales |

---

### Resumen

```text
Visual: Canal tradicional
Tipo: Matriz
Filas: KPI
Columnas: Año-Mes
Valores: SUM(Valor)
Tabla: KPIs_Despivotada
Filtro clave: medio_captacion_categoria no esta en medios digitales
Filtro temporal: EsUltimo12Meses = 1
Pagina: Reporte consolidado
```

---

## Visuales 10-12: Indicadores de conversion - Canal tradicional

### Objetivo

Muestran los mismos ratios del canal digital, pero filtrados al canal tradicional. No cambian las formulas: cambia solamente el contexto del visual por el filtro de `medio_captacion_categoria`.

| Indicador | Lectura |
|---|---|
| `Visitas/Captaciones` | Que porcentaje de captaciones tradicionales llega a visita |
| `Separaciones/Visitas` | Que porcentaje de visitas tradicionales termina en separacion |
| `Ventas/Separaciones` | Que porcentaje de separaciones tradicionales termina en venta |

---

### Filtro comun de canal tradicional

Los tres indicadores aplican el complemento del filtro digital:

```text
medio_captacion_categoria NOT IN (
  MANTRA,
  META,
  TIKTOK,
  WEB,
  LINKEDIN,
  PORTALES,
  MAILING,
  WHATSAPP,
  ...
)
```

Por eso, si se actualiza la lista de medios digitales, tambien se debe actualizar este filtro para que ambos bloques sigan siendo complementarios.

---

### Indicador - Visitas/Captaciones tradicional

Medida DAX:

```DAX
Visitas/Captaciones =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[VISITAS]),
    SUM(kpis_medio_embudo_comercial[CAPTACIONES]),
    0
)
```

Interpretacion:

```text
Visitas/Captaciones tradicional = visitas tradicionales / captaciones tradicionales
```

---

### Indicador - Separaciones/Visitas tradicional

Medida DAX:

```DAX
Separaciones/Visitas =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[SEPARACIONES]),
    SUM(kpis_medio_embudo_comercial[VISITAS]),
    0
)
```

Interpretacion:

```text
Separaciones/Visitas tradicional = separaciones tradicionales / visitas tradicionales
```

---

### Indicador - Ventas/Separaciones tradicional

Medida DAX:

```DAX
Ventas/Separaciones =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[VENTAS]),
    SUM(kpis_medio_embudo_comercial[SEPARACIONES]),
    0
)
```

Interpretacion:

```text
Ventas/Separaciones tradicional = ventas tradicionales / separaciones tradicionales
```

---

### Validacion rapida

```text
Visitas/Captaciones   = SUM(VISITAS) / SUM(CAPTACIONES)
Separaciones/Visitas  = SUM(SEPARACIONES) / SUM(VISITAS)
Ventas/Separaciones   = SUM(VENTAS) / SUM(SEPARACIONES)
```

Todas las validaciones deben aplicarse con el filtro de medios no digitales.

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Valor no coincide con matriz tradicional | Filtro de `medio_captacion_categoria` distinto |
| Medio tradicional faltante | Lista de exclusion de medios digitales |
| Indicador aparece en 0 | Denominador en cero; `DIVIDE(..., 0)` devuelve 0 |
| Slicer no filtra | Relacion por `ProjectMonthKey` |

---

### Resumen

```text
Visuales: Indicadores de conversion - Canal tradicional
Tipo: Tarjetas / Cards
Indicadores:
  - Visitas/Captaciones = SUM(VISITAS) / SUM(CAPTACIONES)
  - Separaciones/Visitas = SUM(SEPARACIONES) / SUM(VISITAS)
  - Ventas/Separaciones = SUM(VENTAS) / SUM(SEPARACIONES)
Tabla: kpis_medio_embudo_comercial
Filtro clave: medio_captacion_categoria no esta en medios digitales
Pagina: Reporte consolidado
```
