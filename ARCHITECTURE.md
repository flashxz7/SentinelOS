Architecture Overview
=====================

SentinelOS is built around a streaming core that turns raw sensor signals into
operator ready tickets, with a single console to execute decisions fast.

Core Flow
---------
1) Ingest Gateway authenticates devices and normalizes payloads.
2) Telemetry Stream fans out events to services and clients.
3) Risk Engine scores incidents and produces explanations.
4) Mission Orchestrator creates tickets, assigns assets, and tracks SLAs.
5) Console Web renders the live map, tickets, and workflows for operators.

Data and Evidence
-----------------
Media and chain of custody are handled by Evidence Vault, while shared schema
contracts live in packages/events for consistency across services and apps.

Operational Footprint
---------------------
Services run on Kubernetes, infrastructure is managed by Terraform, and
observability is covered by dashboards, alerts, and runbooks in infra/observability.
