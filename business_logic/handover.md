---
title: Handover — este sitio
description: Cómo levantar Mintlify y qué cambiar al tomar el puesto
---

# Handover — Performance Peru Data Warehouse Guide

Sitio de **lógica de negocio del ETL legacy** (Evolta + Sperant → Spark → BigQuery → Power BI). No documenta Prefect, Guardian ni el CRM de corredores.

Repo: `https://github.com/edwardvelo-performance/docs` (`main`)  
Publicado: https://performancerealstate.mintlify.app

## Al tomar el puesto — levantar

```bash
git clone https://github.com/edwardvelo-performance/docs.git
cd docs
npm i -g mintlify   # si no está
mintlify dev        # http://localhost:3000
```

También vale `npx mintlify dev`. Pedí acceso al **dashboard Mintlify** del proyecto `performancerealstate` (el deploy a producción sale de ahí / del GitHub `edwardvelo-performance/docs`).

## Qué copiar

No hay `.env` de este repo. Lo que sí hay que heredar:

| Acceso | Para qué |
|--------|----------|
| GitHub `edwardvelo-performance/docs` (write) | Editar y publicar |
| Dashboard Mintlify `performancerealstate` | Ver deploys, dominio, miembros |
| Repo `aidash-pi` (al menos lectura) | Índice `performance-data-llm.txt` que Pi usa para fetch |

## Qué cambiar cuando el puesto sea tuyo

| Qué | Dónde | Por qué |
|-----|-------|---------|
| Miembro Mintlify | dashboard del sitio | Sin eso no ves deploys ni invitás a nadie |
| `docs.json` | raíz | Nav del sitio; **hay que** tocar esto al agregar una página nueva |
| Footer GitHub | `docs.json` → `footer.socials.github` | Hoy apunta a `performanceperu`, no a `edwardvelo-performance` |
| `aidash-pi/performance-data-llm.txt` | repo AIDASH | Si creás o **renombrás** una URL; Pi no descubre páginas solas |

## Cómo publicar un cambio de negocio

1. Editá el `.md` bajo `business_logic/` (mismo path = misma URL).
2. Si es **página nueva**, agregala en `docs.json` (este archivo no se publica solo por existir).
3. Push a `main`. Mintlify rebuilda el sitio.
4. Si AIDASH debe leerla: agregá la URL absoluta `https://performancerealstate.mintlify.app/business_logic/...` en `aidash-pi/performance-data-llm.txt` y deployá AIDASH context.

## Qué no tocar el primer mes

- Paths bajo `/business_logic/` que AIDASH ya indexó. Renombrar un archivo rompe el fetch del agente.
- No documentar Prefect aquí. Eso vive en `etl_prefect/docs-site`.
- Plantillas huérfanas `essentials/`, `api-reference/`, `ai-tools/` — no están en la nav; no son docs de negocio.

## Mapa rápido de este repo

| Path | Qué es |
|------|--------|
| `business_logic/overview.md` | Arquitectura 8 capas + índice |
| `business_logic/glossary.md` | Vocabulario comercial |
| `business_logic/config_reference.md` | `config.yaml` del Spark (nombres, no secretos) |
| `01_extract` … `05_dashboard_calc` | ETL Spark → BQ |
| `06_powerbi_reports` | Modelo y gráficos (técnico) |
| `07_power_bi_sales_funnel` | Manual comercial del embudo |
| `embudo.lsdl.yaml` | Linguistic schema Power BI Copilot |
| `docs.json` | Nav + branding Mintlify |

Historización (`06_historization/`) sigue **pendiente** (lo dice `overview.md`).

Hay un árbol casi gemelo en `etl_pyspark/docs/business_logic/`. **Este repo es el publicado.** Si editás solo el de `etl_pyspark`, el sitio y AIDASH no se enteran.

## Si AIDASH se equivoca en un gráfico

1. Corregí `business_logic/06_powerbi_reports/` o `07_power_bi_sales_funnel/`.
2. Push a `main` y esperá el deploy Mintlify.
3. Confirmá que la URL sigue en `aidash-pi/performance-data-llm.txt`.
