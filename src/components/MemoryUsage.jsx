import React, { useEffect } from 'react';

function getMemoryUsage() {
  return window.performance.memory.usedJSHeapSize / 1024 / 1024;
}

export default function MemoryUsage() {
  const [megabytesUsed, setMegabytesUsed] = React.useState(getMemoryUsage());

  useEffect(() => {
    const interval = setInterval(() => setMegabytesUsed(getMemoryUsage()), 500);
    return () => clearInterval(interval);
  }, [setMegabytesUsed]);

  return (
    <span>
      {`JS Heap: ${megabytesUsed.toFixed(2)} MB`}
    </span>
  );
}
