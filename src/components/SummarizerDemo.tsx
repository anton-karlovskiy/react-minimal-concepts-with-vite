import { useState, useCallback } from "react";
import Button from "./UI/Button";
import Textarea from "./UI/Textarea";
import Select from "./UI/Select";
import ProgressBar from "./UI/ProgressBar";
import useSummarizer, { SummarizationStatus, SUMMARIZATION_MODELS } from "../hooks/useSummarizer";

function SummarizerDemo() {
  const [text, setText] = useState("");
  const [selectedModelSource, setSelectedModelSource] = useState(SUMMARIZATION_MODELS[0].source);

  const { state, summarize, reset, modelState } = useSummarizer();

  const handleSummarize = useCallback(async () => {
    if (!text.trim()) {
      console.log("Text is empty");
      return;
    }

    await summarize(text, selectedModelSource);
  }, [text, selectedModelSource, summarize]);

  const handleModelChange = useCallback((modelSource: string) => {
    setSelectedModelSource(modelSource);
    reset(); // Reset the summarizer state when model changes
  }, [reset]);
  
  const selectedModel = SUMMARIZATION_MODELS.find(item => item.source === selectedModelSource);

  const summarizeButtonCaption = (() => {
    switch (state.status) {
      case SummarizationStatus.ModelPending:
        return "Downloading Model...";
      case SummarizationStatus.SummaryPending:
        return "Summarizing...";
      default:
        return "Summarize";
    }
  })();

  console.log("state.status =>", state.status);
  console.log("summarizeButtonCaption =>", summarizeButtonCaption);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Text to Summarize
        </label>
        <Textarea
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder="Enter the text you want to summarize..."
          rows={6} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Summarization Model
        </label>
        <Select
          value={selectedModelSource}
          onChange={event => handleModelChange(event.target.value)}>
          {SUMMARIZATION_MODELS.map(item => (
            <option key={item.source} value={item.source}>
              {item.name} ({item.size}) - {item.description}
            </option>
          ))}
        </Select>
      </div>

      {state.status === SummarizationStatus.ModelPending && modelState && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Downloading Model...
          </label>
          {modelState.progress && (
            <>
              <ProgressBar progress={modelState.progress} />
              <p className="text-xs text-gray-400 mt-1">
                {modelState.status} {modelState.progress}% complete
              </p>
            </>  
          )}
        </div>
      )}

      <Button
        onClick={handleSummarize}
        disabled={state.status === SummarizationStatus.ModelPending || state.status === SummarizationStatus.SummaryPending || !text.trim()}
        className="w-full">
        {summarizeButtonCaption}
      </Button>

      {state.status === SummarizationStatus.ModelRejected || state.status === SummarizationStatus.SummaryRejected && state.error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {state.error.message}
        </div>
      )}

      {state.status === SummarizationStatus.SummaryResolved && state.summary !== null && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Summary
          </label>
          <p className="p-3 bg-[#1a1d23] border border-[#2b2e35] rounded-lg text-[#f5f7fb]">
            {state.summary}
          </p>
          {selectedModel && (
            <p className="text-xs text-gray-400 mt-2">
              Generated using {selectedModel.name} ({selectedModel.size})
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SummarizerDemo;