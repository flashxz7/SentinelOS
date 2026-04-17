Risk Engine
===========

Scores incidents, generates alerts, and explains model features to operators.

Responsibilities
----------------
- Assemble features from events, weather, and context layers
- Run risk models and emit scores
- Provide explanations for audit

Interface Outline
-----------------
POST /v1/risk/score
GET  /v1/risk/score/{ticket_id}
