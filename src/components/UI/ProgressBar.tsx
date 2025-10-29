// ninja focus touch <
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full bg-[#2b2e35] rounded-full h-2 ${className}`}>
      <div 
        className="bg-[#646CFF] h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}

export default ProgressBar;
// ninja focus touch >