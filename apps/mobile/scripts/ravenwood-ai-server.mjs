import http from "node:http";

const PORT = Number(process.env.RAVENWOOD_AI_PORT ?? 8787);
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: {
      type: "string",
      description: "The in-game GM/resident response shown to the player. One to three vivid, relevant sentences."
    },
    trustDelta: {
      type: "number",
      description: "Small trust adjustment for the addressed resident, usually between -4 and 4."
    },
    romanceDelta: {
      type: "number",
      description: "Small romance adjustment, usually 0 unless the player is flirting."
    },
    revealRomance: {
      type: "boolean",
      description: "Whether the interaction should reveal the romance meter."
    }
  },
  required: ["text", "trustDelta", "romanceDelta", "revealRomance"]
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 80_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function cors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(response, status, payload) {
  cors(response);
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const chunks = [];
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function normalizeReply(raw) {
  const parsed = JSON.parse(raw);
  return {
    text: String(parsed.text ?? "").trim().slice(0, 900),
    trustDelta: Math.max(-10, Math.min(10, Math.round(Number(parsed.trustDelta ?? 0)))),
    romanceDelta: Math.max(-8, Math.min(8, Math.round(Number(parsed.romanceDelta ?? 0)))),
    revealRomance: Boolean(parsed.revealRomance)
  };
}

async function generateRavenwoodReply(packet) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: "OPENAI_API_KEY is not set. The game will use its fallback writer." };
  }

  const targetName = packet.targetResident?.name ?? "the mansion";
  const developerInstructions = [
    "You are the AI conversation engine for Detective Chronicles: Ravenwood Hotel Mansion.",
    "Write dynamic in-game responses, not canned text and not setting exposition.",
    "Always answer the player's actual input first. If the player asks 'who do you trust?', answer that question from the resident's perspective.",
    "If targetResident is present, embody that resident. Use their trust, role, secrets, relationships, intoxication, and current situation.",
    "Low trust means evasive, clipped, defensive, or politely withholding. High trust can be more candid, but still human and cautious.",
    "Drunk, tipsy, or high states may color delivery, but do not mention them unless it naturally affects this answer.",
    "Do not mention detective quirks, hobbies, origin, clothing, or visible traits unless the player action directly makes them relevant.",
    "Do not recite Ravenwood's premise, founding date, or generic hotel description unless the player directly asks about the mansion.",
    "Use hiddenTruthForConsistency only to stay consistent. Do not reveal undiscovered killer/proof unless the knownCaseState plus trust makes it plausible as a hint.",
    "Keep the answer playable: one to three sentences, clear, atmospheric, and specific.",
    "Return only JSON matching the schema."
  ].join("\n");

  const userContent = JSON.stringify({
    task: `Generate ${targetName}'s Ravenwood response to the player.`,
    packet
  });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      max_output_tokens: 420,
      input: [
        { role: "developer", content: developerInstructions },
        { role: "user", content: userContent }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ravenwood_reply",
          schema: responseSchema,
          strict: true
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return { error: data.error?.message ?? `OpenAI request failed with status ${response.status}` };
  }
  return normalizeReply(extractOutputText(data));
}

const server = http.createServer(async (request, response) => {
  cors(response);
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  if (request.method === "GET" && request.url === "/health") {
    json(response, 200, {
      ok: true,
      model: MODEL,
      hasApiKey: Boolean(process.env.OPENAI_API_KEY)
    });
    return;
  }
  if (request.method !== "POST" || request.url !== "/ravenwood-chat") {
    json(response, 404, { error: "Not found" });
    return;
  }
  try {
    const rawBody = await readBody(request);
    const packet = JSON.parse(rawBody);
    const reply = await generateRavenwoodReply(packet);
    if (reply.error) {
      json(response, 503, reply);
      return;
    }
    json(response, 200, reply);
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : "Unknown AI server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Ravenwood AI server listening on http://localhost:${PORT}`);
  console.log(process.env.OPENAI_API_KEY ? `Using model ${MODEL}` : "OPENAI_API_KEY is missing; /ravenwood-chat will return fallback status.");
});
