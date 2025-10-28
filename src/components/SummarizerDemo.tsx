// ninja focus touch <
import { useState, useCallback } from 'react';
import Button from './UI/Button';
import Textarea from './UI/Textarea';
import Select from './UI/Select';
import ProgressBar from './UI/ProgressBar';
import { useSummarizer, SUMMARIZATION_MODELS } from '../hooks/useSummarizer';

export default function SummarizerDemo() {
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState(SUMMARIZATION_MODELS[0].id);
  
  const { state, summarize, reset } = useSummarizer();

  const handleSummarize = useCallback(async () => {
    if (!text.trim()) {
      return;
    }

    await summarize(text, selectedModel);
  }, [text, selectedModel, summarize]);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    reset(); // Reset the summarizer state when model changes
  }, [reset]);

  const selectedModelInfo = SUMMARIZATION_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Text to Summarize
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to summarize..."
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Summarization Model
        </label>
        <Select
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
        >
          {SUMMARIZATION_MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.size}) - {model.description}
            </option>
          ))}
        </Select>
      </div>

      {state.isDownloading && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Downloading Model...
          </label>
          <ProgressBar progress={state.downloadProgress} />
          <p className="text-xs text-gray-400 mt-1">
            {state.downloadProgress}% complete
          </p>
        </div>
      )}

      <Button
        onClick={handleSummarize}
        disabled={state.isDownloading || state.isSummarizing || !text.trim()}
        className="w-full"
      >
        {state.isDownloading 
          ? 'Downloading Model...' 
          : state.isSummarizing 
          ? 'Summarizing...' 
          : 'Summarize'
        }
      </Button>

      {state.error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {state.error}
        </div>
      )}

      {state.summary && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Summary
          </label>
          <p className="p-3 bg-[#1a1d23] border border-[#2b2e35] rounded-lg text-[#f5f7fb]">
            {state.summary}
          </p>
          {selectedModelInfo && (
            <p className="text-xs text-gray-400 mt-2">
              Generated using {selectedModelInfo.name} ({selectedModelInfo.size})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
// ninja focus touch >