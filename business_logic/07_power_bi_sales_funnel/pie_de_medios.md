# Pie de medios

Esta pestaña muestra captaciones, visitas, separaciones y ventas por categoría de medio de captación, a nivel de **proyecto + mes + categoría de medio**. Responde qué medios aportan más volumen al embudo comercial.

## Reglas por métrica

| Métrica | Regla |
|---|---|
| Captaciones | Se deduplican por código interno de cliente + proyecto + mes; se conserva la primera fecha de registro del mes y solo cuentan prospectos con `LeadUnicoxMesProyecto = SI`. Los clientes con relación previa se incorporan usando su historial. |
| Visitas | Se deduplican por la misma llave y se conserva la visita válida más reciente. Requieren fecha de visita, excluyen `SOLO PROFORMA` y deben ser interacciones comerciales válidas. |
| Separaciones | Requieren registro y fecha de separación, unidad dentro del alcance, cotización seleccionada cuando aplique y ausencia de errores, refinanciamiento o anulaciones inválidas. Se cuentan por proceso, sin deduplicar por cliente. |
| Ventas | Requieren venta y fecha de impresión de contrato, unidad dentro del alcance, cotización seleccionada cuando aplique y ausencia de errores, refinanciamiento o anulaciones inválidas. Se cuentan por proceso, sin deduplicar por cliente. |

## Atribución del medio

Para separaciones y ventas, el medio se busca en este orden:

1. Medio del prospecto histórico más antiguo relacionado con el cliente.
2. Medio comercial o de la proforma.
3. Medio registrado en Sperant, si existe.

Por esta atribución, el medio de la pestaña puede ser diferente del medio visible en una fila puntual descargada de Evolta.

## Por qué puede diferir de Evolta

- Evolta muestra registros operativos; esta vista muestra indicadores depurados y consolidados.
- Captaciones y visitas se deduplican por código interno de cliente, proyecto y mes, no por celular, correo o documento.
- Un prospecto no cuenta si no cumple la condición de lead único.
- Una proforma no cuenta como visita si es `SOLO PROFORMA`, no tiene fecha de visita o existe otra visita del mismo cliente en el mes.
- Separaciones o ventas se pueden excluir por errores, anulaciones, refinanciamiento, cotización no seleccionada o tipo de unidad fuera del alcance.
- Evolta puede mostrar el medio exacto, mientras esta vista agrupa los medios en categorías comerciales.
