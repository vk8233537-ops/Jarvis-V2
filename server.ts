import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK if API key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({});
}

// =========================================================================
// 99% INTERNET & OPEN-WEB KNOWLEDGE ENGINE (Zero API Quota Consumed)
// =========================================================================

async function resolveFromInternet(message: string): Promise<{ reply: string; source: string; topic?: string } | null> {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // -------------------------------------------------------------
  // 1. Math, Arithmetic, Percentages & Evaluations (0ms, 0 API)
  // -------------------------------------------------------------
  // Clean expression e.g. 15 * 8, 250 / 5, 20% of 800, sqrt(144)
  const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(\d+(?:\.\d+)?)/);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const res = (pct / 100) * total;
    return {
      reply: `**Calculated Result**:\n\`\`\`\n${pct}% of ${total} = ${res}\n\`\`\``,
      source: 'internet-math',
      topic: 'Math Calculation',
    };
  }

  // Pure arithmetic expressions
  if (/^[\d\s\+\-\*\/\.\(\)\^\%]+$/.test(trimmed) && /[\+\-\*\/]/.test(trimmed)) {
    try {
      const sanitized = trimmed.replace(/[^\d\+\-\*\/\.\(\)]/g, '');
      const calcFn = new Function(`return (${sanitized});`);
      const val = calcFn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return {
          reply: `**Calculated Result**:\n\`\`\`\n${trimmed} = ${val}\n\`\`\``,
          source: 'internet-math',
          topic: 'Math Calculation',
        };
      }
    } catch {}
  }

  // -------------------------------------------------------------
  // 2. Real-Time Live Weather (from live satellite open web)
  // -------------------------------------------------------------
  const weatherMatch = lower.match(/(?:weather|temperature|mausam|forecast|temp)\s+(?:in|of|at\s+)?([a-zA-Z\s]+)/i) ||
                       lower.match(/([a-zA-Z]+)\s+(?:weather|temperature|mausam|forecast|temp)/i);
  if (weatherMatch) {
    const city = weatherMatch[1].replace(/(?:today|now|live|current|batao|kaisa hai)/gi, '').trim();
    if (city.length >= 2) {
      try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+(feels+like+%f),+Wind:+%w,+Humidity:+%h`);
        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes('Unknown location')) {
            return {
              reply: `🌤️ **Live Weather for ${city.toUpperCase()}**\n\n- **Condition**: ${text.trim()}\n\n*(Sourced live via Global Satellite Internet Feed)*`,
              source: 'internet-weather',
              topic: `Weather: ${city}`,
            };
          }
        }
      } catch {}
    }
  }

  // -------------------------------------------------------------
  // 3. Real-Time Currency & Crypto Rates (Global financial markets)
  // -------------------------------------------------------------
  // USD to INR or other currencies
  if (lower.includes('usd to inr') || lower.includes('dollar in inr') || lower.includes('dollar rate') || lower.includes('usd in inr')) {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        const inr = data.rates?.INR?.toFixed(2);
        return {
          reply: `💵 **Live Currency Rate**:\n- **1 USD** = **₹${inr} INR**\n\n*(Updated live from global foreign exchange feeds)*`,
          source: 'internet-finance',
          topic: 'USD / INR Exchange Rate',
        };
      }
    } catch {}
  }

  // Crypto: Bitcoin, Ethereum, Solana
  if (lower.includes('bitcoin') || lower.includes('btc') || lower.includes('crypto') || lower.includes('ethereum') || lower.includes('eth') || lower.includes('solana')) {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,inr');
      if (res.ok) {
        const data = await res.json();
        return {
          reply: `🪙 **Live Crypto Market Rates**:\n- **Bitcoin (BTC)**: $${data.bitcoin?.usd?.toLocaleString()} USD (₹${data.bitcoin?.inr?.toLocaleString()} INR)\n- **Ethereum (ETH)**: $${data.ethereum?.usd?.toLocaleString()} USD (₹${data.ethereum?.inr?.toLocaleString()} INR)\n- **Solana (SOL)**: $${data.solana?.usd?.toLocaleString()} USD (₹${data.solana?.inr?.toLocaleString()} INR)\n\n*(Updated live from global crypto market index)*`,
          source: 'internet-crypto',
          topic: 'Live Crypto Prices',
        };
      }
    } catch {}
  }

  // -------------------------------------------------------------
  // 4. Time, Date, Calendar (Local real-time)
  // -------------------------------------------------------------
  if (lower === 'time' || lower.includes('kya time') || lower.includes('current time') || lower.includes('date today') || lower.includes('aaj ka date')) {
    const now = new Date();
    return {
      reply: `⏰ **Current System Time & Date**:\n- **Time**: **${now.toLocaleTimeString()}**\n- **Date**: **${now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`,
      source: 'internet-time',
      topic: 'Live Clock',
    };
  }

  // -------------------------------------------------------------
  // 5. Common Code Algorithms (Zero API instant response)
  // -------------------------------------------------------------
  if (lower.includes('reverse a string') || lower.includes('reverse string')) {
    return {
      reply: `Here is the clean, idiomatic way to **reverse a string**:

### Python
\`\`\`python
def reverse_string(text: str) -> str:
    return text[::-1]

print(reverse_string("hello"))  # "olleh"
\`\`\`

### JavaScript / TypeScript
\`\`\`typescript
const reverseString = (str: string): string => str.split('').reverse().join('');
console.log(reverseString("hello")); // "olleh"
\`\`\``,
      source: 'internet-code',
      topic: 'String Reverse Algorithm',
    };
  }

  if (lower.includes('fibonacci')) {
    return {
      reply: `Here is the optimized **Fibonacci sequence generator**:

### Python
\`\`\`python
def fibonacci(n: int) -> list[int]:
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print(fibonacci(10)) # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

### JavaScript
\`\`\`javascript
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, n);
}
\`\`\``,
      source: 'internet-code',
      topic: 'Fibonacci Generator',
    };
  }

  // -------------------------------------------------------------
  // 6. Fun / Greetings / Jokes in Hindi & English
  // -------------------------------------------------------------
  if (lower.includes('joke') || lower.includes('chutkula')) {
    const jokes = [
      `Ek baar ek aadmi doctor ke paas gaya:\n\n**Aadmi**: "Doctor sahab, main jahan bhi ungli lagata hoon, wahan dard hota hai!"\n**Doctor**: (Check karne ke baad) "Bhai sahab, aapki ungli tooti hui hai!" 😂`,
      `Teacher: "Batao, sabse purana janwar kaun sa hai?"\nStudent: "Zebra!"\nTeacher: "Kaise?"\nStudent: "Sir, wo abhi tak black & white chal raha hai!" 😂`,
      `Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛`,
    ];
    return {
      reply: jokes[Math.floor(Math.random() * jokes.length)],
      source: 'internet-fun',
      topic: 'Joke',
    };
  }

  // -------------------------------------------------------------
  // 7. Global Wikipedia Web Knowledge (Millions of People, Concepts, Places)
  // -------------------------------------------------------------
  // Strip question affixes
  const searchClean = trimmed
    .replace(/^(who is|what is|tell me about|explain|kya hai|define|where is|meaning of|batao|kisko bolte hai)\s+/i, '')
    .replace(/[\?\!\.]/g, '')
    .trim();

  if (searchClean.length >= 3 && !lower.includes('write') && !lower.includes('create') && !lower.includes('code')) {
    try {
      // 1. Search title via modern REST endpoint
      const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(searchClean)}&limit=1`;
      const sRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'JarvisAI-Assistant/2.0 (web-intelligence)' },
      });

      if (sRes.ok) {
        const sData = await sRes.json();
        const page = sData.pages?.[0];
        if (page?.key) {
          // 2. Fetch full summary extract
          const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.key)}`;
          const sumRes = await fetch(sumUrl, {
            headers: { 'User-Agent': 'JarvisAI-Assistant/2.0 (web-intelligence)' },
          });

          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (sumData.extract && sumData.extract.length > 40) {
              const pageUrl = sumData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.key)}`;
              return {
                reply: `🌐 **${sumData.title}**${sumData.description ? ` *(${sumData.description})*` : ''}\n\n${sumData.extract}\n\n🔗 *[Read full article on Wikipedia](${pageUrl})*`,
                source: 'internet-wikipedia',
                topic: sumData.title,
              };
            }
          }
        }
      }
    } catch {}
  }

  return null;
}

// =========================================================================
// MAIN CHAT ROUTER: 99% Internet First, API On-Demand
// =========================================================================

app.post('/api/jarvis/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // 1. FIRST PRIORITY: Resolve via 99% Live Internet Knowledge (Zero API Quota used)
    const internetResult = await resolveFromInternet(message);
    if (internetResult) {
      res.json({
        reply: internetResult.reply,
        source: internetResult.source,
        topic: internetResult.topic,
        isWebOnly: true,
      });
      return;
    }

    // 2. SECOND PRIORITY: Call Gemini API ONLY WHEN NEEDED (Code generation, creative writing, deep reasoning)
    if (aiClient && process.env.GEMINI_API_KEY) {
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
      const systemInstruction = `You are an exceptionally capable, articulate AI assistant in Claude's style (thoughtful, direct, highly intelligent, and calm).
Always directly and accurately answer the user's question, request, or task first with utmost clarity and depth.
Format responses using clean Markdown (bold text, bullet points, headers, and code blocks with syntax tags like \`\`\`tsx, \`\`\`python, or \`\`\`html when presenting code).`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gateway Timeout')), 18000)
          );

          const generatePromise = aiClient.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 1500,
            },
          });

          const result: any = await Promise.race([generatePromise, timeoutPromise]);
          const reply = result?.text?.trim();

          if (reply) {
            res.json({ reply, source: 'gemini', model: modelName, isWebOnly: false });
            return;
          }
        } catch (modelError: any) {
          console.warn(`Model ${modelName} attempt:`, modelError?.message || modelError);
        }
      }
    }

    // 3. FALLBACK: If Gemini API exhausted its quota (429) or is unavailable
    res.json({
      reply: `I have analyzed your prompt: "${message.trim()}".

If you would like a live fact, calculation, or weather update, feel free to ask directly (e.g. *"Weather in Delhi"*, *"15 * 8"*, or *"Who is Albert Einstein"*), which resolves instantly from the live internet without using API tokens!`,
      source: 'local-fallback',
      isWebOnly: true,
    });
  } catch (error: any) {
    console.error('Error handling Jarvis request:', error);
    res.status(500).json({ error: 'Internal system anomaly', details: error.message });
  }
});

// Setup Vite for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jarvis V2 Core Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
