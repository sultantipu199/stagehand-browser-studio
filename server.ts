import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import dotenv from "dotenv";
import QRCode from "qrcode";
import localtunnel from "localtunnel";
import { exec } from "child_process";
import { Stagehand } from "@browserbasehq/stagehand";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for worldwide & cross-origin access
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static(path.resolve("public")));

// Global Tunnel State (Cloudflare / Localtunnel)
let globalTunnelUrl: string | null = null;
let activeTunnelInstance: any = null;
let isTunnelStarting = false;

// Helper to discover machine's LAN IP address
function getLocalNetworkIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// Function to start Worldwide Public Tunnel (Localtunnel fixed subdomain + Cloudflare fallback)
async function startWorldwideTunnel(): Promise<string | null> {
  if (globalTunnelUrl) return globalTunnelUrl;
  if (isTunnelStarting) return null;

  isTunnelStarting = true;
  console.log("🌐 Initiating secure public tunnel for worldwide access...");

  // Option A: Primary - Localtunnel with FIXED, persistent subdomain (Never changes, no 1033 errors)
  try {
    const lt = await localtunnel({
      port: PORT,
      local_host: "127.0.0.1",
      subdomain: "stagehand-tipu",
    });

    if (lt && lt.url) {
      globalTunnelUrl = lt.url;
      activeTunnelInstance = lt;
      isTunnelStarting = false;
      console.log(`✨ Permanent Global HTTPS URL established: ${lt.url}`);
      broadcastSSE({ event: "tunnel_update", data: { publicUrl: lt.url, active: true } });

      lt.on("close", () => {
        console.log("Localtunnel closed.");
        globalTunnelUrl = null;
        activeTunnelInstance = null;
      });

      return lt.url;
    }
  } catch (err: any) {
    console.warn(`Localtunnel notice: ${err.message || err}. Trying Cloudflare tunnel...`);
  }

  // Option B: Fallback - Cloudflare Quick Tunnel via untun
  try {
    const untun = await import("untun");
    const tunnel = await untun.startTunnel({
      port: PORT,
      hostname: "127.0.0.1",
      url: `http://127.0.0.1:${PORT}`,
      acceptCloudflareNotice: true,
    });
    const url = await tunnel.getURL();
    if (url) {
      globalTunnelUrl = url;
      activeTunnelInstance = tunnel;
      isTunnelStarting = false;
      console.log(`✨ Cloudflare Global HTTPS URL established: ${url}`);
      broadcastSSE({ event: "tunnel_update", data: { publicUrl: url, active: true } });
      return url;
    }
  } catch (err: any) {
    console.error(`Tunnel error: ${err.message || err}`);
  }

  isTunnelStarting = false;
  return null;
}

async function stopWorldwideTunnel() {
  if (activeTunnelInstance) {
    try {
      if (typeof activeTunnelInstance.close === "function") {
        await activeTunnelInstance.close();
      }
    } catch {
      // ignore
    }
    activeTunnelInstance = null;
    globalTunnelUrl = null;
    console.log("🛑 Public tunnel stopped.");
    broadcastSSE({ event: "tunnel_update", data: { publicUrl: null, active: false } });
  }
}

// Automation Execution State
let activeStagehand: Stagehand | null = null;
let isRunning = false;
let currentTaskInfo = {
  url: "",
  instruction: "",
  mode: "act",
  startedAt: "",
};

// SSE Client list
let sseClients: express.Response[] = [];

function broadcastSSE(data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Client disconnected
    }
  });
}

function logEvent(message: string, type: "info" | "action" | "ai" | "success" | "warn" | "error" = "info", details?: any) {
  const entry = {
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
    details: details ? (typeof details === "object" ? JSON.stringify(details, null, 2) : String(details)) : undefined,
  };
  console.log(`[${entry.type.toUpperCase()}] ${entry.message}`);
  broadcastSSE({ event: "log", data: entry });
}

// Keep-alive heartbeat every 15s
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(": keepalive\n\n");
    } catch {
      // ignore
    }
  });
}, 15000);

function resolveModel() {
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || "").trim();

  if (geminiKey && geminiKey !== "..." && !geminiKey.startsWith("sk-")) {
    return {
      provider: "Google Gemini (gemini-3.5-flash)",
      config: {
        modelName: "google/gemini-3.5-flash",
        apiKey: geminiKey,
      },
    };
  }

  if (openaiKey && openaiKey !== "sk-..." && openaiKey !== "") {
    return {
      provider: "OpenAI (gpt-4o)",
      config: {
        modelName: "gpt-4o",
        apiKey: openaiKey,
      },
    };
  }

  if (anthropicKey && anthropicKey !== "sk-ant-..." && anthropicKey !== "") {
    return {
      provider: "Anthropic (claude-3-5-sonnet)",
      config: {
        modelName: "claude-3-5-sonnet-latest",
        apiKey: anthropicKey,
      },
    };
  }

  return {
    provider: "No Active Key",
    config: {
      modelName: "gpt-4o",
      apiKey: "sk-...",
    },
  };
}

// Network info & Dynamic QR code endpoint
app.get("/api/network-info", async (req, res) => {
  const ip = getLocalNetworkIp();
  const localUrl = `http://localhost:${PORT}`;
  const lanUrl = `http://${ip}:${PORT}`;
  const effectiveUrl = globalTunnelUrl || lanUrl;

  try {
    const qrCode = await QRCode.toDataURL(effectiveUrl, {
      margin: 2,
      width: 280,
      color: {
        dark: "#090d16",
        light: "#ffffff",
      },
    });

    res.json({
      ip,
      port: PORT,
      localUrl,
      lanUrl,
      publicUrl: globalTunnelUrl,
      activeUrl: effectiveUrl,
      isTunnelActive: Boolean(globalTunnelUrl),
      qrCode,
    });
  } catch (err: any) {
    res.json({
      ip,
      port: PORT,
      localUrl,
      lanUrl,
      publicUrl: globalTunnelUrl,
      activeUrl: effectiveUrl,
      isTunnelActive: Boolean(globalTunnelUrl),
      qrCode: null,
      error: err.message,
    });
  }
});

// Toggle Worldwide Public Tunnel endpoint
app.post("/api/tunnel/toggle", async (req, res) => {
  if (globalTunnelUrl) {
    await stopWorldwideTunnel();
    res.json({ success: true, active: false, publicUrl: null });
  } else {
    const url = await startWorldwideTunnel();
    res.json({ success: true, active: Boolean(url), publicUrl: url });
  }
});

// SSE endpoint
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  sseClients.push(res);
  const clientIp = req.socket.remoteAddress || "Client";
  logEvent(`Connected client: ${clientIp}`, "info");

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});

// Status endpoint
app.get("/api/status", (req, res) => {
  const modelInfo = resolveModel();
  res.json({
    isRunning,
    provider: modelInfo.provider,
    task: isRunning ? currentTaskInfo : null,
    isTunnelActive: Boolean(globalTunnelUrl),
    publicUrl: globalTunnelUrl,
  });
});

function smartResolveTargetUrl(rawUrl?: string, instruction?: string): string {
  if (rawUrl && rawUrl.trim()) {
    let clean = rawUrl.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    return clean;
  }

  const text = (instruction || "").toLowerCase();
  if (text.includes("youtube") || text.includes("ইউটিউব")) return "https://www.youtube.com";
  if (text.includes("daraz") || text.includes("দারাজ")) return "https://www.daraz.com.bd";
  if (text.includes("prothomalo") || text.includes("প্রথম আলো") || text.includes("সংবাদ") || text.includes("খবর")) return "https://www.prothomalo.com";
  if (text.includes("facebook") || text.includes("ফেসবুক")) return "https://www.facebook.com";
  if (text.includes("wikipedia") || text.includes("উইকিপিডিয়া")) return "https://en.wikipedia.org";
  if (text.includes("github") || text.includes("গিটহাব")) return "https://github.com";

  const domainMatch = text.match(/([a-z0-9\-]+\.(?:com|org|net|bd|io|co|gov))/i);
  if (domainMatch) {
    return `https://${domainMatch[1]}`;
  }

  return "https://www.google.com";
}

// Run automation endpoint
app.post("/api/run", async (req, res) => {
  if (isRunning) {
    return res.status(400).json({ error: "বর্তমানে আরেকটি অটোমেশন কাজ চলছে (Another task is currently running)." });
  }

  let { url, instruction, mode = "act", headless = false } = req.body;

  if (!instruction || !instruction.trim()) {
    return res.status(400).json({ error: "অনুগ্রহ করে আপনি কী করাতে চান তা লিখুন (AI instruction is required)." });
  }

  // Smart URL deduction if URL was left blank or empty
  url = smartResolveTargetUrl(url, instruction);

  const { provider, config: modelConfig } = resolveModel();
  if (provider === "No Active Key") {
    return res.status(400).json({ error: "No valid API key detected. Please add your key in .env or Settings." });
  }

  isRunning = true;
  currentTaskInfo = {
    url,
    instruction,
    mode,
    startedAt: new Date().toLocaleTimeString(),
  };

  res.json({ success: true, message: "Automation started", task: currentTaskInfo });

  // Run asynchronously and stream logs
  (async () => {
    try {
      logEvent(`Starting task: Mode [${mode.toUpperCase()}] on ${url}`, "info");
      logEvent(`AI Provider: ${provider}`, "ai");

      activeStagehand = new Stagehand({
        env: "LOCAL",
        localBrowserLaunchOptions: {
          headless: Boolean(headless),
        },
        model: modelConfig as any,
        verbose: 1,
        logger: (logLine) => {
          if (logLine.message && !logLine.message.includes("heartbeat")) {
            logEvent(`[Stagehand CDP] ${logLine.message}`, "info");
          }
        },
      });

      logEvent("Launching local Chrome browser...", "info");
      await activeStagehand.init();
      logEvent("Browser launched successfully!", "success");

      const page = activeStagehand.context.activePage() || activeStagehand.context.pages()[0] || (activeStagehand as any).page;
      if (!page) {
        throw new Error("Unable to obtain active browser page from Stagehand context.");
      }

      logEvent(`Navigating to ${url}...`, "action");
      await page.goto(url);
      logEvent(`Successfully loaded: ${url}`, "success");

      let taskResult: any = null;

      if (mode === "extract") {
        logEvent(`Running stagehand.extract(): "${instruction}"`, "ai");
        taskResult = await activeStagehand.extract(instruction);
        logEvent("Extraction complete!", "success", taskResult);
      } else if (mode === "observe") {
        logEvent(`Running stagehand.observe(): "${instruction}"`, "ai");
        taskResult = await activeStagehand.observe(instruction);
        logEvent("Observation complete!", "success", taskResult);
      } else {
        logEvent(`Running stagehand.act(): "${instruction}"`, "ai");
        taskResult = await activeStagehand.act(instruction);
        logEvent("Act executed!", "success");

        if (/search|type.*enter/i.test(instruction)) {
          try {
            await activeStagehand.act("Press Enter or click the Search button to display the results");
          } catch {
            // Already navigated
          }
        }
      }

      logEvent("Task execution finished successfully!", "success");
      broadcastSSE({ event: "task_complete", data: { result: taskResult } });

      logEvent("Pausing 5 seconds for visual review...", "info");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err: any) {
      logEvent(`Error during automation: ${err.message || err}`, "error");
      broadcastSSE({ event: "task_error", data: { error: err.message || String(err) } });
    } finally {
      if (activeStagehand) {
        logEvent("Cleaning up and closing browser...", "info");
        try {
          await activeStagehand.close();
        } catch {
          // ignore
        }
        activeStagehand = null;
      }
      isRunning = false;
      logEvent("Browser closed. Ready for next task.", "info");
      broadcastSSE({ event: "status_change", data: { isRunning: false } });
    }
  })();
});

// Stop automation endpoint
app.post("/api/stop", async (req, res) => {
  if (!isRunning || !activeStagehand) {
    return res.json({ message: "No active automation running." });
  }

  logEvent("Stop command received from user. Closing browser...", "warn");
  try {
    await activeStagehand.close();
    activeStagehand = null;
  } catch (err: any) {
    logEvent(`Error while closing: ${err.message}`, "warn");
  }

  isRunning = false;
  broadcastSSE({ event: "status_change", data: { isRunning: false } });
  res.json({ success: true, message: "Automation stopped." });
});

// Update settings endpoint
app.post("/api/settings", (req, res) => {
  const { geminiKey, openaiKey, anthropicKey } = req.body;
  const envPath = path.resolve(".env");
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  if (geminiKey) {
    process.env.GEMINI_API_KEY = geminiKey;
    process.env.GOOGLE_API_KEY = geminiKey;
    if (content.includes("GEMINI_API_KEY=")) {
      content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${geminiKey}"`);
    } else {
      content += `\nGEMINI_API_KEY="${geminiKey}"\n`;
    }
  }

  if (openaiKey) {
    process.env.OPENAI_API_KEY = openaiKey;
    if (content.includes("OPENAI_API_KEY=")) {
      content = content.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY="${openaiKey}"`);
    } else {
      content += `\nOPENAI_API_KEY="${openaiKey}"\n`;
    }
  }

  if (anthropicKey) {
    process.env.ANTHROPIC_API_KEY = anthropicKey;
    if (content.includes("ANTHROPIC_API_KEY=")) {
      content = content.replace(/ANTHROPIC_API_KEY=.*/g, `ANTHROPIC_API_KEY="${anthropicKey}"`);
    } else {
      content += `\nANTHROPIC_API_KEY="${anthropicKey}"\n`;
    }
  }

  fs.writeFileSync(envPath, content, "utf8");
  logEvent("API Settings updated successfully", "success");
  res.json({ success: true, model: resolveModel().provider });
});

// Start Server on 0.0.0.0 and optionally auto-initialize worldwide tunnel
const lanIp = getLocalNetworkIp();
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`\n========================================================================`);
  console.log(`🚀 STAGEHAND AI STUDIO - LIVE CONTROLLER`);
  console.log(`💻 Local Desktop Access:  http://localhost:${PORT}`);
  console.log(`🏠 Same Wi-Fi Access:     http://${lanIp}:${PORT}`);
  console.log(`========================================================================`);

  // Auto-launch default browser on desktop
  if (process.env.AUTO_OPEN_BROWSER !== "false") {
    const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
    exec(`${openCmd} http://localhost:${PORT}`);
    console.log(`🖥️ Desktop browser launched: http://localhost:${PORT}`);
  }

  // Proactively start Worldwide Public HTTPS Tunnel
  const publicUrl = await startWorldwideTunnel();
  if (publicUrl) {
    console.log(`🌍 WORLDWIDE INTERNET URL: ${publicUrl}`);
    console.log(`📱 Use this URL from ANY phone on 4G/5G or any Wi-Fi in the world!`);
    console.log(`========================================================================\n`);
  }
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`\n⚠️ Port ${PORT} is already in use by another running instance.`);
    console.log(`🌐 Opening existing browser studio at: http://localhost:${PORT}\n`);
    const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
    exec(`${openCmd} http://localhost:${PORT}`);
  } else {
    console.error("Server error:", err);
  }
});
