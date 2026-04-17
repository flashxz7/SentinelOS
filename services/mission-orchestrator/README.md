Mission Orchestrator
====================

Owns ticket lifecycle, SLAs, assignments, and dispatch logic.

Responsibilities
----------------
- Create and transition tickets
- Assign assets and teams
- Track SLA timers and escalation

Interface Outline
-----------------
POST /v1/tickets
PATCH /v1/tickets/{ticket_id}
POST /v1/dispatch
