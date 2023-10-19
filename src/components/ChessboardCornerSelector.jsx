import React, { useCallback } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

function formatPoint(pt) {
  if (pt === undefined) {
    return '(?, ?)';
  }

  const { x, y } = pt;
  return `(${x}, ${y})`;
}

function ChessboardCornerSelector({ machinePoints, lastCommandedPos, dispatch }) {
  const haveAllPoints = Object.values(machinePoints).every((pt) => pt !== undefined);

  const handleClick = useCallback((event) => {
    switch (event.target.id) {
      case 'upper-left':
        dispatch({
          type: 'CALIBRATION_MACHINE_POINT',
          payload: { upperLeft: lastCommandedPos },
        });
        break;
      case 'upper-right':
        dispatch({
          type: 'CALIBRATION_MACHINE_POINT',
          payload: { upperRight: lastCommandedPos },
        });
        break;
      case 'lower-left':
        dispatch({
          type: 'CALIBRATION_MACHINE_POINT',
          payload: { lowerLeft: lastCommandedPos },
        });
        break;
      case 'lower-right':
        dispatch({
          type: 'CALIBRATION_MACHINE_POINT',
          payload: { lowerRight: lastCommandedPos },
        });
        break;
      default:
        throw new Error('Unknown corner');
    }
  }, [lastCommandedPos]);

  return (
    <fieldset>
      <Column style={{ background: haveAllPoints ? 'lightgreen' : 'white' }}>
        <Row>
          <button type="button" id="upper-left" onClick={handleClick}>Store</button>
          <label htmlFor="upper-left">{formatPoint(machinePoints.upperLeft)}</label>
          <label htmlFor="upper-right">{formatPoint(machinePoints.upperRight)}</label>
          <button type="button" id="upper-right" onClick={handleClick}>Store</button>
        </Row>
        <Row>
          <button type="button" id="lower-left" onClick={handleClick}>Store</button>
          <label htmlFor="lower-left">{formatPoint(machinePoints.lowerLeft)}</label>
          <label htmlFor="lower-right">{formatPoint(machinePoints.lowerRight)}</label>
          <button type="button" id="lower-right" onClick={handleClick}>Store</button>
        </Row>
      </Column>
    </fieldset>
  );
}

function mapStateToProps(state) {
  return {
    machinePoints: state.calibration.machinePoints,
    lastCommandedPos: state.cnc.lastCommandedPos,
  };
}

export default connect(mapStateToProps)(ChessboardCornerSelector);
