SentinelOS
==========

SentinelOS is an incident operations console for coordinating aerial response, ground teams, and risk analytics in fast-moving events. The web client presents a live map, mission ticketing, and a telemetry pipeline in a single workspace.

Key Capabilities
----------------
- Live incident map with zones, sensor overlays, and moving drone markers.
- Mission tickets with SLA, pipeline status, evidence thumbnails, and chain-of-custody metadata.
- Fleet and weather panels for at-a-glance operational state.
- Scenario switching to compare response modes without leaving the workspace.

Project Structure
-----------------
- index.html
- src/ (console UI)
- assets/ (ticket images)
- scripts/ (image generation tools)
- apps/ (future app surfaces)
- services/ (backend service stubs)
- packages/ (shared libraries)
- infra/ (deployment and observability)
- docs/ (product docs and slides)

Run Locally
-----------
Open index.html in a browser.
If the browser blocks local assets, run a local server:
- python -m http.server 5173
- then visit http://localhost:5173

Configuration
-------------
See CONFIGURATION.md for environment variables and generator settings.

Documentation
-------------
- ARCHITECTURE.md
- STRUCTURE.md
- WORKFLOWS.md
- docs/deck/SLIDES.md
- docs/legacy/README.md (archived single file prototype)

Deploy to Vercel
----------------
- Import the folder into Vercel
- Framework preset: Other
- Build command: (leave empty)
- Output directory: (leave empty)

Vercel will serve index.html as the entry point.
