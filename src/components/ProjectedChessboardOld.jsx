import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Render a chessboard pattern on a canvas element
 * @param canvas
 * @param rows - number of inner corner rows
 * @param cols - number of inner corner columns
 * @returns {*[]}
 */
function renderChessboard(canvas, rows, cols) {
  const { top, left } = canvas.getBoundingClientRect();
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const s = 0.9;
  const width = canvas.width * s;
  const height = canvas.height * s;
  const sqSize = (height / (rows + 1));

  const points = [];
  for (let row = 0; row < rows + 1; row += 1) {
    for (let col = 0; col < cols + 1; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#000000' : '#ffffff';
      const x = (canvas.width - width) / 2 + col * sqSize;
      const y = (canvas.height - height) / 2 + row * sqSize;
      ctx.fillRect(x, y, sqSize, sqSize);

      if (row > 0 && col > 0) {
        points.push([left + x, top + y]);
      }
    }
  }

  return points;
}

function resizeCanvas(canvas, rows, cols) {
  const { width, height } = canvas.getBoundingClientRect();

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  return renderChessboard(canvas, rows, cols);
}

function ProjectedChessboard({ onFullscreen, chessboardRows, chessboardCols, done }) {
  const canvasRef = useRef();

  const requestFullscreen = useCallback(() => {
    canvasRef.current.requestFullscreen();
  }, []);

  // Resize canvas width and height when element size changes
  useEffect(() => {
    const canvas = canvasRef.current;

    function handleFullscreen() {
      const imagePoints = resizeCanvas(canvas, chessboardRows, chessboardCols);
      onFullscreen(imagePoints);
    }

    canvas.addEventListener('fullscreenchange', handleFullscreen);
    return () => canvas.removeEventListener('fullscreenchange', handleFullscreen);
  }, [canvasRef]);

  const handleResize = useCallback(() => {
    if (canvasRef.current === undefined || canvasRef.current === null) {
      return;
    }

    resizeCanvas(canvasRef.current, chessboardRows, chessboardCols);
  }, [canvasRef, chessboardRows, chessboardCols]);

  useEffect(() => {
    const observer = new ResizeObserver(handleResize);
    observer.observe(canvasRef.current);
    renderChessboard(canvasRef.current, chessboardRows, chessboardCols);

    return () => observer.disconnect();
  }, [handleResize]);

  if (done) {
    return (<h1>Done!</h1>);
  }

  return (
    <canvas ref={canvasRef} onClick={requestFullscreen} width={1280} height={720} />
  );
}

ProjectedChessboard.propTypes = {
  onFullscreen: PropTypes.func,
  chessboardRows: PropTypes.number.isRequired,
  chessboardCols: PropTypes.number.isRequired,
  done: PropTypes.bool.isRequired,
};

ProjectedChessboard.defaultProps = {
  onFullscreen: () => {},
};

function mapStateToProps(state) {
  return {
    chessboardRows: state.calibration.chessboard.rows,
    chessboardCols: state.calibration.chessboard.cols,
  };
}

export default connect(mapStateToProps)(ProjectedChessboard);
