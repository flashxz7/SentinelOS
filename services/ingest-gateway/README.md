Ingest Gateway
==============

Edge entry point for drones, IoT sensors, and partner feeds. Handles auth,
rate limits, and payload normalization.

Responsibilities
----------------
- Validate device identity and request signatures
- Normalize payloads into common event schema
- Publish to telemetry stream

Interface Outline
-----------------
POST /v1/ingest/events
POST /v1/ingest/media
