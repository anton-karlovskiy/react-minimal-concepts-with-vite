import { useState, useCallback, useRef, useEffect } from "react";

import type { WorkerInboundMessage, WorkerOutboundMessage, ModelState } from "../workers/summarizer.worker";

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

interface UseSummarizerReturn {
  state: SummarizationState;
  // ninja focus touch <
  modelStates: ModelState[];
  // ninja focus touch >
  summarize: (text: string, modelSource: string) => Promise<void>;
  reset: () => void;
}

function useSummarizer(): UseSummarizerReturn {
  const [state, setState] = useState<SummarizationState>({
    status: SummarizationStatus.Idle,
    summary: null,
    error: null
  });

  // ninja focus touch <
  const [modelStates, setModelStates] = useState<ModelState[]>([]);
  // ninja focus touch >

  const workerRef = useRef<Worker | null>(null);

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
  }, []);

  const loadModel = useCallback(async (modelSource: string): Promise<boolean> => {
    const worker = ensureWorker();

    setState(prev => ({ ...prev, status: SummarizationStatus.ModelPending }));

    const modelReady = new Promise<boolean>((resolve, reject) => {
      const handleMessage = (event: MessageEvent<WorkerOutboundMessage>) => {
        const data = event.data;
        
        switch (data.type) {
          case "model-progress": {
            // ninja focus touch <
            switch (data.modelState.status) {
              case "initiate": {
                setModelStates(prev => [...prev, data.modelState]);
                break;
              }
              case "progress": {
                setModelStates(prev =>
                  prev.map(item => {
                    if (!("file" in item) || !("file" in data.modelState) || !("progress" in data.modelState)) {
                      throw new Error("Invalid model state");
                    }

                    if (item.file === data.modelState.file) {
                      return { ...item, progress: data.modelState.progress } as ModelState;
                    }
                    return item;
                  })
                );
                break;
              }
              case "done": {
                setModelStates(prev =>
                  prev.filter(item => {
                    if (!("file" in item) || !("file" in data.modelState)) {
                      throw new Error("Invalid model state");
                    }

                    return item.file !== data.modelState.file;
                  })
                );
                break;
              }
              default:
                break;
            }
            // ninja focus touch >
            break;
          }
          case "model-ready": {
            worker.removeEventListener("message", handleMessage as EventListener);
            setState(prev => ({ ...prev, status: SummarizationStatus.ModelResolved }));
            resolve(true);
            break;
          }
          case "model-error": {
            worker.removeEventListener("message", handleMessage as EventListener);
            setState(prev => ({
              ...prev,
              status: SummarizationStatus.ModelRejected,
              error: new Error(data.message)
            }));
            reject(new Error(data.message));
            break;
          }
          default:
            throw new Error(`Unknown model message type: ${data.type}`);
        }
      };
      worker.addEventListener("message", handleMessage as EventListener);
    });

    worker.postMessage({ type: "load-model", modelSource } as WorkerInboundMessage);

    return modelReady;
  }, [ensureWorker]);

  const generateSummary = useCallback(async (text: string): Promise<boolean> => {
    const worker = ensureWorker();

    setState(prev => ({ ...prev, status: SummarizationStatus.SummaryPending }));

    const summaryReady = new Promise<boolean>((resolve, reject) => {
      const handleMessage = (event: MessageEvent<WorkerOutboundMessage>) => {
        const data = event.data;
        if (!data) return;
        switch (data.type) {
          case "summary-ready": {
            worker.removeEventListener("message", handleMessage as EventListener);
            setState(prev => ({
              ...prev,
              status: SummarizationStatus.SummaryResolved,
              summary: data.summary
            }));
            resolve(true);
            break;
          }
          case "summary-error": {
            worker.removeEventListener("message", handleMessage as EventListener);
            setState(prev => ({
              ...prev,
              status: SummarizationStatus.SummaryRejected,
              error: new Error(data.message)
            }));
            reject(new Error(data.message));
            break;
          }
          default:
            throw new Error(`Unknown summary message type: ${data.type}`);
        }
      };
      worker.addEventListener("message", handleMessage as EventListener);
    });

    worker.postMessage({ type: "generate-summarize", text } as WorkerInboundMessage);

    return summaryReady;
  }, [ensureWorker]);

  const summarize = useCallback(async (text: string, modelSource: string): Promise<void> => {
    const loaded = await loadModel(modelSource);
    if (!loaded) return;
    
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
    // ninja focus touch <
    modelStates,
    // ninja focus touch >
    summarize,
    reset
  };
}

export {
  SummarizationStatus,
  SUMMARIZATION_MODELS
};

export default useSummarizer;