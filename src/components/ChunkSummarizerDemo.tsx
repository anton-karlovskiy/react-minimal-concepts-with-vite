// ninja focus touch <
import { useState, useCallback } from "react";
import Button from "./UI/Button";
import Textarea from "./UI/Textarea";
import { chunkingHierarchicalSummarize } from "../utils/chunking-hierarchical-summarizer";

function ChunkSummarizerDemo() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{
    perChunk: string[];
    merged: string;
    final: string;
  } | null>(null);

  const handleSummarize = useCallback(async () => {
    if (!text.trim()) {
      console.log("Text is empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const summary = await chunkingHierarchicalSummarize(text);

      console.log("ninja focus touch: summary.final =>", summary.final);
      console.log("ninja focus touch: summary.perChunk =", summary.perChunk);
      console.log("ninja focus touch: summary.merged =", summary.merged);
      
      setResult(summary);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Text to Summarize
        </label>
        <Textarea
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder="Enter the text you want to summarize into hierarchical bullets..."
          rows={6} />
      </div>

      <Button
        onClick={handleSummarize}
        disabled={isLoading || !text.trim()}
        className="w-full">
        {isLoading ? "Summarizing..." : "Summarize"}
      </Button>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error.message}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Final Summary
            </label>
            <pre className="p-3 bg-[#1a1d23] border border-[#2b2e35] rounded-lg text-[#f5f7fb] whitespace-pre-wrap text-sm">
              {result.final}
            </pre>
          </div>

          <details className="border border-[#2b2e35] rounded-lg">
            <summary className="p-3 cursor-pointer text-sm font-medium hover:bg-[#1a1d23]">
              View Intermediate Steps (Chunks: {result.perChunk.length})
            </summary>
            <div className="p-3 space-y-4 border-t border-[#2b2e35]">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Per-Chunk Summaries
                </label>
                <div className="space-y-2">
                  {result.perChunk.map((chunk, idx) => (
                    <pre
                      key={idx}
                      className="p-2 bg-[#0f1115] border border-[#2b2e35] rounded text-[#f5f7fb] whitespace-pre-wrap text-xs">
                      {`Chunk ${idx + 1}:\n${chunk}`}
                    </pre>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Merged Bullets
                </label>
                <pre className="p-2 bg-[#0f1115] border border-[#2b2e35] rounded text-[#f5f7fb] whitespace-pre-wrap text-xs">
                  {result.merged}
                </pre>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

export default ChunkSummarizerDemo;
// ninja focus touch >