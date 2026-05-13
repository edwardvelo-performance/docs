# Graficos de la Pagina Calidad de Leads

## Proposito

Este archivo documenta como se construyen los visuales de la pagina **Calidad de leads** del reporte Power BI: tablas usadas, medidas DAX, campos del visual, filtros y lectura de negocio.

---

## Pagina: Calidad de leads

La pagina analiza la calidad de leads desde dos angulos principales:

| Bloque | Que analiza |
|---|---|
| Contactabilidad | Cuantos leads fueron contactados y cuantos contactos fueron efectivos |
| Recontacto | Cuanto del volumen corresponde a leads recontactados |
| Subestados | Distribucion de leads por medio, audiencia y subestado |

Filtros principales de la pagina:

| Slicer | Funcion |
|---|---|
| Grupo | Filtra por grupo inmobiliario |
| Team | Filtra por equipo comercial |
| Empresa | Filtra por empresa |
| Proyecto | Filtra por proyecto |
| Año-Mes | Filtra el mes analizado |

---

## Visual 1: Grafico combinado - Porcentaje de contactabilidad en el año

### Objetivo

Muestra la evolucion mensual de la contactabilidad. Combina volumen de leads contactados con el porcentaje de contacto efectivo.

Lectura de negocio:

```text
Las columnas muestran volumen de gestion.
La linea muestra la eficiencia del contacto.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico combinado de columnas agrupadas y linea
```

Campos:

| Bucket | Campo |
|---|---|
| Eje X | `CalendarioMes[Año-Mes]` |
| Eje Y de columna | `Contactados total` |
| Eje Y de columna | `Contactos efectivos` |
| Eje Y de linea | `% Contacto efectivo` |
| Leyenda de columnas | vacio |
| Multiples pequeños | vacio |

---

### Medidas del visual

#### Contactados total

```DAX
Contactados total =
SUM(cliente_mensual_comercial[CONTACTOS_TOTAL])
```

Representa el total de leads/contactos gestionados en el mes.

#### Contactos efectivos

```DAX
Contactos efectivos =
SUM(cliente_mensual_comercial[CONTACTOS_EFECTIVOS])
```

Representa el total de contactos efectivos en el mes.

#### % Contacto efectivo

```DAX
% Contacto efectivo =
DIVIDE(
    SUM(cliente_mensual_comercial[CONTACTOS_EFECTIVOS]),
    SUM(cliente_mensual_comercial[CONTACTOS_TOTAL]),
    0
)
```

Mide la eficiencia de contacto:

```text
% Contacto efectivo = contactos efectivos / contactados total
```

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `Año-Mes` | todos |
| `EsUltimo12Meses` | todos |
| `SUM(real_leads...)` | todos |
| `SUM(LEADS...)` | todos |
| `% Recontacto` | todos |
| `Leads Recontacto` | todos |
| `% Contacto efectivo` | todos |

El visual depende principalmente del contexto de los slicers y del eje temporal `Año-Mes`.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `cliente_mensual_comercial` | Aporta contactos totales, contactos efectivos y medidas de contactabilidad |
| `CalendarioMes` | Aporta el eje mensual `Año-Mes` |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |

Relaciones esperadas:

```text
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
DimProyectoMes[ProjectMonthKey] -> cliente_mensual_comercial[ProjectMonthKey]
```

---

### Validacion rapida

Para validar un mes:

```text
Contactados total    = SUM(CONTACTOS_TOTAL)
Contactos efectivos  = SUM(CONTACTOS_EFECTIVOS)
% Contacto efectivo  = CONTACTOS_EFECTIVOS / CONTACTOS_TOTAL
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Mes no aparece | Relacion con `CalendarioMes` |
| Porcentaje en cero | `CONTACTOS_TOTAL` es cero |
| Volumen duplicado | Relacion por `ProjectMonthKey` o cardinalidad |
| Slicers no filtran | Cruce entre `DimProyectoMes` y `cliente_mensual_comercial` |

---

### Resumen

```text
Visual: Porcentaje de contactabilidad en el año
Tipo: Grafico combinado columnas + linea
Eje X: Año-Mes
Columnas: Contactados total, Contactos efectivos
Linea: % Contacto efectivo
Tabla: cliente_mensual_comercial
Pagina: Calidad de leads
```

---

## Visual 2: Grafico combinado - Porcentaje de recontacto en el año

### Objetivo

Muestra la evolucion mensual del recontacto. Combina el volumen total de captaciones con el volumen de leads recontactados y el porcentaje que representan.

Lectura de negocio:

```text
Las columnas muestran captaciones totales y leads recontactados.
La linea muestra que porcentaje de las captaciones corresponde a recontacto.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico combinado de columnas agrupadas y linea
```

Campos:

| Bucket | Campo |
|---|---|
| Eje X | `CalendarioMes[Año-Mes]` |
| Eje Y de columna | `Captaciones total` |
| Eje Y de columna | `Leads Recontacto` |
| Eje Y de linea | `% Recontacto` |
| Leyenda de columnas | vacio |
| Multiples pequeños | vacio |

---

### Medidas del visual

#### Captaciones total

```DAX
Captaciones total =
SUM(cliente_mensual_comercial[CAPTACIONES_TOTAL])
```

Representa el total de captaciones del mes.

#### Leads Recontacto

```DAX
Leads Recontacto =
SUM('cliente_mensual_comercial'[CAPTACIONES_TOTAL]) -
SUM('cliente_mensual_comercial'[LEADS_UNICOS])
```

Calcula los leads que no son nuevos, interpretados como recontacto.

#### % Recontacto

```DAX
% Recontacto =
DIVIDE(
    [Leads Recontacto],
    SUM('cliente_mensual_comercial'[captaciones_total]),
    0
)
```

Mide el peso del recontacto sobre el total de captaciones:

```text
% Recontacto = leads recontacto / captaciones total
```

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `Año-Mes` | todos |
| `EsUltimo12Meses` | `1` |
| `SUM(real_leads...)` | todos |
| `SUM(LEADS...)` | todos |
| `% Recontacto` | todos |
| `Leads Recontacto` | todos |

El filtro `EsUltimo12Meses = 1` limita el grafico a la ventana reciente de 12 meses.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `cliente_mensual_comercial` | Aporta captaciones totales y leads unicos para calcular recontacto |
| `CalendarioMes` | Aporta el eje mensual `Año-Mes` y el filtro de ultimos 12 meses |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |

Relaciones esperadas:

```text
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
DimProyectoMes[ProjectMonthKey] -> cliente_mensual_comercial[ProjectMonthKey]
```

---

### Validacion rapida

Para validar un mes:

```text
Captaciones total = SUM(CAPTACIONES_TOTAL)
Leads Recontacto  = SUM(CAPTACIONES_TOTAL) - SUM(LEADS_UNICOS)
% Recontacto      = Leads Recontacto / Captaciones total
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Recontacto negativo | `LEADS_UNICOS` mayor que `CAPTACIONES_TOTAL` |
| Porcentaje en cero | `CAPTACIONES_TOTAL` es cero |
| Mes fuera de rango | `EsUltimo12Meses = 1` |
| Volumen duplicado | Relacion por `ProjectMonthKey` o cardinalidad |
| Slicers no filtran | Cruce entre `DimProyectoMes` y `cliente_mensual_comercial` |

---

### Resumen

```text
Visual: Porcentaje de recontacto en el año
Tipo: Grafico combinado columnas + linea
Eje X: Año-Mes
Columnas: Captaciones total, Leads Recontacto
Linea: % Recontacto
Tabla: cliente_mensual_comercial
Filtro temporal: EsUltimo12Meses = 1
Pagina: Calidad de leads
```

---

## Visual 3: Arbol de descomposicion - Subestado por medio de captacion

### Objetivo

Muestra como se distribuyen los leads digitales por medio de captacion y por subestado. Sirve para identificar que medios concentran mayor volumen y en que estado quedan esos leads.

Lectura de negocio:

```text
El total de leads digitales se descompone primero por medio de captacion.
Luego se descompone por subestado del lead.
```

---

### Configuracion del visual

Tipo de visual:

```text
Arbol de descomposicion
```

Campos:

| Bucket | Campo |
|---|---|
| Analizar | `Leads digitales` |
| Explicar por | `detalle_prospectos[medio_captacion_categoria]` renombrado como `Medio captacion` |
| Explicar por | `detalle_prospectos[sub_estado]` renombrado como `Sub estado` |
| Informacion sobre herramientas | vacio |

---

### Medida / valor analizado

El campo analizado es:

```DAX
Leads digitales =
SUM(detalle_prospectos[CAPTACIONES])
```

Representa el volumen de captaciones digitales dentro del contexto filtrado.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `Leads digitales` | todos |
| `Medio captacion` | medios digitales |
| `Sub estado` | todos |
| `SUM(CAPTACIONES)` | todos |

Filtro de medios digitales:

```text
medio_captacion_categoria IN (
  WHATSAPP,
  LINKEDIN,
  MAILING,
  PORTALES,
  TIKTOK,
  WHATSAPP_PAUTA,
  LANDING INARA,
  WEB,
  MANTRA,
  META
)
```

Este filtro limita el arbol a leads provenientes de canales digitales.

Quedan fuera de este visual medios como `ACTIVACION`, `CORREDOR` y `META IA`, porque no estan seleccionados en el filtro de medio de captacion.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `detalle_prospectos` | Aporta la fila de prospecto/lead, `CAPTACIONES`, medio y subestado |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> detalle_prospectos[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el primer nivel:

```text
Leads digitales por medio =
SUM(detalle_prospectos[CAPTACIONES])
agrupado por medio_captacion_categoria
filtrado a medios digitales
```

Para validar el segundo nivel:

```text
Leads digitales por subestado =
SUM(detalle_prospectos[CAPTACIONES])
agrupado por medio_captacion_categoria y sub_estado
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Medio no aparece | No esta incluido en el filtro digital |
| Subestado no aparece | `sub_estado` esta en blanco o no tiene captaciones |
| Total no coincide con otros visuales | Diferencia entre `detalle_prospectos` y tablas agregadas |
| Slicers no filtran | Relacion por `ProjectMonthKey` |

---

### Resumen

```text
Visual: Subestado por medio de captacion
Tipo: Arbol de descomposicion
Analizar: Leads digitales
Explicar por: Medio captacion, Sub estado
Tabla: detalle_prospectos
Filtro clave: medio_captacion_categoria en medios digitales
Pagina: Calidad de leads
```

---

## Visual 4: Arbol de descomposicion - Subestado por Audiencias

### Objetivo

Muestra como se distribuyen los leads digitales por audiencia/canal UTM y por subestado. Sirve para analizar la calidad del lead segun su origen de pauta o etiquetado digital.

Lectura de negocio:

```text
El total de leads digitales se descompone primero por utm_medium.
Luego se descompone por subestado del lead.
```

---

### Configuracion del visual

Tipo de visual:

```text
Arbol de descomposicion
```

Campos:

| Bucket | Campo |
|---|---|
| Analizar | `Leads digitales` |
| Explicar por | `detalle_prospectos[utm_medium]` |
| Explicar por | `detalle_prospectos[sub_estado]` renombrado como `Sub estado` |
| Informacion sobre herramientas | vacio |

---

### Medida / valor analizado

El campo analizado es:

```DAX
Leads digitales =
SUM(detalle_prospectos[CAPTACIONES])
```

Representa el volumen de captaciones digitales dentro del contexto filtrado.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `Leads digitales` | todos |
| `medio_captacion_categoria` | medios digitales |
| `Sub estado` | todos |
| `SUM(CAPTACIONES)` | todos |
| `utm_medium` | todos |

Filtro de medios digitales:

```text
medio_captacion_categoria IN (
  WHATSAPP,
  LINKEDIN,
  MAILING,
  PORTALES,
  TIKTOK,
  WHATSAPP_PAUTA,
  LANDING INARA,
  WEB,
  MANTRA,
  META
)
```

El filtro digital define el universo inicial del arbol; `utm_medium` solo segmenta ese universo.

Quedan fuera de este visual medios como `ACTIVACION`, `CORREDOR` y `META IA`, porque no estan seleccionados en el filtro de medio de captacion.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `detalle_prospectos` | Aporta la fila de prospecto/lead, `CAPTACIONES`, `utm_medium`, medio y subestado |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> detalle_prospectos[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el primer nivel:

```text
Leads digitales por audiencia =
SUM(detalle_prospectos[CAPTACIONES])
agrupado por utm_medium
filtrado a medios digitales
```

Para validar el segundo nivel:

```text
Leads digitales por subestado =
SUM(detalle_prospectos[CAPTACIONES])
agrupado por utm_medium y sub_estado
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Audiencia aparece como blanco | `utm_medium` viene vacio en `detalle_prospectos` |
| Subestado no aparece | `sub_estado` esta en blanco o no tiene captaciones |
| Total no coincide con el arbol por medio | Ambos visuales deben usar la misma medida y filtro digital |
| Slicers no filtran | Relacion por `ProjectMonthKey` |

---

### Resumen

```text
Visual: Subestado por Audiencias
Tipo: Arbol de descomposicion
Analizar: Leads digitales
Explicar por: utm_medium, Sub estado
Tabla: detalle_prospectos
Filtro clave: medio_captacion_categoria en medios digitales
Pagina: Calidad de leads
```
