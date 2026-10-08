# Stagehand Automation & Studio Guidelines for Claude Code

## Project Scope
Autonomous browser automation using `@browserbasehq/stagehand` running in `LOCAL` mode with interactive Web Studio GUI.

## Architecture
- `server.ts`: Express + SSE backend coordinating Stagehand runs and streaming live logs.
- `public/`: Web Studio GUI (HTML, CSS, JS).
- `index.ts`: Direct CLI runner.
- `run-gui.bat` & `run.bat`: 1-click execution batch scripts.

## Standards
- Clean shutdown on process exit (`stagehand.close()`).
- Error handling with real-time SSE broadcasts.
- Support multi-provider API keys dynamically via `.env` or settings modal.
