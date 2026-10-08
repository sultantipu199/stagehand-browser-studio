# Stagehand Autonomous Browser Automation & Studio GUI

This project provides autonomous browser automation using **Stagehand** by Browserbase running locally on the user's machine, featuring both a CLI runner and an interactive **Web Studio GUI**.

## Architecture & Tech Stack
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript (`tsx` execution engine)
- **Browser Automation**: `@browserbasehq/stagehand` (CDP-backed local Chrome execution)
- **Backend Server**: Express with Server-Sent Events (SSE) for live streaming telemetry
- **Frontend GUI**: Vanilla HTML5, CSS3 (Glassmorphism & Cybernetic Dark UI), and JavaScript
- **Environment Management**: `dotenv` (`.env` file)
- **Execution Mode**: `env: 'LOCAL'` (direct local Chrome control)
- **AI Model**: Google Gemini (`gemini-3.5-flash`), with OpenAI and Anthropic fallbacks

## Development Commands
- `npm run gui`: Starts the interactive Web Studio GUI on `http://localhost:3000`
- `npm start`: Execute CLI automation script via `tsx index.ts`
- `npm run build`: Compile TypeScript with `tsc`
- `npm run typecheck`: Type-check codebase with `tsc --noEmit`
- `run-gui.bat`: 1-click Windows desktop/folder launcher for the Web GUI
- `run.bat`: 1-click Windows launcher for the CLI script
