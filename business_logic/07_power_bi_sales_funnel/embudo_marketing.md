# Embudo de marketing

El embudo presenta las etapas **captaciones → visitas → separaciones → ventas** por proyecto y periodo. Cada etapa usa su propia fecha y regla de conteo.

## Captaciones

Las captaciones representan clientes o prospectos que ingresan al embudo comercial.

| Regla | Aplicación |
|---|---|
| Unicidad | Solo se cuenta un cliente por mes y proyecto cuando `LeadUnicoxMesProyecto = SI`. |
| Llave de deduplicación | Código interno de cliente + proyecto + mes. No se deduplica por documento, celular o correo. |
| Fecha conservada | Si hay más de un registro para la llave, se conserva la fecha de registro más antigua del mes. |
| Recontactos | Para clientes con relación previa, el medio puede venir del prospecto histórico más antiguo relacionado. Para los demás, se usa su propio `ComoSeEntero`. |
| Normalización | Se normalizan asesores y clientes para evitar variantes de escritura, mayúsculas, usuarios o abreviaturas. Los medios se consolidan en categorías comerciales. |
| Exclusiones | Se eliminan captaciones o prospectos de prueba, como `TEST@FB.COM`. |

Por ello, Evolta puede mostrar varias filas para el mismo cliente, filas cuyo indicador de lead único no es `SI`, medios recientes distintos de la atribución histórica o registros de prueba que el dashboard no cuenta.

### Detalle de prospectos

Mantiene el mismo concepto de captación del embudo y permite auditar cada caso. Muestra cliente, proyecto, fecha de registro, asesor, medio y categoría de captación, estado, subestado y datos de campaña; además permite revisar captaciones por día y medio.

## Visitas

Las visitas representan clientes que realizaron una visita comercial válida, presencial o virtual.

| Regla | Aplicación |
|---|---|
| Exclusión | No se consideran registros `SOLO PROFORMA`. |
| Fecha del indicador | Se asigna con la fecha de visita, no necesariamente con la fecha de creación del contacto o proforma. |
| Unicidad | Código interno de cliente + proyecto + mes. |
| Fecha conservada | Ante varias visitas válidas de la misma llave, se conserva la más reciente del mes. |
| Validación | Debe ser una interacción comercial válida y cumplir las reglas del embudo. |

Una proforma sin fecha de visita no cuenta. Si el cliente visita varias veces en el mes, Evolta puede mostrar varias filas mientras el dashboard muestra una sola visita. El medio puede provenir de la atribución consolidada del cliente.

### Detalle de visitas

Muestra el mismo número de visitas que el embudo con sus mismos filtros: cliente, proyecto, fecha de visita, proforma, asesor, tipo de visita, medio de captación y datos del cliente.

## Separaciones

Las separaciones son procesos comerciales registrados como separación. Se asignan al mes de su **fecha de inicio de separación**.

Se requieren una fecha de separación informada y una unidad dentro del alcance comercial vigente, principalmente casas o departamentos. Se excluyen procesos de prueba, errores de datos, errores de refinanciamiento, anulaciones por error, responsables internos o registros excluidos, y cotizaciones no seleccionadas cuando la información existe.

Las separaciones son **brutas válidas**: una separación puede contar aunque posteriormente caiga o sea devuelta. No se deduplican por cliente; cada proceso válido puede contar.

El medio de captación se obtiene, en orden, del prospecto histórico relacionado, del medio comercial o de la proforma y, como última alternativa, del medio registrado en Sperant.

### Detalle de separaciones

Incluye cliente, proyecto, unidad, tipología, fecha de separación, asesor, medio, fecha de caída o devolución y estado de actividad. Distingue separaciones activas, activas durante su mes de ocurrencia y aquellas caídas o devueltas después.

## Ventas

Las ventas son procesos comerciales registrados como venta. Se asignan al mes de la **fecha de impresión de contrato**.

Se consideran principalmente casas y departamentos dentro del alcance comercial. Se excluyen errores de datos, refinanciamiento, anulaciones inválidas, cotizaciones no seleccionadas cuando estén disponibles y procesos de prueba o fuera del alcance.

Las ventas son **brutas válidas** y no se deduplican por cliente: más de una compra válida de la misma persona puede aportar más de una venta. El medio se atribuye con el mismo orden usado en separaciones: prospecto histórico, medio comercial/proforma y medio de Sperant.

### Detalle de ventas

Incluye cliente, proyecto, unidad, tipología, fecha de venta, asesor, medio, fecha de caída o devolución y estado de actividad. Permite validar si la venta sigue activa o fue caída, devuelta o anulada posteriormente.

## Vistas por medio de captación

Debajo de las cuatro etapas se presentan dos vistas:

| Vista | Alcance |
|---|---|
| Medio Captación Detalle | Muestra el medio sin agrupar. |
| Medio Captación Agrupado | Consolida medios en categorías comerciales. |

Ambas muestran captaciones, visitas, separaciones y ventas por proyecto, periodo y medio; sirven para comparar volumen y conversión desde la captación hasta la venta.
