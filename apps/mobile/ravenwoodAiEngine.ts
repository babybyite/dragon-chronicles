import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

export type RavenwoodAiMode = "offline" | "remote" | "scripted";

export type RavenwoodValidatedAiReply = {
  text: string;
  trustDelta: number;
  romanceDelta: number;
  revealRomance: boolean;
  summary?: string;
  memoryWrites: string[];
  mode: RavenwoodAiMode;
};

export type RavenwoodModelStatus = {
  platform: string;
  nativeCapable: boolean;
  modelPath?: string;
  modelExists: boolean;
  modelSizeBytes: number;
  freeDiskBytes: number;
  loaded: boolean;
  busy: boolean;
  error?: string;
};

export const ravenwoodSmallModel = {
  id: "smollm2-135m-instruct-q8",
  fileName: "smollm2-135m-instruct-q8_0.gguf",
  url: "https://huggingface.co/HackNetAyush/smollm2-135M-instruct-gguf-q8/resolve/main/smollm2-135m-instruct-q8_0.gguf?download=true",
  expectedBytes: 138_000_000,
  minFreeBytes: 420_000_000
};

const ravenwoodReplySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: { type: "string" },
    trustDelta: { type: "number" },
    romanceDelta: { type: "number" },
    revealRomance: { type: "boolean" },
    summary: { type: "string" },
    memoryWrites: {
      type: "array",
      items: { type: "string" },
      maxItems: 3
    }
  },
  required: ["text", "trustDelta", "romanceDelta", "revealRomance", "summary", "memoryWrites"]
};

let loadedContext: any = null;
let loadingPromise: Promise<any> | null = null;
let aiBusy = false;
let lastError: string | undefined;

function clampNumber(value: unknown, min: number, max: number): number {
  const numeric = Math.round(Number(value ?? 0));
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(min, Math.min(max, numeric));
}

function modelDirectory(): Directory {
  const directory = new Directory(Paths.document, "ravenwood-models");
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  return directory;
}

function modelFile(): File {
  return new File(modelDirectory(), ravenwoodSmallModel.fileName);
}

function parseReplyJson(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string") return typeof raw === "object" && raw !== null ? raw as Record<string, unknown> : null;
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch (_nestedError) {
      return null;
    }
  }
}

export function ravenwoodReplyLooksLikeWorldBible(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "ravenwood is an isolated",
    "late-nineteenth-century country mansion",
    "converted into an exclusive private hotel",
    "people come here to be private",
    "privacy curdles quickly",
    "blocked roads close"
  ].some((phrase) => lower.includes(phrase));
}

export function validateRavenwoodAiReply(raw: unknown, mode: RavenwoodAiMode): RavenwoodValidatedAiReply | null {
  const parsed = parseReplyJson(raw);
  if (!parsed || typeof parsed.text !== "string") return null;
  const text = parsed.text.trim().replace(/\s+/g, " ").slice(0, 700);
  if (text.length < 2 || ravenwoodReplyLooksLikeWorldBible(text)) return null;
  return {
    text,
    trustDelta: clampNumber(parsed.trustDelta, -10, 10),
    romanceDelta: clampNumber(parsed.romanceDelta, -8, 8),
    revealRomance: Boolean(parsed.revealRomance),
    summary: typeof parsed.summary === "string" ? parsed.summary.trim().slice(0, 300) : undefined,
    memoryWrites: Array.isArray(parsed.memoryWrites)
      ? parsed.memoryWrites.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 3)
      : [],
    mode
  };
}

export function buildRavenwoodAiPrompt(packet: unknown): { system: string; user: string } {
  return {
    system: [
      "You are Ravenwood's offline NPC conversation engine.",
      "Return only strict JSON with text, trustDelta, romanceDelta, revealRomance, summary, and memoryWrites.",
      "Never recite setting bible, premise, founding date, or generic mansion brochure text.",
      "If targetResident exists, speak as that resident: personal, guarded, specific, and reactive to the player's words.",
      "Use hidden truth only for consistency. Do not reveal undiscovered killer/proof unless trust, evidence, or the player question justifies a hint.",
      "Keep text to one or two natural sentences. No markdown. No narrator lecture."
    ].join("\n"),
    user: JSON.stringify({
      task: "Reply to this Ravenwood player action as constrained JSON.",
      packet
    })
  };
}

export async function getRavenwoodModelStatus(): Promise<RavenwoodModelStatus> {
  if (Platform.OS === "web") {
    return {
      platform: Platform.OS,
      nativeCapable: false,
      modelExists: false,
      modelSizeBytes: 0,
      freeDiskBytes: 0,
      loaded: false,
      busy: aiBusy,
      error: "Offline GGUF inference needs an iOS or Android development build, not web or Expo Go."
    };
  }
  try {
    const file = modelFile();
    return {
      platform: Platform.OS,
      nativeCapable: true,
      modelPath: file.uri,
      modelExists: file.exists,
      modelSizeBytes: file.exists ? file.size : 0,
      freeDiskBytes: Paths.availableDiskSpace,
      loaded: Boolean(loadedContext),
      busy: aiBusy,
      error: lastError
    };
  } catch (error) {
    return {
      platform: Platform.OS,
      nativeCapable: true,
      modelExists: false,
      modelSizeBytes: 0,
      freeDiskBytes: 0,
      loaded: false,
      busy: aiBusy,
      error: error instanceof Error ? error.message : "Unknown model status error"
    };
  }
}

export async function downloadRavenwoodModel(): Promise<RavenwoodModelStatus> {
  if (Platform.OS === "web") return getRavenwoodModelStatus();
  const free = Paths.availableDiskSpace;
  if (free > 0 && free < ravenwoodSmallModel.minFreeBytes) {
    lastError = "Not enough free device storage for the test model.";
    return getRavenwoodModelStatus();
  }
  aiBusy = true;
  try {
    const destination = modelFile();
    if (!destination.exists || destination.size < ravenwoodSmallModel.expectedBytes * 0.75) {
      await File.downloadFileAsync(ravenwoodSmallModel.url, destination, { idempotent: true });
    }
    lastError = undefined;
  } catch (error) {
    lastError = error instanceof Error ? error.message : "Model download failed";
  } finally {
    aiBusy = false;
  }
  return getRavenwoodModelStatus();
}

export async function loadRavenwoodModel(): Promise<RavenwoodModelStatus> {
  if (Platform.OS === "web") return getRavenwoodModelStatus();
  if (loadedContext) return getRavenwoodModelStatus();
  const file = modelFile();
  if (!file.exists) return downloadRavenwoodModel();
  if (!loadingPromise) {
    aiBusy = true;
    loadingPromise = import("llama.rn")
      .then(({ initLlama }) => initLlama({
        model: file.uri,
        n_ctx: 1536,
        n_batch: 128,
        n_gpu_layers: Platform.OS === "ios" ? 99 : 0,
        use_mlock: false
      }))
      .then((context) => {
        loadedContext = context;
        lastError = undefined;
        return context;
      })
      .catch((error) => {
        lastError = error instanceof Error ? error.message : "Model load failed";
        return null;
      })
      .finally(() => {
        aiBusy = false;
        loadingPromise = null;
      });
  }
  await loadingPromise;
  return getRavenwoodModelStatus();
}

export async function generateRavenwoodOfflineReply(packet: unknown): Promise<RavenwoodValidatedAiReply | null> {
  if (Platform.OS === "web") return null;
  const status = await loadRavenwoodModel();
  if (!status.loaded || !loadedContext) return null;
  const prompt = buildRavenwoodAiPrompt(packet);
  aiBusy = true;
  try {
    const result = await loadedContext.completion({
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          strict: true,
          schema: ravenwoodReplySchema
        }
      },
      n_predict: 220,
      temperature: 0.65,
      top_p: 0.85,
      stop: ["</s>", "<|end|>", "<|eot_id|>", "<|end_of_text|>", "<|im_end|>"]
    });
    return validateRavenwoodAiReply(result?.text ?? "", "offline");
  } catch (error) {
    lastError = error instanceof Error ? error.message : "Offline generation failed";
    return null;
  } finally {
    aiBusy = false;
  }
}
