# Graficos de la Pagina Pie de Medios

## Proposito

Este archivo documenta como se construyen los visuales de la pagina **Pie de medios** del reporte Power BI: medidas, columnas calculadas, tablas usadas, campos del visual, filtros y lectura de negocio.

---

## Pagina: Pie de medios

La pagina resume la distribucion del embudo por canal de captacion. Agrupa los medios detallados en canales de negocio como `DIGITAL`, `TRADICIONAL`, `CORREDOR` y `FERIAS`.

Filtros principales de la pagina:

| Slicer | Funcion |
|---|---|
| Grupo | Filtra por grupo inmobiliario |
| Team | Filtra por equipo comercial |
| Empresa | Filtra por empresa |
| Proyecto | Filtra por proyecto |
| Año-Mes | Filtra el mes analizado |

---

## Columna calculada: canal_captacion_categoria

### Objetivo

Agrupa `medio_captacion_categoria` en una categoria superior de canal. Esta columna se usa como leyenda de los graficos tipo dona de la pagina.

### Formula DAX

```DAX
canal_captacion_categoria =
SWITCH(
    TRUE(),
    'kpis_medio_embudo_comercial'[medio_captacion_categoria] IN
        {
            "META",
            "WEB",
            "LINKEDIN",
            "TIKTOK",
            "PORTALES",
            "MAILING",
            "WHATSAPP",
            "MANTRA",
            "OTROS PORTALES",
            "NEXO",
            "BASE DE DATOS",
            "FACEBOOK LANZAMIENTO CASTILLA PARK",
            "WHATSAPP PLUGINS"
        },
        "DIGITAL",

    'kpis_medio_embudo_comercial'[medio_captacion_categoria] = "CORREDOR",
        "CORREDOR",

    'kpis_medio_embudo_comercial'[medio_captacion_categoria] = "FERIA",
        "FERIAS",

    "TRADICIONAL"
)
```

### Regla de clasificacion

| Resultado | Regla |
|---|---|
| `DIGITAL` | Medios digitales: Meta, Web, Portales, TikTok, Mailing, WhatsApp, Mantra, Nexo, Base de datos, etc. |
| `CORREDOR` | Cuando `medio_captacion_categoria = "CORREDOR"` |
| `FERIAS` | Cuando `medio_captacion_categoria = "FERIA"` |
| `TRADICIONAL` | Cualquier medio que no caiga en las reglas anteriores |

> Importante: todo medio nuevo que no este listado como digital y que no sea `CORREDOR` o `FERIA` caera automaticamente como `TRADICIONAL`.

---

## Visual 1: Dona - Captaciones por canal

### Objetivo

Muestra como se distribuyen las captaciones del mes entre canales de captacion. Sirve para identificar que porcentaje del volumen de captaciones viene de canales digitales, tradicionales, corredores o ferias.

Lectura de negocio:

```text
Cada segmento representa un canal.
El tamaño del segmento indica que proporcion de captaciones aporta ese canal.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de dona
```

Campos:

| Bucket | Campo |
|---|---|
| Leyenda | `kpis_medio_embudo_comercial[canal_captacion_categoria]` |
| Valores | `SUM(kpis_medio_embudo_comercial[CAPTACIONES])` |
| Detalles | vacio |
| Informacion sobre herramientas | vacio |

---

### Medida / agregacion

El valor de cada segmento es:

```DAX
Suma de CAPTACIONES =
SUM(kpis_medio_embudo_comercial[CAPTACIONES])
```

Power BI lo muestra como agregacion implicita porque se usa directamente la columna numerica `CAPTACIONES` en el visual.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `canal_captacion_categoria` | todos |
| `SUM(CAPTACIONES)` | mayor o igual que `1` |

El filtro `SUM(CAPTACIONES) >= 1` evita mostrar canales sin captaciones en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta `medio_captacion_categoria`, `canal_captacion_categoria` y `CAPTACIONES` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el grafico:

```text
Captaciones por canal =
SUM(CAPTACIONES)
agrupado por canal_captacion_categoria
```

El porcentaje de cada canal se calcula sobre el total visible del visual:

```text
% canal = SUM(CAPTACIONES del canal) / SUM(CAPTACIONES total)
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Canal no aparece | `SUM(CAPTACIONES)` es menor que `1` |
| Medio clasificado en canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con otros visuales | Diferencia entre `kpis_medio_embudo_comercial` y `fact_kpis` |
| Slicers no filtran | Relacion por `ProjectMonthKey` con `DimProyectoMes` |

---

### Resumen

```text
Visual: Captaciones por canal
Tipo: Grafico de dona
Leyenda: canal_captacion_categoria
Valores: SUM(CAPTACIONES)
Tabla: kpis_medio_embudo_comercial
Filtro visual: SUM(CAPTACIONES) >= 1
Pagina: Pie de medios
```

---

## Visual 2: Dona - Visitas por canal

### Objetivo

Muestra como se distribuyen las visitas del mes entre canales de captacion. Sirve para identificar que porcentaje del volumen de visitas viene de canales digitales, tradicionales, corredores o ferias.

Lectura de negocio:

```text
Cada segmento representa un canal.
El tamaño del segmento indica que proporcion de visitas aporta ese canal.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de dona
```

Campos:

| Bucket | Campo |
|---|---|
| Leyenda | `kpis_medio_embudo_comercial[canal_captacion_categoria]` |
| Valores | `SUM(kpis_medio_embudo_comercial[VISITAS])` |
| Detalles | vacio |
| Informacion sobre herramientas | vacio |

---

### Medida / agregacion

El valor de cada segmento es:

```DAX
Suma de VISITAS =
SUM(kpis_medio_embudo_comercial[VISITAS])
```

Power BI lo muestra como agregacion implicita porque se usa directamente la columna numerica `VISITAS` en el visual.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `canal_captacion_categoria` | todos |
| `SUM(VISITAS)` | mayor o igual que `1` |

El filtro `SUM(VISITAS) >= 1` evita mostrar canales sin visitas en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta `medio_captacion_categoria`, `canal_captacion_categoria` y `VISITAS` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el grafico:

```text
Visitas por canal =
SUM(VISITAS)
agrupado por canal_captacion_categoria
```

El porcentaje de cada canal se calcula sobre el total visible del visual:

```text
% canal = SUM(VISITAS del canal) / SUM(VISITAS total)
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Canal no aparece | `SUM(VISITAS)` es menor que `1` |
| Medio clasificado en canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con otros visuales | Diferencia entre `kpis_medio_embudo_comercial` y `fact_kpis` |
| Slicers no filtran | Relacion por `ProjectMonthKey` con `DimProyectoMes` |

---

### Resumen

```text
Visual: Visitas por canal
Tipo: Grafico de dona
Leyenda: canal_captacion_categoria
Valores: SUM(VISITAS)
Tabla: kpis_medio_embudo_comercial
Filtro visual: SUM(VISITAS) >= 1
Pagina: Pie de medios
```

---

## Visual 3: Dona - Separaciones brutas por canal

### Objetivo

Muestra como se distribuyen las separaciones brutas del mes entre canales de captacion. Sirve para identificar que porcentaje del volumen de separaciones viene de canales digitales, tradicionales, corredores o ferias.

Lectura de negocio:

```text
Cada segmento representa un canal.
El tamaño del segmento indica que proporcion de separaciones aporta ese canal.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de dona
```

Campos:

| Bucket | Campo |
|---|---|
| Leyenda | `kpis_medio_embudo_comercial[canal_captacion_categoria]` |
| Valores | `SUM(kpis_medio_embudo_comercial[SEPARACIONES])` |
| Detalles | vacio |
| Informacion sobre herramientas | vacio |

---

### Medida / agregacion

El valor de cada segmento es:

```DAX
Suma de SEPARACIONES =
SUM(kpis_medio_embudo_comercial[SEPARACIONES])
```

Power BI lo muestra como agregacion implicita porque se usa directamente la columna numerica `SEPARACIONES` en el visual.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `canal_captacion_categoria` | todos |
| `SUM(SEPARACIONES)` | mayor o igual que `1` |

El filtro `SUM(SEPARACIONES) >= 1` evita mostrar canales sin separaciones en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta `medio_captacion_categoria`, `canal_captacion_categoria` y `SEPARACIONES` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el grafico:

```text
Separaciones por canal =
SUM(SEPARACIONES)
agrupado por canal_captacion_categoria
```

El porcentaje de cada canal se calcula sobre el total visible del visual:

```text
% canal = SUM(SEPARACIONES del canal) / SUM(SEPARACIONES total)
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Canal no aparece | `SUM(SEPARACIONES)` es menor que `1` |
| Medio clasificado en canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con otros visuales | Diferencia entre `kpis_medio_embudo_comercial` y `fact_kpis` |
| Slicers no filtran | Relacion por `ProjectMonthKey` con `DimProyectoMes` |

---

### Resumen

```text
Visual: Separaciones brutas por canal
Tipo: Grafico de dona
Leyenda: canal_captacion_categoria
Valores: SUM(SEPARACIONES)
Tabla: kpis_medio_embudo_comercial
Filtro visual: SUM(SEPARACIONES) >= 1
Pagina: Pie de medios
```

---

## Visual 4: Dona - Ventas brutas por canal

### Objetivo

Muestra como se distribuyen las ventas brutas del mes entre canales de captacion. Sirve para identificar que porcentaje del volumen de ventas viene de canales digitales, tradicionales, corredores o ferias.

Lectura de negocio:

```text
Cada segmento representa un canal.
El tamaño del segmento indica que proporcion de ventas aporta ese canal.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de dona
```

Campos:

| Bucket | Campo |
|---|---|
| Leyenda | `kpis_medio_embudo_comercial[canal_captacion_categoria]` |
| Valores | `SUM(kpis_medio_embudo_comercial[VENTAS])` |
| Detalles | vacio |
| Informacion sobre herramientas | vacio |

---

### Medida / agregacion

El valor de cada segmento es:

```DAX
Suma de VENTAS =
SUM(kpis_medio_embudo_comercial[VENTAS])
```

Power BI lo muestra como agregacion implicita porque se usa directamente la columna numerica `VENTAS` en el visual.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `canal_captacion_categoria` | todos |
| `SUM(VENTAS)` | mayor o igual que `1` |

El filtro `SUM(VENTAS) >= 1` evita mostrar canales sin ventas en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta `medio_captacion_categoria`, `canal_captacion_categoria` y `VENTAS` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el grafico:

```text
Ventas por canal =
SUM(VENTAS)
agrupado por canal_captacion_categoria
```

El porcentaje de cada canal se calcula sobre el total visible del visual:

```text
% canal = SUM(VENTAS del canal) / SUM(VENTAS total)
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Canal no aparece | `SUM(VENTAS)` es menor que `1` |
| Medio clasificado en canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con otros visuales | Diferencia entre `kpis_medio_embudo_comercial` y `fact_kpis` |
| Slicers no filtran | Relacion por `ProjectMonthKey` con `DimProyectoMes` |

---

### Resumen

```text
Visual: Ventas brutas por canal
Tipo: Grafico de dona
Leyenda: canal_captacion_categoria
Valores: SUM(VENTAS)
Tabla: kpis_medio_embudo_comercial
Filtro visual: SUM(VENTAS) >= 1
Pagina: Pie de medios
```

---

## Visual 5: Matriz - Desglose de medios de captaciones

### Objetivo

Muestra el detalle de captaciones por canal y medio de captacion. Permite abrir cada canal para ver que medios especificos explican el total de captaciones.

Lectura de negocio:

```text
Primero se ve el total por canal.
Al expandir el canal, se ve el aporte de cada medio.
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
| Filas | `kpis_medio_embudo_comercial[canal_captacion_categoria]` renombrado como `Canal de captacion` |
| Filas | `kpis_medio_embudo_comercial[medio_captacion_categoria]` renombrado como `Medio de captacion` |
| Columnas | vacio |
| Valores | `Captaciones` |
| Valores | `%` |

La jerarquia de filas permite ver:

```text
Canal de captacion
  -> Medio de captacion
```

---

### Medida Captaciones

La columna `Captaciones` corresponde a:

```DAX
Captaciones =
SUM(kpis_medio_embudo_comercial[CAPTACIONES])
```

Representa el total de captaciones del canal o medio dentro del contexto filtrado.

---

### Medida %

La columna `%` representa la participacion del canal o medio sobre el total visible de captaciones.

Conceptualmente:

```DAX
% Captaciones =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[CAPTACIONES]),
    CALCULATE(
        SUM(kpis_medio_embudo_comercial[CAPTACIONES]),
        ALLSELECTED(kpis_medio_embudo_comercial)
    )
)
```

En la matriz, este porcentaje permite comparar el peso relativo de cada canal y cada medio dentro del total filtrado por la pagina.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `%` | todos |
| `Canal de captacion` | todos |
| `Captaciones` | mayor o igual que `1` |
| `Medio de captacion` | todos |

El filtro `Captaciones >= 1` evita mostrar canales o medios sin captaciones en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta canal, medio y `CAPTACIONES` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar la matriz:

```text
Captaciones =
SUM(CAPTACIONES)
agrupado por canal_captacion_categoria y medio_captacion_categoria
```

Para validar el porcentaje:

```text
% = Captaciones del canal o medio / Captaciones totales visibles
```

Ejemplo:

```text
Total captaciones = 6839
Canal DIGITAL = 5893

% DIGITAL = 5893 / 6839 = 86.2 %
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Medio aparece bajo canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con el donut | Ambos visuales deben usar `kpis_medio_embudo_comercial[CAPTACIONES]` |
| Porcentaje no suma 100% | Contexto de `ALLSELECTED` o filtros externos |
| Fila no aparece | `Captaciones` es menor que `1` |

---

### Resumen

```text
Visual: Desglose de medios de captaciones
Tipo: Matriz
Filas: Canal de captacion, Medio de captacion
Valores: Captaciones, %
Tabla: kpis_medio_embudo_comercial
Filtro visual: Captaciones >= 1
Pagina: Pie de medios
```

---

## Visual 6: Matriz - Desglose de medios de visitas

### Objetivo

Muestra el detalle de visitas por canal y medio de captacion. Permite abrir cada canal para ver que medios especificos explican el total de visitas.

Lectura de negocio:

```text
Primero se ve el total por canal.
Al expandir el canal, se ve el aporte de cada medio.
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
| Filas | `kpis_medio_embudo_comercial[canal_captacion_categoria]` renombrado como `Canal de captacion` |
| Filas | `kpis_medio_embudo_comercial[medio_captacion_categoria]` renombrado como `Medio de captacion` |
| Columnas | vacio |
| Valores | `Visitas` |
| Valores | `%` |

La jerarquia de filas permite ver:

```text
Canal de captacion
  -> Medio de captacion
```

---

### Medida Visitas

La columna `Visitas` corresponde a:

```DAX
Visitas =
SUM(kpis_medio_embudo_comercial[VISITAS])
```

Representa el total de visitas del canal o medio dentro del contexto filtrado.

---

### Medida %

La columna `%` representa la participacion del canal o medio sobre el total visible de visitas.

Conceptualmente:

```DAX
% Visitas =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[VISITAS]),
    CALCULATE(
        SUM(kpis_medio_embudo_comercial[VISITAS]),
        ALLSELECTED(kpis_medio_embudo_comercial)
    )
)
```

En la matriz, este porcentaje permite comparar el peso relativo de cada canal y cada medio dentro del total filtrado por la pagina.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `%` | todos |
| `Canal de captacion` | todos |
| `Medio de captacion` | todos |
| `Visitas` | mayor o igual que `1` |

El filtro `Visitas >= 1` evita mostrar canales o medios sin visitas en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta canal, medio y `VISITAS` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar la matriz:

```text
Visitas =
SUM(VISITAS)
agrupado por canal_captacion_categoria y medio_captacion_categoria
```

Para validar el porcentaje:

```text
% = Visitas del canal o medio / Visitas totales visibles
```

Ejemplo:

```text
Total visitas = 418
Canal DIGITAL = 215

% DIGITAL = 215 / 418 = 51.4 %
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Medio aparece bajo canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con el donut | Ambos visuales deben usar `kpis_medio_embudo_comercial[VISITAS]` |
| Porcentaje no suma 100% | Contexto de `ALLSELECTED` o filtros externos |
| Fila no aparece | `Visitas` es menor que `1` |

---

### Resumen

```text
Visual: Desglose de medios de visitas
Tipo: Matriz
Filas: Canal de captacion, Medio de captacion
Valores: Visitas, %
Tabla: kpis_medio_embudo_comercial
Filtro visual: Visitas >= 1
Pagina: Pie de medios
```

---

## Visual 7: Matriz - Desglose de medios de separaciones

### Objetivo

Muestra el detalle de separaciones por canal y medio de captacion. Permite abrir cada canal para ver que medios especificos explican el total de separaciones.

Lectura de negocio:

```text
Primero se ve el total por canal.
Al expandir el canal, se ve el aporte de cada medio.
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
| Filas | `kpis_medio_embudo_comercial[canal_captacion_categoria]` renombrado como `Canal de captacion` |
| Filas | `kpis_medio_embudo_comercial[medio_captacion_categoria]` renombrado como `Medio de captacion` |
| Columnas | vacio |
| Valores | `Separaciones` |
| Valores | `%` |

La jerarquia de filas permite ver:

```text
Canal de captacion
  -> Medio de captacion
```

---

### Medida Separaciones

La columna `Separaciones` corresponde a:

```DAX
Separaciones =
SUM(kpis_medio_embudo_comercial[SEPARACIONES])
```

Representa el total de separaciones del canal o medio dentro del contexto filtrado.

---

### Medida %

La columna `%` representa la participacion del canal o medio sobre el total visible de separaciones.

Conceptualmente:

```DAX
% Separaciones =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[SEPARACIONES]),
    CALCULATE(
        SUM(kpis_medio_embudo_comercial[SEPARACIONES]),
        ALLSELECTED(kpis_medio_embudo_comercial)
    )
)
```

En la matriz, este porcentaje permite comparar el peso relativo de cada canal y cada medio dentro del total filtrado por la pagina.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `%` | todos |
| `Canal de captacion` | todos |
| `Medio de captacion` | todos |
| `Separaciones` | mayor o igual que `1` |

El filtro `Separaciones >= 1` evita mostrar canales o medios sin separaciones en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta canal, medio y `SEPARACIONES` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar la matriz:

```text
Separaciones =
SUM(SEPARACIONES)
agrupado por canal_captacion_categoria y medio_captacion_categoria
```

Para validar el porcentaje:

```text
% = Separaciones del canal o medio / Separaciones totales visibles
```

Ejemplo:

```text
Total separaciones = 58
Canal DIGITAL = 27

% DIGITAL = 27 / 58 = 46.6 %
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Medio aparece bajo canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con el donut | Ambos visuales deben usar `kpis_medio_embudo_comercial[SEPARACIONES]` |
| Porcentaje no suma 100% | Contexto de `ALLSELECTED` o filtros externos |
| Fila no aparece | `Separaciones` es menor que `1` |

---

### Resumen

```text
Visual: Desglose de medios de separaciones
Tipo: Matriz
Filas: Canal de captacion, Medio de captacion
Valores: Separaciones, %
Tabla: kpis_medio_embudo_comercial
Filtro visual: Separaciones >= 1
Pagina: Pie de medios
```

---

## Visual 8: Matriz - Desglose de medios de ventas

### Objetivo

Muestra el detalle de ventas por canal y medio de captacion. Permite abrir cada canal para ver que medios especificos explican el total de ventas.

Lectura de negocio:

```text
Primero se ve el total por canal.
Al expandir el canal, se ve el aporte de cada medio.
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
| Filas | `kpis_medio_embudo_comercial[canal_captacion_categoria]` renombrado como `Canal de captacion` |
| Filas | `kpis_medio_embudo_comercial[medio_captacion_categoria]` renombrado como `Medio de captacion` |
| Columnas | vacio |
| Valores | `Ventas` |
| Valores | `%` |

La jerarquia de filas permite ver:

```text
Canal de captacion
  -> Medio de captacion
```

---

### Medida Ventas

La columna `Ventas` corresponde a:

```DAX
Ventas =
SUM(kpis_medio_embudo_comercial[VENTAS])
```

Representa el total de ventas del canal o medio dentro del contexto filtrado.

---

### Medida %

La columna `%` representa la participacion del canal o medio sobre el total visible de ventas.

Conceptualmente:

```DAX
% Ventas =
DIVIDE(
    SUM(kpis_medio_embudo_comercial[VENTAS]),
    CALCULATE(
        SUM(kpis_medio_embudo_comercial[VENTAS]),
        ALLSELECTED(kpis_medio_embudo_comercial)
    )
)
```

En la matriz, este porcentaje permite comparar el peso relativo de cada canal y cada medio dentro del total filtrado por la pagina.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `%` | todos |
| `Canal de captacion` | todos |
| `Medio de captacion` | todos |
| `Ventas` | mayor o igual que `1` |

El filtro `Ventas >= 1` evita mostrar canales o medios sin ventas en el mes seleccionado.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `kpis_medio_embudo_comercial` | Aporta canal, medio y `VENTAS` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> kpis_medio_embudo_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar la matriz:

```text
Ventas =
SUM(VENTAS)
agrupado por canal_captacion_categoria y medio_captacion_categoria
```

Para validar el porcentaje:

```text
% = Ventas del canal o medio / Ventas totales visibles
```

Ejemplo:

```text
Total ventas = 12
Canal DIGITAL = 6

% DIGITAL = 6 / 12 = 50.0 %
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Medio aparece bajo canal incorrecto | Reglas de `canal_captacion_categoria` |
| Total no coincide con el donut | Ambos visuales deben usar `kpis_medio_embudo_comercial[VENTAS]` |
| Porcentaje no suma 100% | Contexto de `ALLSELECTED` o filtros externos |
| Fila no aparece | `Ventas` es menor que `1` |

---

### Resumen

```text
Visual: Desglose de medios de ventas
Tipo: Matriz
Filas: Canal de captacion, Medio de captacion
Valores: Ventas, %
Tabla: kpis_medio_embudo_comercial
Filtro visual: Ventas >= 1
Pagina: Pie de medios
```
