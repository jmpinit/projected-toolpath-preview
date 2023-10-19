import React, { useCallback } from 'react';
import { connect } from 'react-redux';

function PositionStatus({ interfaceType, lastCommandedPos, dispatch }) {
  const [manualPos, setManualPos] = React.useState({ x: 0, y: 0 });
  const manualMode = interfaceType === 'manual';

  const defaultPosition = { x: 0, y: 0 };
  const reportedPosition = manualMode ? manualPos : lastCommandedPos || defaultPosition;

  const handleChange = useCallback((event) => {
    if (!manualMode) {
      return;
    }

    const value = parseInt(event.target.value, 10);

    const pos = {
      x: event.target.id === 'x' ? value : manualPos.x,
      y: event.target.id === 'y' ? value : manualPos.y,
    };

    setManualPos(pos);

    // It's okay for the manual position to contain NaN values,
    // but we won't set the CNC position to NaN
    if (Number.isNaN(pos.x) || Number.isNaN(pos.y)) {
      return;
    }

    dispatch({
      type: 'CNC_MOVED',
      payload: pos,
    });
  }, [manualMode, manualPos, setManualPos, dispatch]);

  return (
    <div>
      <label>Position:</label>
      {manualMode ? (
        <div>
          <label>X (mm):</label>
          <input
            id="x"
            type="number"
            value={Number.isNaN(reportedPosition.x) ? '' : reportedPosition.x}
            onChange={handleChange}
            min={0}
          />
          <label>Y (mm):</label>
          <input
            id="y"
            type="number"
            value={Number.isNaN(reportedPosition.y) ? '' : reportedPosition.y}
            onChange={handleChange}
            min={0}
          />
        </div>
      ) : (
        <span>{`X: ${x} Y: ${y}`}</span>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    connected: state.cnc.connected,
    interfaceType: state.cnc.interfaceType,
    lastCommandedPos: state.cnc.lastCommandedPos,
  };
}

export default connect(mapStateToProps)(PositionStatus);
