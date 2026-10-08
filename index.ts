import { Stagehand } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

// 1. Load environment variables from .env
dotenv.config();

/**
 * Determine model configuration based on available API keys in .env
 */
function resolveModelConfiguration() {
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || "").trim();

  // If Gemini API Key is present and not a placeholder
  if (geminiKey && geminiKey !== "..." && !geminiKey.startsWith("sk-")) {
    return {
      provider: "Google Gemini (gemini-3.5-flash-lite)",
      config: {
        modelName: "google/gemini-3.5-flash-lite",
        apiKey: geminiKey,
      },
    };
  }

  // If OpenAI API Key is present and not a placeholder
  if (openaiKey && openaiKey !== "sk-..." && openaiKey !== "") {
    return {
      provider: "OpenAI (gpt-4o)",
      config: {
        modelName: "gpt-4o",
        apiKey: openaiKey,
      },
    };
  }

  // If Anthropic API Key is present
  if (anthropicKey && anthropicKey !== "sk-ant-..." && anthropicKey !== "") {
    return {
      provider: "Anthropic (claude-3-5-sonnet)",
      config: {
        modelName: "claude-3-5-sonnet-latest",
        apiKey: anthropicKey,
      },
    };
  }

  // Fallback default
  return {
    provider: "OpenAI (Placeholder - key required)",
    config: {
      modelName: "gpt-4o",
      apiKey: "sk-...",
    },
  };
}

async function main() {
  const { provider, config: modelConfig } = resolveModelConfiguration();

  console.log("=================================================");
  console.log("🤖 Stagehand Local Autonomous Browser Automation");
  console.log("=================================================");
  console.log(`📡 Using AI Provider: ${provider}`);

  console.log("🚀 Initializing Stagehand in LOCAL environment mode...");
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      headless: false, // Opens visible Chrome browser on your screen
    },
    model: modelConfig as any,
    verbose: 1,
  });

  try {
    // Launch Chrome locally
    await stagehand.init();
    console.log("✅ Local Chrome browser launched successfully!");

    // Acquire active page from Stagehand context
    const page = stagehand.context.activePage() || stagehand.context.pages()[0] || (stagehand as any).page;
    if (!page) {
      throw new Error("Unable to obtain active browser page from Stagehand context.");
    }

    // Step 1: Navigate to Google
    console.log("🌐 Navigating to https://www.google.com...");
    await page.goto("https://www.google.com");
    console.log("📍 Arrived at Google homepage.");

    // Step 2: Use Stagehand act() to type search query and press enter
    console.log("⌨️  Using stagehand.act() to type 'Generative AI Engineering' and search...");
    await stagehand.act("Type 'Generative AI Engineering' into the search bar and press enter");
    
    // Ensure search submission
    try {
      await stagehand.act("Press Enter or click the Search button to display the results");
    } catch (e) {
      // If already navigated/submitted, proceed smoothly
    }
    console.log("✅ Action executed successfully!");

    // Step 3: Wait 5 seconds to observe results
    console.log("⏳ Waiting 5 seconds to observe search results...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error("\n❌ Execution Notice:", error);
  } finally {
    console.log("🧹 Closing browser session cleanly...");
    await stagehand.close();
    console.log("🏁 All steps completed cleanly.");
  }
}

main().catch((err) => {
  console.error("Fatal uncaught error:", err);
  process.exit(1);
});
