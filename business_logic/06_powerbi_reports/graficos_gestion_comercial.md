# Graficos de la Pagina Gestion Comercial

## Proposito

Este archivo documenta como se construyen los visuales de la pagina **Gestion comercial** del reporte Power BI: tablas usadas, jerarquias, medidas DAX, filtros y lectura de negocio.

---

## Pagina: Gestion comercial

La pagina resume el desempeño comercial por proyecto y responsable. Combina volumen de gestion, contacto, citas, visitas, separaciones y ventas en una matriz de seguimiento operativo.

Filtros principales de la pagina:

| Slicer | Funcion |
|---|---|
| Grupo | Filtra por grupo inmobiliario |
| Team | Filtra por equipo comercial |
| Empresa | Filtra por empresa |
| Proyecto | Filtra por proyecto |
| Año-Mes | Filtra el mes analizado |

---

## Visual 1: Matriz - Detalle de operaciones comerciales

### Objetivo

Muestra el detalle operativo comercial por grupo inmobiliario, proyecto y responsable. Sirve para comparar productividad y conversiones del embudo comercial en un solo visual.

Lectura de negocio:

```text
La matriz permite bajar desde grupo inmobiliario hasta proyecto y responsable.
Cada fila muestra volumen operativo y ratios de avance/conversion.
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
| Filas | `cliente_mensual_comercial[grupo_inmobiliario]` |
| Filas | `cliente_mensual_comercial[Proyectos]` |
| Filas | `cliente_mensual_comercial[Responsable]` |
| Columnas | vacio |
| Valores | `Captaciones total` |
| Valores | `Contactados total` |
| Valores | `Contactos efectivos` |
| Valores | `% Contacto efectivo` |
| Valores | `Citas generadas` |
| Valores | `Citas concretadas` |
| Valores | `% Citas concretadas` |
| Valores | `Visitas totales` |
| Valores | `Visitas / Captaciones` |
| Valores | `Separaciones brutas` |
| Valores | `Separaciones / Visitas` |
| Valores | `Separaciones netas` |
| Valores | `Ventas brutas` |
| Valores | `Ventas / Captaciones` |
| Valores | `Ventas netas` |

La jerarquia de filas permite analizar:

```text
Grupo inmobiliario
  -> Proyecto
    -> Responsable
```

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `cliente_mensual_comercial` | Aporta las metricas comerciales mensuales por proyecto/responsable |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> cliente_mensual_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `% Citas concretadas` | todos |
| `% Contacto efectivo` | todos |
| `Captaciones total` | no esta en blanco |
| `Citas concretadas` | todos |
| `Citas generadas` | todos |
| `Contactados total` | todos |
| `Contactos efectivos` | todos |

El filtro clave es:

```text
Captaciones total no esta en blanco
```

Este filtro evita que la matriz muestre combinaciones de proyecto/responsable sin actividad base en captaciones.

---

## Medidas principales

### Captaciones total

```DAX
Captaciones total =
SUM(cliente_mensual_comercial[CAPTACIONES_TOTAL])
```

Representa el total de captaciones del contexto filtrado.

---

### Contactados total

```DAX
Contactados total =
SUM(cliente_mensual_comercial[CONTACTOS_TOTAL])
```

Representa el total de clientes contactados.

---

### Contactos efectivos

```DAX
Contactos efectivos =
SUM(cliente_mensual_comercial[CONTACTOS_EFECTIVOS])
```

Representa el total de contactos efectivos.

---

### % Contacto efectivo

```DAX
% Contacto efectivo =
DIVIDE(
    SUM(cliente_mensual_comercial[CONTACTOS_EFECTIVOS]),
    SUM(cliente_mensual_comercial[CONTACTOS_TOTAL]),
    0
)
```

Mide la calidad de contacto:

```text
% Contacto efectivo = contactos efectivos / contactados total
```

---

### Citas generadas

```DAX
Citas generadas =
SUM(cliente_mensual_comercial[CITAS_GENERADAS])
```

Representa el total de citas generadas.

---

### Citas concretadas

```DAX
Citas concretadas =
SUM(cliente_mensual_comercial[CITAS_CONCRETADAS])
```

Representa el total de citas concretadas.

---

### % Citas concretadas

```DAX
% Citas concretadas =
DIVIDE(
    SUM(cliente_mensual_comercial[CITAS_CONCRETADAS]),
    SUM(cliente_mensual_comercial[CITAS_GENERADAS]),
    0
)
```

Mide la efectividad de citas:

```text
% Citas concretadas = citas concretadas / citas generadas
```

---

### Visitas totales

```DAX
Visitas totales =
SUM(cliente_mensual_comercial[VISITAS])
```

Representa el total de visitas registradas.

---

### Visitas / Captaciones

```DAX
Visitas / Captaciones =
DIVIDE(
    SUM(cliente_mensual_comercial[VISITAS]),
    SUM(cliente_mensual_comercial[CAPTACIONES_TOTAL]),
    0
)
```

Mide que porcentaje de captaciones llega a visita.

---

### Separaciones brutas

```DAX
Separaciones brutas =
SUM(cliente_mensual_comercial[SEPARACIONES])
```

Representa el total de separaciones brutas.

---

### Separaciones / Visitas

```DAX
Separaciones / Visitas =
DIVIDE(
    SUM(cliente_mensual_comercial[SEPARACIONES]),
    SUM(cliente_mensual_comercial[VISITAS]),
    0
)
```

Mide conversion de visita a separacion.

---

### Separaciones netas

```DAX
Separaciones netas =
SUM(cliente_mensual_comercial[SEPARACIONES_ACTIVAS])
```

Representa separaciones no devueltas o activas.

---

### Ventas brutas

```DAX
Ventas brutas =
SUM(cliente_mensual_comercial[VENTAS])
```

Representa el total de ventas brutas.

---

### Ventas / Captaciones

```DAX
Ventas / Captaciones =
DIVIDE(
    SUM(cliente_mensual_comercial[VENTAS]),
    SUM(cliente_mensual_comercial[CAPTACIONES_TOTAL]),
    0
)
```

Mide conversion de captacion a venta.

---

### Ventas netas

```DAX
Ventas netas =
SUM(cliente_mensual_comercial[VENTAS_ACTIVAS])
```

Representa ventas no devueltas o activas.

---

## Indicadores visuales

Los porcentajes de la matriz usan formato condicional con iconos tipo semaforo:

| Color | Lectura |
|---|---|
| Verde | Buen desempeño relativo |
| Amarillo/naranja | Desempeño intermedio |
| Rojo | Bajo desempeño relativo |

Los iconos se aplican principalmente a columnas porcentuales:

```text
% Contacto efectivo
% Citas concretadas
Visitas / Captaciones
Separaciones / Visitas
Ventas / Captaciones
```

---

## Validacion rapida

Para validar una fila:

```text
% Contacto efectivo   = CONTACTOS_EFECTIVOS / CONTACTOS_TOTAL
% Citas concretadas   = CITAS_CONCRETADAS / CITAS_GENERADAS
Visitas / Captaciones = VISITAS / CAPTACIONES_TOTAL
Separaciones / Visitas = SEPARACIONES / VISITAS
Ventas / Captaciones  = VENTAS / CAPTACIONES_TOTAL
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Fila no aparece | `Captaciones total` esta en blanco |
| Totales duplicados | Relacion con `DimProyectoMes` o cardinalidad del modelo |
| Porcentajes en cero | Denominador igual a cero en la medida `DIVIDE` |
| Responsable fuera de proyecto | Cruce entre `Proyecto`, `Responsable` y `ProjectMonthKey` |
| Mes incorrecto | Relacion con `CalendarioMes` |

---

## Resumen

```text
Visual: Detalle de operaciones comerciales
Tipo: Matriz
Filas: Grupo inmobiliario, Proyecto, Responsable
Tabla: cliente_mensual_comercial
Valores: volumenes comerciales + ratios de conversion
Filtro visual clave: Captaciones total no esta en blanco
Pagina: Gestion comercial
```

---

## Visual 2: Matriz - Gestion de equipo digital por asesores

### Objetivo

Muestra la gestion mensual por asesor digital. Permite comparar captaciones, leads nuevos, recontactos, contactos efectivos y citas para evaluar productividad individual.

Lectura de negocio:

```text
Cada fila representa un asesor.
La matriz muestra volumen de gestion y efectividad de contacto/citas.
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
| Filas | `cliente_mensual_comercial[usuario]` |
| Filas | `cliente_mensual_comercial[nombre_proyecto]` |
| Columnas | vacio |
| Valores | `Captaciones unicas mes` |
| Valores | `Leads nuevos` |
| Valores | `Leads Recontacto` |
| Valores | `% Recontacto` |
| Valores | `Contactados total` |
| Valores | `Contactos efectivos` |
| Valores | `% Contacto efectivo` |
| Valores | `Citas generadas` |
| Valores | `Citas concretadas` |
| Valores | `% Citas concretadas` |

La jerarquia de filas permite analizar:

```text
Usuario
  -> Proyecto
```

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `cliente_mensual_comercial` | Aporta metricas mensuales por asesor, proyecto y mes |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de Año-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> cliente_mensual_comercial[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `% Citas concretadas` | todos |
| `% Contacto efectivo` | todos |
| `% Recontacto` | todos |
| `Captaciones unicas mes` | no esta en blanco |
| `Citas concretadas` | todos |
| `Citas generadas` | todos |

El filtro clave es:

```text
Captaciones unicas mes no esta en blanco
```

Este filtro evita mostrar asesores o combinaciones asesor/proyecto sin captaciones en el periodo filtrado.

---

## Medidas del visual

### Captaciones unicas mes

```DAX
Captaciones unicas mes =
SUM(cliente_mensual_comercial[CAPTACIONES_TOTAL])
```

Representa captaciones unicas generadas por el asesor en el mes.

---

### Leads nuevos

```DAX
Leads nuevos =
SUM(cliente_mensual_comercial[LEADS_UNICOS])
```

Representa leads unicos nuevos del asesor.

---

### Leads Recontacto

```DAX
Leads Recontacto =
SUM('cliente_mensual_comercial'[CAPTACIONES_TOTAL]) -
SUM('cliente_mensual_comercial'[LEADS_UNICOS])
```

Calcula la diferencia entre captaciones totales y leads nuevos. Esta diferencia se interpreta como leads que vienen de recontacto.

---

### % Recontacto

```DAX
% Recontacto =
DIVIDE(
    [Leads Recontacto],
    SUM('cliente_mensual_comercial'[captaciones_total]),
    0
)
```

Mide que porcentaje de las captaciones del asesor corresponde a recontacto.

---

### Contactados total

```DAX
Contactados total =
SUM(cliente_mensual_comercial[CONTACTOS_TOTAL])
```

Representa el total de clientes contactados.

---

### Contactos efectivos

```DAX
Contactos efectivos =
SUM(cliente_mensual_comercial[CONTACTOS_EFECTIVOS])
```

Representa contactos efectivos logrados.

---

### % Contacto efectivo

```DAX
% Contacto efectivo =
DIVIDE(
    SUM(cliente_mensual_comercial[CONTACTOS_EFECTIVOS]),
    SUM(cliente_mensual_comercial[CONTACTOS_TOTAL]),
    0
)
```

Mide la efectividad de contacto del asesor.

---

### Citas generadas

```DAX
Citas generadas =
SUM(cliente_mensual_comercial[CITAS_GENERADAS])
```

Representa citas generadas por el asesor.

---

### Citas concretadas

```DAX
Citas concretadas =
SUM(cliente_mensual_comercial[CITAS_CONCRETADAS])
```

Representa citas concretadas por el asesor.

---

### % Citas concretadas

```DAX
% Citas concretadas =
DIVIDE(
    SUM(cliente_mensual_comercial[CITAS_CONCRETADAS]),
    SUM(cliente_mensual_comercial[CITAS_GENERADAS]),
    0
)
```

Mide la efectividad de citas del asesor.

---

## Indicadores visuales

Los porcentajes usan formato condicional con iconos tipo semaforo:

| Color | Lectura |
|---|---|
| Verde | Buen desempeño relativo |
| Amarillo/naranja | Desempeño intermedio |
| Rojo | Bajo desempeño relativo |

Se aplican principalmente a:

```text
% Recontacto
% Contacto efectivo
% Citas concretadas
```

---

## Validacion rapida

Para validar una fila de asesor:

```text
Leads Recontacto      = CAPTACIONES_TOTAL - LEADS_UNICOS
% Recontacto          = Leads Recontacto / CAPTACIONES_TOTAL
% Contacto efectivo   = CONTACTOS_EFECTIVOS / CONTACTOS_TOTAL
% Citas concretadas   = CITAS_CONCRETADAS / CITAS_GENERADAS
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Asesor no aparece | `Captaciones unicas mes` esta en blanco |
| Leads Recontacto negativo | Revisar consistencia entre `CAPTACIONES_TOTAL` y `LEADS_UNICOS` |
| Porcentajes en cero | Denominador igual a cero en la medida `DIVIDE` |
| Proyecto no cruza | Relacion por `ProjectMonthKey` |
| Mes incorrecto | Relacion con `CalendarioMes` |

---

## Resumen

```text
Visual: Gestion de equipo digital por asesores
Tipo: Matriz
Filas: Usuario, Proyecto
Tabla: cliente_mensual_comercial
Valores: captaciones, leads, recontacto, contacto y citas
Filtro visual clave: Captaciones unicas mes no esta en blanco
Pagina: Gestion comercial
```
