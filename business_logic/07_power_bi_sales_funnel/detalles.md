# Detalles del embudo

Las páginas de detalle permiten auditar los registros que sustentan cada indicador. Aplican las mismas reglas de negocio de las pestañas resumidas.

## Detalle de prospectos

Incluye cliente, código interno, proyecto, fecha de registro, asesor, medio y categoría de captación, estado, subestado y variables de campaña.

Solo incorpora prospectos únicos por proyecto y mes, con condición de lead único cuando corresponda; excluye pruebas y normaliza asesores, clientes y medios. Si Evolta tiene varias filas del mismo cliente en el mes y proyecto, conserva una única captación. Sirve para auditar la asignación de proyecto, fecha, asesor o medio.

## Detalle de visitas

Incluye cliente, proyecto, fecha de visita, proforma, asesor, tipo de visita y medio de captación. Solo incorpora visitas con fecha registrada, interacción comercial válida, no clasificadas como `SOLO PROFORMA` y únicas por código interno de cliente + proyecto + mes.

Cuando hay varias visitas válidas, conserva la más reciente. Por ello, el total puede ser menor que las filas del reporte de visitas descargado de Evolta.

## Detalle de separaciones

Incluye cliente, proyecto, unidad, tipología, fecha de separación, asesor, medio, fecha de caída o devolución y condición de actividad.

Incluye procesos con fecha de separación, unidad dentro del alcance, cotización seleccionada válida cuando exista ese dato y sin pruebas, errores de datos, refinanciamiento o anulaciones inválidas. No deduplica por cliente: puede mostrar más de una separación válida de la misma persona. Una separación puede figurar aunque después caiga o sea devuelta; las columnas de actividad permiten diferenciar esos estados.

## Detalle de ventas

Incluye cliente, proyecto, unidad, tipología, fecha de venta, asesor, medio, fecha de caída o devolución y condición de actividad.

Incluye ventas con fecha de impresión de contrato, unidad dentro del alcance, cotización seleccionada válida cuando aplique y sin errores, refinanciamiento, pruebas o anulaciones inválidas. No deduplica por cliente: una persona puede aparecer varias veces por compras válidas distintas.

La venta se asigna al mes de impresión de contrato, que puede ser distinto del mes de creación de proforma o de la separación. Las ventas son brutas válidas; la condición de actividad permite identificar ventas activas o posteriormente caídas, devueltas o anuladas.
