Repository Structure
====================

This repo contains the current SentinelOS console prototype plus a product ready
skeleton that shows how a full system would be organized.

Root UI
-------
The active UI is the static console served from index.html with logic in src/.

Apps
----
- apps/console-web: Web console for operators and supervisors.
- apps/command-center: Desktop packaging with offline cache and secure storage.
- apps/responder-mobile: Field app for tasking, navigation, and evidence capture.

Services
--------
- services/ingest-gateway: Device and partner feed ingress.
- services/telemetry-stream: Streaming backbone for live events.
- services/risk-engine: Scoring and explainability for alerts.
- services/mission-orchestrator: Ticket lifecycle and dispatch logic.
- services/evidence-vault: Secure media storage and audit trails.
- services/notifications: SMS, email, and in app alert routing.

Packages
--------
- packages/ui-kit: Shared UI components and tokens.
- packages/geo-core: Geospatial utilities and zone math.
- packages/events: Shared event schemas and validation.

Infra
-----
- infra/kubernetes: Cluster manifests and service deployment.
- infra/terraform: Infrastructure as code and cloud resources.
- infra/observability: Metrics, tracing, and on call runbooks.

Docs
----
- docs/deck/SLIDES.md: Slide narrative and workflow outline.
- docs/legacy/: Archived single file prototypes.
