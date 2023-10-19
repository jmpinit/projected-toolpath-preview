import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import ChessboardCornerSelector from './ChessboardCornerSelector';
import ChessboardPlacement from './ChessboardPlacement';
import VideoContext from './VideoContext';
import { findChessboard } from '../cv';

const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

function MappingControls({ mapping, dispatch }) {
  const videoRef = useContext(VideoContext);

  const handleStartStopMapping = useCallback(
    () => dispatch ({ type: mapping ? 'APP_MAPPING_STOP' : 'APP_MAPPING_START' }),
    [mapping],
  );

  const handleDetectChessboard = useCallback(() => {
    if (videoRef.current === undefined) {
      return;
    }

    const corners = findChessboard(videoRef.current);

    if (corners === undefined) {
      return;
    }

    dispatch({
      type: 'CALIBRATION_DETECTED_CHESSBOARD',
      payload: corners,
    });
  }, []);

  return (
    <ControlContainer>
      <button type="button" onClick={handleStartStopMapping}>
        {mapping ? 'Stop Mapping' : 'Start Mapping'}
      </button>
      {mapping && (
        <>
          <button type="button" onClick={handleDetectChessboard}>Detect Chessboard</button>
          <ChessboardCornerSelector />
          <button type="button">Clear Points</button>
          <ChessboardPlacement />
        </>
      )}
    </ControlContainer>
  );
}

MappingControls.propTypes = {
};

function mapStateToProps(state) {
  return {
    mapping: state.app.mapping,
  };
}

export default connect(mapStateToProps)(MappingControls);
