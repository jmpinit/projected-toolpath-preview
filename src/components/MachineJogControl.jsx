import React, { useCallback } from 'react';

export default function MachineJogControl({ onJog }) {
  const handleJogUp = useCallback(() => onJog({ x: 0, y: 1 }), []);
  const handleJogDown = useCallback(() => onJog({ x: 0, y: -1 }), []);
  const handleJogLeft = useCallback(() => onJog({ x: -1, y: 0 }), []);
  const handleJogRight = useCallback(() => onJog({ x: 1, y: 0 }), []);

  return (
    <div>
      <button type="button" onClick={handleJogUp}>Up</button>
      <button type="button" onClick={handleJogDown}>Down</button>
      <button type="button" onClick={handleJogLeft}>Left</button>
      <button type="button" onClick={handleJogRight}>Right</button>
    </div>
  );
}
