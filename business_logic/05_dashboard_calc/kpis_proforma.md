# `kpis_medio_proforma_embudo_comercial`

## ¿Qué representa?

KPIs específicos de **proformas** agrupados por medio de captación. Mide cuántas proformas se generan por canal antes de que (eventualmente) se conviertan en separación o venta.

Es el "embudo intermedio": prospecto → proforma → separación.

---

## Granularidad

```
(proyecto, mes, categoría de medio)
```

---

## Métricas que calcula

- `PROFORMAS` — cantidad de proformas generadas en el mes.
- `PROFORMAS_ACTIVAS` — proformas que aún no se convirtieron en venta caída.
- (Otras métricas del embudo se incluyen para correlacionar: VISITAS, SEPARACIONES, etc.)

---

## ¿De dónde vienen los datos?

| Tabla | Aporta |
|---|---|
| `bd_proformas` | Una fila por proforma |
| `bd_clientes` + `bd_clientes_fechas_extension` | Para resolver el medio de captación del cliente que recibió la proforma |
| Resto de tablas del embudo | Para las métricas auxiliares |

---

## Lógica

Es básicamente la lógica de `kpis_medio_comercial` con un CTE adicional para proformas:

```sql
proformas_count AS (
  SELECT id_proyecto, mes_anio, medio_captacion_categoria,
         COUNT(DISTINCT codigo_proforma) AS proformas
  FROM bd_proformas pf
  LEFT JOIN bd_clientes c ON pf.id_cliente_evolta = c.id_cliente_evolta
  GROUP BY id_proyecto, mes_anio, medio_captacion_categoria
)
```

Y se cruza con la grilla principal igual que el resto.

---

## Reglas de negocio

- **Fecha de proforma** = `bd_proformas.fecha_creacion`. Es la fecha de emisión.
- **Una proforma por código.** `COUNT(DISTINCT codigo_proforma)` evita doble conteo.
- **Medio del cliente, no de la proforma.** El medio se hereda del cliente (o prospecto), no de la proforma puntual.

---

## Cosas a tener en cuenta

- **No todas las proformas tienen cliente identificable.** Si la proforma no enlaza con `bd_clientes`, queda en categoría NULL/OTROS.
- **Una proforma cuenta una sola vez** aunque se modifique después. Lo que importa es la fecha de creación inicial.

---

## Referencia al código

- Evolta: `calculate_kpis_medio_proforma_evolta(...)`.
- Sperant: `calculate_kpis_medio_proforma_sperant(...)`.
- Joined: `calculate_kpis_medio_proforma_evolta_sperant(...)`.
