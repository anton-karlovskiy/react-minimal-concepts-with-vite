// ninja focus touch <
import { useState, useCallback, useRef } from 'react';
import { pipeline, SummarizationPipeline } from '@xenova/transformers';

export interface SummarizationModel {
  id: string;
  name: string;
  size: string;
  description: string;
  modelName: string;
}

export const SUMMARIZATION_MODELS: SummarizationModel[] = [
  {
    id: 'distilbert-base-uncased',
    name: 'DistilBERT Base',
    size: '67MB',
    description: 'Fast and efficient for general text summarization',
    modelName: 'Xenova/distilbert-base-uncased'
  },
  {
    id: 'bart-large-cnn',
    name: 'BART Large CNN',
    size: '1.6GB',
    description: 'High-quality abstractive summarization',
    modelName: 'Xenova/bart-large-cnn'
  },
  {
    id: 't5-small',
    name: 'T5 Small',
    size: '60MB',
    description: 'Text-to-text transfer transformer',
    modelName: 'Xenova/t5-small'
  },
  {
    id: 'pegasus-xsum',
    name: 'PEGASUS XSum',
    size: '2.2GB',
    description: 'Extreme summarization model',
    modelName: 'Xenova/pegasus-xsum'
  }
];

export interface SummarizationState {
  isDownloading: boolean;
  downloadProgress: number;
  isSummarizing: boolean;
  summary: string;
  error: string | null;
  isModelLoaded: boolean;
}

export interface UseSummarizerReturn {
  state: SummarizationState;
  summarize: (text: string, modelId: string) => Promise<void>;
  reset: () => void;
}

export function useSummarizer(): UseSummarizerReturn {
  const [state, setState] = useState<SummarizationState>({
    isDownloading: false,
    downloadProgress: 0,
    isSummarizing: false,
    summary: '',
    error: null,
    isModelLoaded: false
  });

  const pipelineRef = useRef<SummarizationPipeline | null>(null);
  const currentModelRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setState({
      isDownloading: false,
      downloadProgress: 0,
      isSummarizing: false,
      summary: '',
      error: null,
      isModelLoaded: false
    });
    pipelineRef.current = null;
    currentModelRef.current = null;
  }, []);

  const loadModel = useCallback(async (modelId: string): Promise<SummarizationPipeline> => {
    const model = SUMMARIZATION_MODELS.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // If the same model is already loaded, return the existing pipeline
    if (pipelineRef.current && currentModelRef.current === modelId) {
      return pipelineRef.current;
    }

    setState(prev => ({
      ...prev,
      isDownloading: true,
      downloadProgress: 0,
      error: null
    }));

    try {
      // Create a progress callback to track download progress
      const progressCallback = (progress: any) => {
        if (progress.status === 'downloading') {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setState(prev => ({
            ...prev,
            downloadProgress: percent
          }));
        }
      };

      // Load the pipeline with progress tracking
      const generator = await pipeline('summarization', model.modelName, {
        progress_callback: progressCallback
      });

      pipelineRef.current = generator;
      currentModelRef.current = modelId;

      setState(prev => ({
        ...prev,
        isDownloading: false,
        downloadProgress: 100,
        isModelLoaded: true
      }));

      return generator;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isDownloading: false,
        downloadProgress: 0,
        error: `Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      throw error;
    }
  }, []);

  const summarize = useCallback(async (text: string, modelId: string): Promise<void> => {
    if (!text.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter some text to summarize.'
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isSummarizing: true,
        error: null
      }));

      // Load the model if needed
      const pipeline = await loadModel(modelId);

      // Perform summarization
      const result = await pipeline(text, {
        max_length: 150,
        min_length: 30,
        do_sample: false
      });

      setState(prev => ({
        ...prev,
        isSummarizing: false,
        summary: result[0]?.summary_text || 'Unable to generate summary from the provided text.'
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSummarizing: false,
        error: `Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  }, [loadModel]);

  return {
    state,
    summarize,
    reset
  };
}
// ninja focus touch >