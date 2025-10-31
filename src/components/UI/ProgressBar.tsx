interface ProgressBarProps {
  text: string;
  percentage: number; // 0-100
  className?: string;
}

function ProgressBar({ text, percentage }: ProgressBarProps) {
  return (
    <div className={`w-full rounded-full bg-[#2b2e35]`}>
      <div
        className="whitespace-nowrap rounded-full bg-[#646CFF] text-sm text-white transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}>
          <span className="mx-3">
          {text} ({`${percentage.toFixed(2)}%`})
          </span>
        </div>
    </div>
  );
}

export default ProgressBar;