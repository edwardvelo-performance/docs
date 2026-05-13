# Graficos de la Pagina Perfil del Comprador

## Proposito

Este archivo documenta como se construyen los visuales de la pagina **Perfil del comprador** del reporte Power BI: tablas usadas, campos del visual, filtros y lectura de negocio.

---

## Pagina: Perfil del comprador

La pagina describe las caracteristicas de los clientes que llegaron a una venta. El analisis se alimenta principalmente de la tabla `perfil_cliente` y se controla con los filtros generales del reporte.

Filtros principales de la pagina:

| Slicer | Funcion |
|---|---|
| Grupo | Filtra por grupo inmobiliario |
| Team | Filtra por equipo comercial |
| Empresa | Filtra por empresa |
| Proyecto | Filtra por proyecto |
| AÃ±o-Mes | Filtra el mes analizado |

Filtro fijo de pagina:

| Filtro | Condicion |
|---|---|
| `PROCESO` | `VENTA` |

Este filtro hace que la pagina trabaje solo con clientes asociados a ventas, no con prospectos generales del embudo.

---

## Visual 1: Tabla - Clientes por distrito

### Objetivo

Muestra la distribucion de compradores por distrito. Sirve para identificar de que zonas provienen los clientes que llegaron a venta dentro del contexto seleccionado.

Lectura de negocio:

```text
Cada fila representa un distrito.
La columna Clientes cuenta cuantos compradores pertenecen a ese distrito.
```

---

### Configuracion del visual

Tipo de visual:

```text
Tabla
```

Campos:

| Bucket | Campo |
|---|---|
| Columnas | `perfil_cliente[DISTRITO]` |
| Columnas | `Clientes` |

Formato aplicado:

| Campo | Formato |
|---|---|
| `Clientes` | Barra de datos para comparar volumen entre distritos |

---

### Medida / valor del visual

El campo `Clientes` representa el conteo de clientes en la tabla `perfil_cliente`.

Definicion conceptual:

```DAX
Clientes =
COUNTROWS(perfil_cliente)
```

Si el modelo usa una medida explicita, debe mantener esta misma logica: contar clientes dentro del contexto de filtros vigente.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `%TG Recuento de ...` | todos |
| `Clientes` | todos |
| `DISTRITO` | todos |

El visual no restringe distritos especificos; muestra todos los distritos que tengan clientes bajo el contexto de la pagina.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `perfil_cliente` | Aporta distrito, datos del comprador y proceso comercial |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de AÃ±o-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> perfil_cliente[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar un distrito:

```text
Clientes por distrito =
COUNTROWS(perfil_cliente)
filtrado por PROCESO = VENTA
agrupado por DISTRITO
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Distrito no aparece | `DISTRITO` esta en blanco o no tiene ventas |
| Clientes duplicados | Nivel de detalle de `perfil_cliente` y unicidad del cliente |
| Total no coincide con ventas | El visual cuenta clientes, no necesariamente unidades vendidas |
| Slicers no filtran | Relacion por `ProjectMonthKey` |
| Aparecen prospectos no compradores | Filtro de pagina `PROCESO = VENTA` |

---

### Resumen

```text
Visual: Clientes por distrito
Tipo: Tabla
Columnas: DISTRITO, Clientes
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA
Pagina: Perfil del comprador
```

---

## Visual 2: Grafico de columnas - Rango de edad

### Objetivo

Muestra la distribucion porcentual de compradores por rango de edad. Sirve para entender que grupo etario concentra mayor participacion dentro de las ventas filtradas.

Lectura de negocio:

```text
Cada columna representa un rango de edad.
El valor mostrado es el porcentaje del total de compradores del contexto seleccionado.
```

---

### Columna calculada usada

El visual usa la columna calculada `Rango Edad`, creada desde `perfil_cliente[RANGO_EDAD]`.

```DAX
Rango Edad =
VAR edad = VALUE(perfil_cliente[RANGO_EDAD])
RETURN
SWITCH(
    TRUE(),
    edad < 18, "<18",
    edad >= 18 && edad < 25, "18 a 24",
    edad >= 25 && edad < 31, "25 a 30",
    edad >= 31 && edad < 45, "31 a 44",
    edad >= 45 && edad < 60, "45 a 59",
    edad >= 60, "60+"
)
```

La columna convierte la edad numerica en grupos comparables para el analisis.

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de columnas agrupadas
```

Campos:

| Bucket | Campo |
|---|---|
| Eje X | `perfil_cliente[Rango Edad]` |
| Eje Y | `%TG Recuento de Rango Edad` |
| Leyenda | vacio |
| Multiples pequeÃ±os | vacio |

El eje Y usa el porcentaje del total general del recuento de `Rango Edad`, por eso el grafico muestra participacion y no solo cantidad absoluta.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `%TG Recuento de Rango Edad` | todos |
| `Rango Edad` | no es `<18` |
| `Recuento de Rango Edad` | todos |

El filtro `Rango Edad <> <18` excluye menores de edad del analisis del comprador.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `perfil_cliente` | Aporta edad original, rango calculado y datos del comprador |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de AÃ±o-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> perfil_cliente[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar un rango:

```text
1. Convertir RANGO_EDAD a numero.
2. Clasificarlo en Rango Edad.
3. Filtrar PROCESO = VENTA.
4. Excluir Rango Edad = <18.
5. Calcular participacion del rango sobre el total visible.
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Edad no clasifica | `RANGO_EDAD` no es numerico o viene en blanco |
| Aparece `<18` | Filtro del objeto visual |
| Porcentaje no suma 100% | Contexto de filtros o valores en blanco |
| Slicers no filtran | Relacion por `ProjectMonthKey` |
| Total no coincide con la tabla de distritos | Un visual muestra porcentaje y el otro conteo absoluto |

---

### Resumen

```text
Visual: Rango de edad
Tipo: Grafico de columnas agrupadas
Eje X: Rango Edad
Eje Y: %TG Recuento de Rango Edad
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA y Rango Edad <> <18
Pagina: Perfil del comprador
```

---

## Visual 3: Grafico circular - Genero

### Objetivo

Muestra la distribucion de compradores por genero. Sirve para ver la participacion relativa de cada genero dentro de los clientes que llegaron a venta.

Lectura de negocio:

```text
Cada segmento representa un genero.
El tamaÃ±o del segmento depende del recuento de clientes en ese genero.
```

---

### Configuracion del visual

Tipo de visual:

```text
Grafico circular
```

Campos:

| Bucket | Campo |
|---|---|
| Leyenda | `perfil_cliente[GENERO]` |
| Valores | `Recuento de ESTADO_CIVIL` |
| Detalles | vacio |
| Informacion sobre herramientas | vacio |

Aunque el valor visible usa `Recuento de ESTADO_CIVIL`, la lectura del visual es un conteo de clientes agrupado por `GENERO` dentro del contexto filtrado.

---

### Medida / valor del visual

Definicion conceptual:

```DAX
Clientes por genero =
COUNT(perfil_cliente[ESTADO_CIVIL])
```

En la practica, el conteo funciona como cantidad de registros de compradores por genero, siempre que `ESTADO_CIVIL` venga informado para los clientes del universo filtrado.

---

### Filtros del objeto visual

Filtros aplicados:

| Filtro | Condicion |
|---|---|
| `GENERO` | todos |
| `Recuento de ESTADO_CIVIL` | todos |

El visual no restringe generos especificos; toma todos los valores disponibles bajo el contexto de la pagina.

---

### Tabla involucrada

| Tabla | Uso |
|---|---|
| `perfil_cliente` | Aporta genero, estado civil y datos del comprador |
| `DimProyectoMes` | Propaga filtros de grupo, team, empresa, proyecto y mes mediante `ProjectMonthKey` |
| `CalendarioMes` | Controla el filtro de AÃ±o-Mes |

Relaciones esperadas:

```text
DimProyectoMes[ProjectMonthKey] -> perfil_cliente[ProjectMonthKey]
CalendarioMes[mes_inicio]      -> DimProyectoMes[mes_inicio]
```

---

### Validacion rapida

Para validar el grafico:

```text
Clientes por genero =
COUNT(perfil_cliente[ESTADO_CIVIL])
filtrado por PROCESO = VENTA
agrupado por GENERO
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Genero no aparece | `GENERO` esta en blanco o no tiene ventas |
| Conteo menor al esperado | `ESTADO_CIVIL` viene en blanco y el visual lo esta contando |
| Porcentaje no coincide | Contexto de slicers o filtros cruzados |
| Slicers no filtran | Relacion por `ProjectMonthKey` |
| Aparecen clientes fuera de venta | Filtro de pagina `PROCESO = VENTA` |

---

### Resumen

```text
Visual: Genero
Tipo: Grafico circular
Leyenda: GENERO
Valores: Recuento de ESTADO_CIVIL
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA
Pagina: Perfil del comprador
```

---

## Visual 4: Grafico de barras - Estado civil

### Objetivo

Muestra la cantidad de compradores por estado civil. Ayuda a identificar la composicion familiar/declarativa de los clientes que concretaron venta.

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de barras agrupadas
```

Campos:

| Bucket | Campo |
|---|---|
| Eje Y | `perfil_cliente[ESTADO_CIVIL]` |
| Eje X | `Recuento de ESTADO_CIVIL` |
| Leyenda | vacio |

---

### Filtros del objeto visual

| Filtro | Condicion |
|---|---|
| `ESTADO_CIVIL` | todos |
| `Recuento de ESTADO_CIVIL` | todos |

El filtro de pagina `PROCESO = VENTA` define que solo se cuenten compradores.

---

### Validacion rapida

```text
Compradores por estado civil =
COUNT(perfil_cliente[ESTADO_CIVIL])
filtrado por PROCESO = VENTA
agrupado por ESTADO_CIVIL
```

---

### Resumen

```text
Visual: Estado civil
Tipo: Grafico de barras agrupadas
Eje Y: ESTADO_CIVIL
Eje X: Recuento de ESTADO_CIVIL
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA
Pagina: Perfil del comprador
```

---

## Visual 5: Tabla - Informacion de puesto

### Objetivo

Lista los puestos declarados por los compradores y la cantidad de clientes por cada puesto. Sirve para perfilar la ocupacion laboral del comprador.

---

### Configuracion del visual

Tipo de visual:

```text
Tabla
```

Campos:

| Bucket | Campo |
|---|---|
| Columnas | `perfil_cliente[PUESTO]` |
| Columnas | `Clientes` |

---

### Filtros del objeto visual

| Filtro | Condicion |
|---|---|
| `Clientes` | todos |
| `PUESTO` | todos |

El visual muestra todos los puestos disponibles en el contexto de filtros. El filtro fijo de pagina sigue siendo `PROCESO = VENTA`.

---

### Validacion rapida

```text
Clientes por puesto =
COUNTROWS(perfil_cliente)
filtrado por PROCESO = VENTA
agrupado por PUESTO
```

Si el resultado no cuadra, revisar si `PUESTO` viene en blanco o si existen variaciones de escritura para el mismo cargo.

---

### Resumen

```text
Visual: Informacion de puesto
Tipo: Tabla
Columnas: PUESTO, Clientes
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA
Pagina: Perfil del comprador
```

---

## Visual 6: Grafico de dona - Motivo de compra

### Objetivo

Muestra la distribucion de compradores segun su motivo de compra. Permite separar clientes orientados a vivienda, inversion u otros motivos declarados.

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de dona
```

Campos:

| Bucket | Campo |
|---|---|
| Leyenda | `perfil_cliente[MOTIVO_COMPRA]` |
| Valores | `Recuento de MOTIVO_COMPRA` |
| Detalles | vacio |

---

### Filtros del objeto visual

| Filtro | Condicion |
|---|---|
| `MOTIVO_COMPRA` | todos |
| `Recuento de MOTIVO_COMPRA` | todos |

El visual respeta el filtro de pagina `PROCESO = VENTA`.

---

### Validacion rapida

```text
Compradores por motivo de compra =
COUNT(perfil_cliente[MOTIVO_COMPRA])
filtrado por PROCESO = VENTA
agrupado por MOTIVO_COMPRA
```

Si el resultado no cuadra, revisar normalizaciones aplicadas en Power Query, por ejemplo `INVERSION` a `INVERSIÃ“N` o variantes VIS agrupadas como `VIVIENDA`.

---

### Resumen

```text
Visual: Motivo de compra
Tipo: Grafico de dona
Leyenda: MOTIVO_COMPRA
Valores: Recuento de MOTIVO_COMPRA
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA
Pagina: Perfil del comprador
```

---

## Visual 7: Grafico de barras - Medio de captacion

### Objetivo

Muestra por que medio de captacion llegaron los compradores que concretaron venta. Ayuda a ver que canales aportan clientes finales, no solo leads.

---

### Configuracion del visual

Tipo de visual:

```text
Grafico de barras agrupadas
```

Campos:

| Bucket | Campo |
|---|---|
| Eje Y | `perfil_cliente[MEDIO_CAPTACION_CATEGORIA]` |
| Eje X | `Recuento de MEDIO_CAPTACION_CATEGORIA` |
| Leyenda | vacio |
| Multiples pequeÃ±os | vacio |

---

### Filtros del objeto visual

| Filtro | Condicion |
|---|---|
| `MEDIO_CAPTACION_CATEGORIA` | todos |
| `Recuento de MEDIO_CAPTACION_CATEGORIA` | todos |

El visual no limita medios especificos; toma todos los medios del contexto filtrado y del universo `PROCESO = VENTA`.

---

### Validacion rapida

```text
Compradores por medio de captacion =
COUNT(perfil_cliente[MEDIO_CAPTACION_CATEGORIA])
filtrado por PROCESO = VENTA
agrupado por MEDIO_CAPTACION_CATEGORIA
```

Si el resultado no cuadra, revisar primero:

| Problema posible | Que revisar |
|---|---|
| Medio no aparece | `MEDIO_CAPTACION_CATEGORIA` esta en blanco o no tiene ventas |
| Total distinto a otros visuales | Este visual cuenta compradores, no captaciones totales |
| Canal mal agrupado | Normalizacion de medios en `perfil_cliente` |
| Slicers no filtran | Relacion por `ProjectMonthKey` |

---

### Resumen

```text
Visual: Medio de captacion
Tipo: Grafico de barras agrupadas
Eje Y: MEDIO_CAPTACION_CATEGORIA
Eje X: Recuento de MEDIO_CAPTACION_CATEGORIA
Tabla: perfil_cliente
Filtro clave: PROCESO = VENTA
Pagina: Perfil del comprador
```

