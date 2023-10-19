import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { clamp } from '../util';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectionRegion = styled.div`
  position: relative;
  aspect-ratio: ${({ aspectRatio }) => aspectRatio};
  border: 1px solid black;
  overflow: hidden;
`;

const Chessboard = styled.div`
  position: absolute;
  background: black;
`;

function maxChessboardWidth(projectionWidth, projectionHeight, chessboardAspectRatio) {
  const projectionAspectRatio = projectionWidth / projectionHeight;

  if (projectionAspectRatio > chessboardAspectRatio) {
    // The projection is wider than the chessboard, so the chessboard will be
    // constrained by the height.
    return projectionHeight * chessboardAspectRatio;
  }

  return projectionWidth;
}

function ChessboardPlacement({
  projectionWidth,
  projectionHeight,
  chessboardRows,
  chessboardCols,
  scale,
  position,
  dispatch,
}) {
  const projectionRegionRef = useRef(null);
  const chessboardRef = useRef(null);
  const [parentDims, setParentDims] = useState({ width: 0, height: 0 });
  const [grabPosition, setGrabPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const projectionAspectRatio = projectionWidth / projectionHeight;
  // # of boxes instead of # of inner corners
  const chessboardAspectRatio = (chessboardCols + 1) / (chessboardRows + 1);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    const { left, top } = e.target.getBoundingClientRect();
    setGrabPosition({ x: e.clientX - left, y: e.clientY - top });
    e.preventDefault();

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [setIsDragging, setGrabPosition]);

  const handleMouseMove = (e) => {
    if (!isDragging) {
      return;
    }

    const {
      left: parentX,
      top: parentY,
      width: outerWidth,
      height: outerHeight,
    } = e.target.parentElement.getBoundingClientRect();

    const { width, height } = e.target.getBoundingClientRect();
    const normX = clamp(e.clientX - parentX - grabPosition.x, 0, outerWidth - width - 1) / outerWidth;
    const normY = clamp(e.clientY - parentY - grabPosition.y, 0, outerHeight - height - 1) / outerHeight;

    dispatch({
      type: 'CALIBRATION_CHESSBOARD_PLACEMENT',
      payload: {
        position: { x: normX, y: normY },
      },
    });
  };

  const handleScaleChange = useCallback((event) => {
    const newScale = parseFloat(event.target.value);

    const newWidth = newScale * maxChessboardWidth(
      parentDims.width,
      parentDims.height,
      chessboardAspectRatio,
    );
    const newHeight = newWidth / chessboardAspectRatio;

    const { x: normX, y: normY } = position;
    const x = normX * parentDims.width;
    const y = normY * parentDims.height;

    let newX = x;
    let newY = y;

    if (x > parentDims.width - newWidth) {
      newX = parentDims.width - newWidth;
    }

    if (y > parentDims.height - newHeight) {
      newY = parentDims.height - newHeight;
    }

    const update = {};

    if (x !== newX || y !== newY) {
      setGrabPosition({ x: 0, y: 0 });

      // Normalize the position to [0, 1]
      update.position = {
        x: newX / parentDims.width,
        y: newY / parentDims.height,
      };
    }

    update.scale = newScale;

    dispatch({
      type: 'CALIBRATION_CHESSBOARD_PLACEMENT',
      payload: update,
    });
  }, [scale]);

  useEffect(() => {
    if (projectionRegionRef.current === undefined) {
      return;
    }

    const { width, height } = projectionRegionRef.current?.getBoundingClientRect();
    setParentDims({ width, height });
  }, [projectionRegionRef, setParentDims, projectionWidth, projectionHeight]);

  // TODO: draw the chessboard

  const chessboardWidth = scale * maxChessboardWidth(
    parentDims.width,
    parentDims.height,
    chessboardAspectRatio,
  );

  return (
    <ControlsContainer>
      <ProjectionRegion ref={projectionRegionRef} aspectRatio={projectionAspectRatio}>
        <Chessboard
          ref={chessboardRef}
          style={{
            left: position.x * parentDims.width,
            top: position.y * parentDims.height,
            width: chessboardWidth,
            aspectRatio: chessboardAspectRatio,
          }}
          position={position}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          draggable
        />
      </ProjectionRegion>
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.1"
        value={scale}
        onChange={handleScaleChange}
      />
    </ControlsContainer>
  );
}

ChessboardPlacement.propTypes = {
  projectionWidth: PropTypes.number,
  projectionHeight: PropTypes.number,
};

ChessboardPlacement.defaultProps = {
  projectionWidth: 1280,
  projectionHeight: 720,
};

function mapStateToProps(state) {
  return {
    projectionWidth: state.calibration.projectionSize.width,
    projectionHeight: state.calibration.projectionSize.height,
    chessboardRows: state.calibration.chessboard.rows,
    chessboardCols: state.calibration.chessboard.cols,
    scale: state.calibration.chessboard.scale,
    position: state.calibration.chessboard.position,
  };
}

export default connect(mapStateToProps)(ChessboardPlacement);
