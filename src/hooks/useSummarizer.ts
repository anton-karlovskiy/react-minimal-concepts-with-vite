import { useState, useCallback, useRef, useEffect } from "react";

import type { WorkerInboundMessage, WorkerOutboundMessage } from "../workers/summarizer.worker";

interface SummarizationModel {
  name: string;
  size: string;
  description: string;
  source: string;
}

const SUMMARIZATION_MODELS: SummarizationModel[] = [
  {
    name: "BART Large CNN",
    size: "1.6GB",
    description: "High-quality abstractive summarization",
    source: "Xenova/bart-large-cnn"
  },
  {
    name: "T5 Small",
    size: "60MB",
    description: "Text-to-text transfer transformer",
    source: "Xenova/t5-small"
  },
  {
    name: "PEGASUS XSum",
    size: "2.2GB",
    description: "Extreme summarization model",
    source: "Xenova/pegasus-xsum"
  }
];

enum SummarizationStatus {
  Idle = "IDLE",
  ModelPending = "MODEL_PENDING",
  SummaryPending = "SUMMARY_PENDING",
  ModelResolved = "MODEL_RESOLVED",
  ModelRejected = "MODEL_REJECTED",
  SummaryResolved = "SUMMARY_RESOLVED",
  SummaryRejected = "SUMMARY_REJECTED"
}

interface SummarizationState {
  status: SummarizationStatus;
  summary: string | null;
  error: Error | null;
}

interface ModelState {
  status: string;
  progress?: number;
}

interface UseSummarizerReturn {
  state: SummarizationState;
  modelState: ModelState | undefined;
  summarize: (text: string, modelSource: string) => Promise<void>;
  reset: () => void;
}

function useSummarizer(): UseSummarizerReturn {
  const [state, setState] = useState<SummarizationState>({
    status: SummarizationStatus.Idle,
    summary: null,
    error: null
  });

  const [modelState, setModelState] = useState<ModelState>();

  const workerRef = useRef<Worker | null>(null);
  const currentModelRef = useRef<string | null>(null);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL("../workers/summarizer.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    return worker;
  }, []);

  const reset = useCallback(() => {
    setState({
      status: SummarizationStatus.Idle,
      summary: null,
      error: null
    });

    currentModelRef.current = null;
  }, []);

  const loadModel = useCallback(async (modelSource: string): Promise<boolean> => {
    if (currentModelRef.current === modelSource) {
      return true;
    }

    const worker = ensureWorker();

    setState(prev => ({ ...prev, status: SummarizationStatus.ModelPending }));

    const modelReady = new Promise<boolean>((resolve, reject) => {
      const handleMessage = (event: MessageEvent<WorkerOutboundMessage>) => {
        const data = event.data;
        if (!data) return;
        switch (data.type) {
          case "model-progress":
            setModelState({ status: data.status, progress: data.progress });
            break;
          case "model-ready":
            worker.removeEventListener("message", handleMessage as EventListener);
            currentModelRef.current = modelSource;
            setState(prev => ({ ...prev, status: SummarizationStatus.ModelResolved }));
            resolve(true);
            break;
          case "model-error":
            worker.removeEventListener("message", handleMessage as EventListener);
            setState(prev => ({
              ...prev,
              status: SummarizationStatus.ModelRejected,
              error: new Error(data.message)
            }));
            reject(new Error(data.message));
            break;
        }
      };
      worker.addEventListener("message", handleMessage as EventListener);
    });

    worker.postMessage({ type: "load-model", modelSource } as WorkerInboundMessage);
    return modelReady;
  }, [ensureWorker]);

  const generateSummary = useCallback(async (text: string): Promise<void> => {
    try {
      if (!text.trim()) {
        throw new Error("Please enter some text to summarize.");
      }

      const worker = ensureWorker();

      setState(prev => ({ ...prev, status: SummarizationStatus.SummaryPending }));

      const result = await new Promise<string>((resolve, reject) => {
        const handleMessage = (event: MessageEvent<WorkerOutboundMessage>) => {
          const data = event.data;
          if (!data) return;
          switch (data.type) {
            case "summary-ready":
              worker.removeEventListener("message", handleMessage as EventListener);
              resolve(data.summary);
              break;
            case "summary-error":
              worker.removeEventListener("message", handleMessage as EventListener);
              reject(new Error(data.message));
              break;
          }
        };
        worker.addEventListener("message", handleMessage as EventListener);
      });

      setState(prev => ({
        ...prev,
        status: SummarizationStatus.SummaryResolved,
        summary: result
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: SummarizationStatus.SummaryRejected,
        error: new Error(`Failed to summarize text: ${error instanceof Error ? error.message : "Unknown error"}`)
      }));
    }
  }, [ensureWorker]);

  const summarize = useCallback(async (text: string, modelSource: string): Promise<void> => {
    const loaded = await loadModel(modelSource);
    if (!loaded) return;
    const worker = ensureWorker();
    worker.postMessage({ type: "generate-summarize", text } as WorkerInboundMessage);
    await generateSummary(text);
  }, [loadModel, generateSummary, ensureWorker]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    state,
    modelState,
    summarize,
    reset
  };
}

export {
  SummarizationStatus,
  SUMMARIZATION_MODELS
};

export default useSummarizer;