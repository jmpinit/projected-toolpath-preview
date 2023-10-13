import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ProjectedCanvas from './ProjectedCanvas';

/**
 * Render a chessboard pattern on a canvas element
 * @param canvas
 * @param rows - number of inner corner rows
 * @param cols - number of inner corner columns
 * @returns {*[]} - array of [x, y] coordinates of inner corners
 */
function renderChessboard(canvas, rows, cols) {
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const s = 0.7; // HACK
  const width = canvas.width * s;
  const height = canvas.height * s;
  const sqSize = (height / (rows + 1));

  const points = [];
  for (let row = 0; row < rows + 1; row += 1) {
    for (let col = 0; col < cols + 1; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#000000' : '#ffffff';
      const x = 150 + (canvas.width - width) / 2 + col * sqSize; // HACK
      const y = (canvas.height - height) / 2 + row * sqSize;
      ctx.fillRect(x, y, sqSize, sqSize);

      if (row > 0 && col > 0) {
        points.push([x, y]);
      }

      if (row === 1 && col === 1) {
        console.log(`Chessboard ${rows}x${cols} rendered at ${x}, ${y}} on canvas sized ${canvas.width}x${canvas.height}`);
        console.log(`Square size is ${sqSize} and chessboard size is ${width}x${height}`);
      }
    }
  }

  return points;
}

function ProjectedChessboard({
  dispatch,
  onFullscreen,
  chessboardRows,
  chessboardCols,
}) {
  const handleRender = useCallback((canvas) => {
    const points = renderChessboard(canvas, chessboardRows, chessboardCols);

    const { top, left } = canvas.getBoundingClientRect();
    const pointsRelativeToViewport = points.map(([x, y]) => [left + x, top + y]);
    // const pointsRelativeToViewport = points; // FIXME
    console.log(`Chessboard offset on window is ${left}, ${top}`);
    console.log('Chessboard inner corners:', pointsRelativeToViewport);

    // FIXME: just for debugging
    // const ctx = canvas.getContext('2d');
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = '#ffff00';
    // points.forEach(([x, y]) => {
    //   ctx.beginPath();
    //   ctx.arc(x, y, 15, 0, 2 * Math.PI);
    //   ctx.stroke();
    // });

    dispatch({
      type: 'CALIBRATION_PROJECTOR_POINTS',
      payload: pointsRelativeToViewport,
    });

    // HACK: trigger this from the fullscreen event somehow
    // (but make sure the new points are passed)
    if (document.fullscreenElement) {
      onFullscreen(pointsRelativeToViewport);
    }
  }, []);

  return (
    <ProjectedCanvas onRender={handleRender} />
  );
}

ProjectedChessboard.propTypes = {
  onFullscreen: PropTypes.func,
  chessboardRows: PropTypes.number.isRequired,
  chessboardCols: PropTypes.number.isRequired,
};

ProjectedChessboard.defaultProps = {
  onFullscreen: () => {},
};

export default connect()(ProjectedChessboard);
