import { useState, useCallback, useRef } from "react";
import { pipeline, SummarizationPipeline, env, SummarizationSingle } from "@xenova/transformers";

// Disable local models
env.allowLocalModels = false;

// ninja focus touch <<
interface SummarizationModel {
  id: string;
  name: string;
  size: string;
  description: string;
  modelName: string;
}
// ninja focus touch >>

const SUMMARIZATION_MODELS: SummarizationModel[] = [
  {
    id: "bart-large-cnn",
    name: "BART Large CNN",
    size: "1.6GB",
    description: "High-quality abstractive summarization",
    modelName: "Xenova/bart-large-cnn"
  },
  {
    id: "t5-small",
    name: "T5 Small",
    size: "60MB",
    description: "Text-to-text transfer transformer",
    modelName: "Xenova/t5-small"
  },
  {
    id: "pegasus-xsum",
    name: "PEGASUS XSum",
    size: "2.2GB",
    description: "Extreme summarization model",
    modelName: "Xenova/pegasus-xsum"
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
  summarize: (text: string, modelId: string) => Promise<void>;
  reset: () => void;
}

function useSummarizer(): UseSummarizerReturn {
  const [state, setState] = useState<SummarizationState>({
    status: SummarizationStatus.Idle,
    summary: null,
    error: null
  });

  const [modelState, setModelState] = useState<ModelState>();

  const pipelineRef = useRef<SummarizationPipeline | null>(null);
  const currentModelRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setState({
      status: SummarizationStatus.Idle,
      summary: null,
      error: null
    });

    pipelineRef.current = null;
    currentModelRef.current = null;
  }, []);

  const loadModel = useCallback(async (modelId: string): Promise<SummarizationPipeline | undefined> => {
    const model = SUMMARIZATION_MODELS.find(item => item.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // If the same model is already loaded, return the existing pipeline
    if (pipelineRef.current && currentModelRef.current === modelId) {
      return pipelineRef.current;
    }

    try {
      // Create a progress callback to track download progress
      const progressCallback = (newModelState: ModelState) => {
        setModelState(newModelState);
      };
      
      setState(prev => ({
        ...prev,
        status: SummarizationStatus.ModelPending
      }));

      // Load the pipeline with progress tracking
      const generator = await pipeline("summarization", model.modelName, {
        progress_callback: progressCallback
      });

      pipelineRef.current = generator;
      currentModelRef.current = modelId;

      setState(prev => ({
        ...prev,
        status: SummarizationStatus.ModelResolved
      }));

      return generator;
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: SummarizationStatus.ModelRejected,
        error: new Error(`Failed to load model: ${error instanceof Error ? error.message : "Unknown error"}`)
      }));
    }
  }, []);

  const generateSummary = useCallback(async (text: string, summarizer: SummarizationPipeline): Promise<void> => {
    try {
      if (!text.trim()) {
        throw new Error("Please enter some text to summarize.");
      }
      
      setState(prev => ({
        ...prev,
        status: SummarizationStatus.SummaryPending
      }));

      // Perform summarization
      const output = await summarizer(text, {
        max_length: 150,
        min_length: 30,
        do_sample: false
      });

      setState(prev => ({
        ...prev,
        status: SummarizationStatus.SummaryResolved,
        summary: (output[0] as unknown as SummarizationSingle).summary_text || "Unable to generate summary from the provided text."
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: SummarizationStatus.SummaryRejected,
        error: new Error(`Failed to summarize text: ${error instanceof Error ? error.message : "Unknown error"}`)
      }));
    }
  }, []);

  const summarize = useCallback(async (text: string, modelId: string): Promise<void> => {
    // Load the model if needed
    const summarizer = await loadModel(modelId);
    if (!summarizer) {
      return;
    }

    await generateSummary(text, summarizer);
  }, [loadModel, generateSummary]);

  return {
    state,
    modelState,
    summarize,
    reset
  };
}

export {
  SummarizationStatus,
  SUMMARIZATION_MODELS,
  useSummarizer
};