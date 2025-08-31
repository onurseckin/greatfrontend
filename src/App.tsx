import React, { useState, useEffect } from 'react';

interface ProgressBarData {
  id: number;
  progress: number;
}

function ProgressBar({ progress }: { progress: number }): React.ReactElement {
  return (
    <div className="outer">
      <div className="inner" style={{ width: `${progress}%` }}></div>
    </div>
  );
}

export default function App() {
  const [progressBars, setProgressBars] = useState<ProgressBarData[]>([]);
  const [nextId, setNextId] = useState(1);

  const addProgressBar = () => {
    const id = nextId;
    setNextId(id + 1);
    const newBar: ProgressBarData = { id, progress: 0 };
    setProgressBars(prev => [...prev, newBar]);
  };

  useEffect(() => {
    const hasZero = progressBars.some(bar => bar.progress === 0);
    if (hasZero) {
      setProgressBars(prev =>
        prev.map(bar => (bar.progress === 0 ? { ...bar, progress: 100 } : bar))
      );
    }
  }, [progressBars]);

  const clearAll = () => {
    setProgressBars([]);
  };

  return (
    <div>
      <button onClick={addProgressBar}>Add</button>
      <button onClick={clearAll}>Clear</button>
      {progressBars.map(bar => (
        <ProgressBar key={bar.id} progress={bar.progress} />
      ))}
    </div>
  );
}
