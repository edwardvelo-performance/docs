# Manual conceptual del embudo comercial

## Propósito

Este manual explica cómo se construyen las cifras del dashboard comercial de Power BI y por qué pueden diferir de los reportes descargables de Evolta.

Los reportes descargables muestran registros operativos —prospectos, contactos, proformas, separaciones, ventas y citas— tal como existen en el sistema. El dashboard aplica reglas de negocio para depurar, relacionar, deduplicar y clasificar esos registros antes de convertirlos en indicadores.

## Cómo navegar este manual

| Documento | Contenido |
|---|---|
| [Embudo de marketing](./embudo-marketing) | Reglas de captaciones, visitas, separaciones, ventas y atribución de medios. |
| [Pie de medios](./pie-de-medios) | Métricas del embudo agrupadas por categoría de medio. |
| [Gestión comercial](./gestion-comercial) | Productividad por asesor, proyecto y periodo. |
| [Análisis comercial](./analisis-comercial) | Reporte consolidado, calidad de leads, perfil del comprador e histórico. |
| [Detalles](./detalles) | Vistas de auditoría de prospectos, visitas, separaciones y ventas. |

## Principios que explican las diferencias

1. **Indicadores, no filas operativas.** El dashboard no busca replicar la cantidad de filas de Evolta: muestra eventos que cumplen una definición comercial.
2. **Deduplicación.** Captaciones y visitas se cuentan una vez por código interno de cliente, proyecto y mes. La llave no es documento, celular ni correo.
3. **Fecha del evento.** Cada métrica se asigna al periodo por su fecha comercial relevante, que puede ser distinta de la fecha de creación visible en Evolta.
4. **Depuración comercial.** Se excluyen pruebas, errores de datos, refinanciamientos, anulaciones inválidas y procesos fuera del alcance según corresponda.
5. **Atribución consolidada.** El medio o asesor puede proceder de una relación histórica normalizada, no necesariamente de la última fila descargada.

> Para la definición técnica de tablas, modelo de datos y visuales de Power BI, consulte la [Capa 6: Reportes Power BI](../06_powerbi_reports/reporte_embudo).
