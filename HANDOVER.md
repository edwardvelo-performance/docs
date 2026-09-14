# HANDOVER — docs (Mintlify)

Sitio **Performance Peru Data Warehouse Guide**: lógica de negocio del ETL **legacy** (Spark / `etl_pyspark`), no del stack Prefect.

Repo: `https://github.com/edwardvelo-performance/docs` (`main`)  
Publicado: https://performancerealstate.mintlify.app

## Al tomar el puesto — qué copiar y qué cambiar

**Levantar local**

```bash
git clone https://github.com/edwardvelo-performance/docs.git
cd docs
npx mintlify dev
```

El sitio publicado es Mintlify Cloud sobre este repo. Pide acceso al dashboard Mintlify del proyecto `performancerealstate`.

**Cambiar cuando el puesto sea tuyo**

| Qué | Dónde | Por qué |
|-----|-------|---------|
| Acceso Mintlify | dashboard del sitio | Sin eso no publicas cambios de lógica de negocio |
| `docs.json` | raíz del repo | Solo si agregas páginas a la nav |
| `aidash-pi/performance-data-llm.txt` | repo AIDASH | Si creas o renombras una URL; Pi no la descubre sola |

**No cambiar el primer mes:** URLs bajo `/business_logic/` que AIDASH ya tiene indexadas (romper el path deja al agente ciego). No uses este repo para documentar Prefect: eso vive en `etl_prefect/docs-site`.

## Para qué existe

Analistas, ingeniería y **AIDASH** (Pi Agent) leen aquí qué significa cada tabla `bd_*`, cada KPI del embudo y cada página de Power BI.

Índice humano: `business_logic/overview.md` y `business_logic/glossary.md`.  
Índice máquina (AIDASH): `C:\Users\Usuario\aidash-pi\performance-data-llm.txt`.

## Cómo publicar

Es un sitio Mintlify. Configuración de nav: `docs.json`. Tras cambiar markdown, el deploy sigue el flujo Mintlify de `edwardvelo-performance/docs` (último contenido útil: **2026-05-29**, sección Power BI `06_powerbi_reports/`).

Plantillas huérfanas (`essentials/`, `api-reference/`, `ai-tools/`) no están en la nav; no son documentación del negocio.

## Qué no está aquí

- Runbooks de Dataproc / Prefect / VM.
- Credenciales.
- Mapa Spark → dbt (`etl_prefect`).
- CRM corredores.
- Capa de historización (`06_historization/`): explícitamente pendiente en `overview.md`.

Hay un árbol casi gemelo en `etl_pyspark/docs/business_logic/`. Este repo es el **fork publicado** más la sección Power BI y `embudo.lsdl.yaml`.

## Si AIDASH se equivoca en un gráfico

1. Corregir la página en `business_logic/06_powerbi_reports/`.
2. Publicar Mintlify.
3. Confirmar que la URL sigue listada en `aidash-pi/performance-data-llm.txt`.
