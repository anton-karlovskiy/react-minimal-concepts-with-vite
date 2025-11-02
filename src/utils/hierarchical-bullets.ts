// ninja focus touch <
// Works in browser (ESM) or Node >=18 with "type": "module"

import { pipeline, env, Text2TextGenerationPipeline } from '@xenova/transformers';

// ---------- Tunables ----------
const MAX_CHUNK_CHARS = 2400;     // ~500–700 tokens depending on text; adjust as needed
const CHUNK_OVERLAP   = 200;      // a little overlap helps coherence
const CONCURRENCY     = 2;        // >1 = faster on multi-core; keep small for WASM
const CHUNK_BULLETS   = 5;        // target bullets per chunk (soft target)
const FINAL_BULLETS   = 8;        // target bullets in the final summary
const MAX_NEW_TOKENS  = 128;      // generation cap per call

// Optional runtime hints (Browser):
env.backends.onnx.wasm.numThreads = Math.max(1, Math.min(CONCURRENCY, (globalThis.navigator?.hardwareConcurrency ?? 4)));
/*
// If you’re in the browser, you can also try:
env.backends.onnx.wasm.simd = true;
env.backends.onnx.wasm.proxy = true; // worker offload
*/

// ---------- Utilities ----------
function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, ' ').replace(/\s*-\s*/g, ' - ').trim();
}

function hardWrapBullets(text: string) {
  // Ensure each line starts with "- "
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  const bullets = [];
  for (const line of lines) {
    if (/^[-•]/.test(line)) {
      bullets.push(line.replace(/^[-•]\s*/, '- ').trim());
    } else {
      bullets.push(`- ${line}`);
    }
  }
  return bullets.join('\n');
}

function dedupeBullets(bulletsStr: string) {
  const lines = bulletsStr.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (let l of lines) {
    l = l.replace(/^[-•]\s*/, '').trim();
    const key = l.toLowerCase();
    if (!seen.has(key) && l.length > 0) {
      seen.add(key);
      out.push(`- ${l}`);
    }
  }
  return out.join('\n');
}

function splitIntoChunks(text: string, maxChars = MAX_CHUNK_CHARS, overlap = CHUNK_OVERLAP): string[] {
  // Prefer to break on sentence boundaries if possible
  const clean = normalizeWhitespace(text);
  if (clean.length <= maxChars) return [clean];

  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + maxChars, clean.length);
    // try to end on sentence boundary
    const boundary = clean.lastIndexOf('.', end);
    if (boundary > i + 100) end = Math.min(boundary + 1, clean.length);

    const slice = clean.slice(i, end).trim();
    if (slice) chunks.push(slice);

    if (end >= clean.length) break;
    i = Math.max(end - overlap, i + 1);
  }
  return chunks;
}

function limitConcurrency<T>(tasks: Array<() => Promise<T>>, limit = CONCURRENCY): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results = Array<T>(tasks.length);
    let next = 0, running = 0, done = 0;

    const runNext = () => {
      while (running < limit && next < tasks.length) {
        const cur = next++;
        running++;
        tasks[cur]()
          .then((res: T) => { results[cur] = res; })
          .catch(reject)
          .finally(() => {
            running--;
            done++;
            if (done === tasks.length) resolve(results);
            else runNext();
          });
      }
    };
    runNext();
  });
}

// ---------- Prompt builders ----------
function bulletPrompt(text: string, targetCount = CHUNK_BULLETS): string {
  return (
    `summarize the following transcript into ${targetCount} concise bullet points.\n` +
    `- use plain text bullets starting with "- "\n` +
    `- keep each bullet under 20 words\n` +
    `- preserve facts; do not invent information\n` +
    `- remove filler and repetition\n\n` +
    `${text}`
  );
}

function finalBulletPrompt(bullets: string, finalCount = FINAL_BULLETS): string {
  return (
    `You are given bullet points from multiple chunks of one conversation.\n` +
    `Merge and distill them into the ${finalCount} most important bullet points.\n` +
    `- output only bullets starting with "- "\n` +
    `- keep each bullet under 20 words\n` +
    `- avoid duplicates; prefer specificity over vagueness\n\n` +
    `${bullets}`
  );
}

// ---------- Core summarization ----------
async function loadPipe(modelId = 'Xenova/t5-small'): Promise<Text2TextGenerationPipeline> {
  // text2text-generation picks quantized ONNX by default when available
  return await pipeline('text2text-generation', modelId);
}

async function summarizeChunk(pipe: Text2TextGenerationPipeline, text: string, { bullets = CHUNK_BULLETS } = {}): Promise<string> {
  const prompt = bulletPrompt(text, bullets);
  const out = await pipe(prompt, { max_new_tokens: MAX_NEW_TOKENS });
  // Normalize to "- " bullets, dedupe locally
  const output = out[0] as { generated_text?: string };
  return dedupeBullets(hardWrapBullets(output.generated_text || ''));
}

async function summarizeHierarchical(fullText: string, {
  model = 'Xenova/t5-small',
  maxChunkChars = MAX_CHUNK_CHARS,
  overlap = CHUNK_OVERLAP,
  perChunkBullets = CHUNK_BULLETS,
  finalBullets = FINAL_BULLETS,
}: {
  model?: string;
  maxChunkChars?: number;
  overlap?: number;
  perChunkBullets?: number;
  finalBullets?: number;
} = {}) {
  const pipe = await loadPipe(model);
  const chunks = splitIntoChunks(fullText, maxChunkChars, overlap);

  // First-pass summaries (parallel, concurrency-limited)
  const tasks = chunks.map(chunk => () => summarizeChunk(pipe, chunk, { bullets: perChunkBullets }));
  const perChunk: string[] = await limitConcurrency(tasks, CONCURRENCY);

  // Merge & second-pass summary
  const merged = dedupeBullets(perChunk.join('\n'));
  const finalPrompt = finalBulletPrompt(merged, finalBullets);
  const finalOut = await pipe(finalPrompt, { max_new_tokens: MAX_NEW_TOKENS });

  const output = finalOut[0] as { generated_text?: string };
  const finalBulletsStr = dedupeBullets(hardWrapBullets(output.generated_text || ''));
  return { perChunk, merged, final: finalBulletsStr };
}

// ---------- Example usage ----------
/*
import fs from 'node:fs/promises';
const transcript = await fs.readFile('./transcription.txt', 'utf8');
const { perChunk, merged, final } = await summarizeHierarchical(transcript, {
  model: 'Xenova/t5-small',     // or your mirror
  maxChunkChars: 2400,
  perChunkBullets: 5,
  finalBullets: 8,
});
console.log('\n--- FINAL BULLETS ---\n' + final);
*/

export { summarizeHierarchical };
// ninja focus touch >