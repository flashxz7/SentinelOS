Operational Workflows
=====================

Detection to Dispatch
---------------------
A sensor event becomes a detection, is scored for risk, and is promoted into a
mission ticket that can be dispatched to a drone or ground team.

Signal -> Score -> Ticket -> Dispatch -> Resolve

Evidence and Chain of Custody
-----------------------------
Captured media is hashed at ingestion, stored in Evidence Vault, and all access
is logged so investigations can trace every action.

Capture -> Hash -> Store -> Audit -> Share

Field Response Loop
-------------------
Responders accept assignments, follow route guidance, and sync evidence when
connectivity returns, keeping the console in a live state.

Assign -> Navigate -> Confirm -> Sync

Post Incident Review
--------------------
After resolution, the system compiles the timeline, attachments, and outcomes
into a report for internal review and compliance.
