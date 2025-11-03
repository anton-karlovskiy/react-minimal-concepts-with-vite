// ninja focus touch <
// Works in browser (ESM) or Node >=18 with "type": "module"

import { pipeline, env, Text2TextGenerationPipeline } from '@xenova/transformers';

// ---------- Tunables ----------
const MAX_CHUNK_CHARS = 1800;     // Conservative chunk size to leave room for prompt (~450-550 tokens)
const CHUNK_OVERLAP   = 150;      // a little overlap helps coherence
const CONCURRENCY     = 2;        // >1 = faster on multi-core; keep small for WASM
const CHUNK_BULLETS   = 3;        // target bullets per chunk (reduced for better quality)
const FINAL_BULLETS   = 5;        // target bullets in the final summary
const MAX_NEW_TOKENS  = 200;      // generation cap per call (increased for better completion)

// Ensure we don't try to access local models inside the worker
env.allowLocalModels = false;

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
    // More intelligent deduplication: check for significant overlap, not just exact matches
    const key = l.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    // Also check if this is a substring/superset of existing bullets
    let isDuplicate = false;
    if (seen.has(key)) {
      isDuplicate = true;
    } else {
      // Check for similar bullets (simple substring check)
      for (const existing of seen) {
        const similarity = Math.min(key.length, existing.length) / Math.max(key.length, existing.length);
        if (similarity > 0.85 && (key.includes(existing.slice(0, 20)) || existing.includes(key.slice(0, 20)))) {
          isDuplicate = true;
          break;
        }
      }
    }
    if (!isDuplicate && l.length > 10) { // Minimum bullet length
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
    `Summarize the following text into exactly ${targetCount} concise bullet points.\n\n` +
    `STRICT REQUIREMENTS:\n` +
    `- Extract ONLY information that is explicitly stated in the text\n` +
    `- DO NOT invent details, infer conclusions, or add information not in the source\n` +
    `- DO NOT create contradictory statements (e.g., "X to X" or "Y from Y")\n` +
    `- Use plain text bullets starting with "- "\n` +
    `- Keep each bullet under 25 words\n` +
    `- Focus on concrete actions, tools, results, and key facts\n` +
    `- Remove filler words ("like", "you know", "so"), repetition, and redundant phrases\n` +
    `- If a fact is unclear, omit it entirely rather than guessing\n\n` +
    `Text:\n${text}\n\n` +
    `Bullet points:`
  );
}

function finalBulletPrompt(bullets: string, finalCount = FINAL_BULLETS): string {
  return (
    `Merge the bullet points below from multiple text chunks into exactly ${finalCount} high-level, comprehensive bullet points.\n\n` +
    `STRICT REQUIREMENTS:\n` +
    `- Only combine information that appears in the source bullets\n` +
    `- DO NOT invent, infer, or add details not explicitly in the source bullets\n` +
    `- DO NOT create contradictory statements\n` +
    `- Group related concepts together to form coherent, high-level summaries\n` +
    `- Use plain text bullets starting with "- "\n` +
    `- Keep each bullet under 30 words\n` +
    `- Remove duplicates and merge similar ideas\n` +
    `- Focus on the most important, distinct, and actionable points\n` +
    `- If bullets conflict, prioritize the most frequently mentioned information\n` +
    `- Each bullet should be substantive and specific, not vague\n\n` +
    `Source bullets:\n${bullets}\n\n` +
    `Merged high-level bullets:`
  );
}

// ---------- Core summarization ----------
async function loadPipe(modelId: string): Promise<Text2TextGenerationPipeline> {
  // text2text-generation picks quantized ONNX by default when available
  return await pipeline('text2text-generation', modelId);
}

async function summarizeChunk(pipe: Text2TextGenerationPipeline, text: string, { bullets = CHUNK_BULLETS } = {}): Promise<string> {
  const prompt = bulletPrompt(text, bullets);
  const out = await pipe(prompt, { 
    max_new_tokens: MAX_NEW_TOKENS,
    temperature: 0.3,  // Lower temperature for more factual, less creative output
    repetition_penalty: 1.2,  // Reduce repetition
  });
  // Normalize to "- " bullets, dedupe locally
  const output = out[0] as { generated_text?: string };
  let result = dedupeBullets(hardWrapBullets(output.generated_text || ''));
  
  // Post-process: remove obvious hallucinations and low-quality outputs
  result = result.split('\n').map(line => {
    const trimmed = line.replace(/^[-•]\s*/, '').trim();
    if (!trimmed || trimmed.length < 15) return null; // Too short
    
    // Remove lines with obvious contradictions (e.g., "280 milliseconds to 280 milliseconds")
    if (trimmed.match(/(\d+)\s+(?:to|from)\s+\1\s*(?:milliseconds|ms|seconds|minutes|hours|days)/i)) {
      return null;
    }
    
    // Remove lines that are just repetitive phrases (e.g., "The app is being run by...")
    const words = trimmed.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 5 && uniqueWords.size < words.length * 0.5) {
      return null; // Too repetitive
    }
    
    return line;
  }).filter(Boolean).join('\n');
  
  return result;
}

async function chunkingHierarchicalSummarize(fullText: string, {
  model = 'Xenova/distilbart-cnn-6-6',
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
  
  // If merged bullets are already concise and within target count, consider using them directly
  const mergedLines = merged.split('\n').filter(Boolean);
  const shouldDoFinalPass = mergedLines.length > finalBullets * 1.5; // Only merge if significantly more than target
  
  let finalBulletsStr: string;
  if (shouldDoFinalPass) {
    const finalPrompt = finalBulletPrompt(merged, finalBullets);
    const finalOut = await pipe(finalPrompt, { 
      max_new_tokens: MAX_NEW_TOKENS,
      temperature: 0.3,  // Lower temperature for factual output
      repetition_penalty: 1.2,
    });

    const output = finalOut[0] as { generated_text?: string };
    finalBulletsStr = dedupeBullets(hardWrapBullets(output.generated_text || ''));
    
    // Post-process final output to remove hallucinations and improve quality
    finalBulletsStr = finalBulletsStr.split('\n').map(line => {
      const trimmed = line.replace(/^[-•]\s*/, '').trim();
      if (!trimmed || trimmed.length < 20) return null; // Too short for meaningful summary
      
      // Remove lines with obvious contradictions
      if (trimmed.match(/(\d+)\s+(?:to|from|improved|changed)\s+\1\s*(?:milliseconds|ms|seconds|minutes|hours|days)/i)) {
        return null;
      }
      
      // Remove overly repetitive lines
      const words = trimmed.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 5 && uniqueWords.size < words.length * 0.55) {
        return null; // Too repetitive
      }
      
      // Remove vague passive constructions without substance
      if (trimmed.split(' ').length < 8 && 
          trimmed.toLowerCase().match(/^(the|a|an)\s+(app|application|system|software|tool)\s+(is|are|was|were|being)\s+(run|controlled|used|operated)/i)) {
        return null;
      }
      
      return line;
    }).filter(Boolean).join('\n');
  } else {
    // If already concise enough, just take top N bullets
    finalBulletsStr = mergedLines.slice(0, finalBullets).join('\n');
  }
  
  return { perChunk, merged, final: finalBulletsStr };
}

// ---------- Example usage ----------
/*
import fs from 'node:fs/promises';
const transcript = await fs.readFile('./transcription.txt', 'utf8');
const { perChunk, merged, final } = await chunkingHierarchicalSummarize(transcript, {
  model: 'Xenova/t5-small',     // or your mirror
  maxChunkChars: 2400,
  perChunkBullets: 5,
  finalBullets: 8,
});
console.log('\n--- FINAL BULLETS ---\n' + final);
*/

export { chunkingHierarchicalSummarize };
// ninja focus touch >