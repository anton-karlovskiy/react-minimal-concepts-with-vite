import { pipeline, SummarizationPipeline, env, SummarizationSingle } from "@xenova/transformers";

// Ensure we don't try to access local models inside the worker
env.allowLocalModels = false;

type InboundMessage =
  | { type: "load"; modelSource: string }
  | { type: "summarize"; text: string };

type OutboundMessage =
  | { type: "model-progress"; status: string; progress?: number }
  | { type: "model-ready" }
  | { type: "model-error"; message: string }
  | { type: "summary-result"; summary: string }
  | { type: "summary-error"; message: string };

let summarizer: SummarizationPipeline | null = null;
let currentModelSource: string | null = null;

const post = (msg: OutboundMessage) => {
  // @ts-expect-error WorkerGlobalScope typing
  postMessage(msg);
};

const handleLoad = async (modelSource: string) => {
  try {
    if (summarizer && currentModelSource === modelSource) {
      post({ type: "model-ready" });
      return;
    }

    // Report progress as the model is downloaded/initialized
    const progress_callback = (state: { status: string; progress?: number }) => {
      post({ type: "model-progress", status: state.status, progress: state.progress });
    };

    summarizer = await pipeline("summarization", modelSource, { progress_callback });
    currentModelSource = modelSource;
    post({ type: "model-ready" });
  } catch (error) {
    post({
      type: "model-error",
      message: `Failed to load model: ${error instanceof Error ? error.message : "Unknown error"}`
    });
  }
};

const handleSummarize = async (text: string) => {
  try {
    if (!summarizer) {
      throw new Error("Model is not loaded.");
    }
    if (!text.trim()) {
      throw new Error("Please enter some text to summarize.");
    }

    const output = await summarizer(text, {
      max_length: 150,
      min_length: 30,
      do_sample: false
    });

    const summary = (output[0] as unknown as SummarizationSingle).summary_text ||
      "Unable to generate summary from the provided text.";

    post({ type: "summary-result", summary });
  } catch (error) {
    post({
      type: "summary-error",
      message: `Failed to summarize text: ${error instanceof Error ? error.message : "Unknown error"}`
    });
  }
};

// @ts-expect-error WorkerGlobalScope typing
self.onmessage = (event: MessageEvent<InboundMessage>) => {
  const data = event.data;
  if (!data) return;

  switch (data.type) {
    case "load":
      void handleLoad(data.modelSource);
      break;
    case "summarize":
      void handleSummarize(data.text);
      break;
    default:
      // no-op
      break;
  }
};


