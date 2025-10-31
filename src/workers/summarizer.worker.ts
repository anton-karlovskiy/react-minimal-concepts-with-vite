import {
  pipeline,
  SummarizationPipeline,
  env,
  SummarizationSingle
} from "@xenova/transformers";

// Ensure we don't try to access local models inside the worker
env.allowLocalModels = false;

type WorkerInboundMessage =
  | { type: "load-model"; modelSource: string }
  | { type: "generate-summarize"; text: string };
  
// ninja focus touch <
type ModelState =
  | { status: "initiate"; name: string; file: string; }
  | { status: "download"; name: string; file: string; }
  | { status: "progress"; name: string; file: string; progress: number; loaded: number; total: number; }
  | { status: "done"; name: string; file: string; }
  | { status: "ready"; task: string; model: string; };
// ninja focus touch >

type WorkerOutboundMessage =
  // ninja focus touch <
  | { type: "model-progress"; modelState: ModelState; }
  // ninja focus touch >
  | { type: "model-ready" }
  | { type: "model-error"; message: string }
  | { type: "summary-ready"; summary: string }
  | { type: "summary-error"; message: string };

let summarizer: SummarizationPipeline | null = null;
let currentModelSource: string | null = null;

const post = (msg: WorkerOutboundMessage) => {
  postMessage(msg);
};

const handleLoadModel = async (modelSource: string) => {
  try {
    if (summarizer && currentModelSource === modelSource) {
      post({ type: "model-ready" });
      return;
    }

    // Report progress as the model is downloaded/initialized
    const progress_callback = (modelState: ModelState) => {
      // ninja focus touch <
      post({ type: "model-progress", modelState });
      // ninja focus touch >
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

const handleGenerateSummary = async (text: string) => {
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

    post({ type: "summary-ready", summary });
  } catch (error) {
    post({
      type: "summary-error",
      message: `Failed to summarize text: ${error instanceof Error ? error.message : "Unknown error"}`
    });
  }
};

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const data = event.data;
  if (!data) return;

  switch (data.type) {
    case "load-model":
      void handleLoadModel(data.modelSource);
      break;
    case "generate-summarize":
      void handleGenerateSummary(data.text);
      break;
    default:
      // no-op
      break;
  }
};

export type {
  WorkerInboundMessage,
  WorkerOutboundMessage,
  ModelState
};
