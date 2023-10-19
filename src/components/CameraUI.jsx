import React, { forwardRef, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { mat3 } from 'gl-matrix';

import AnnotatedVideo from './AnnotatedVideo';
import {
  highlightOuterCorner,
  renderChessboardPoints,
  renderGnomon,
  renderToolpath
} from '../render';

const CameraUI = forwardRef(({
  cncConnected,
  cncAtHome,
  cncPosition,
  toolpath,
  chessboardRows,
  chessboardCols,
  cameraToCNC,
  chessboardPoints,
  mapping,
  dispatch,
}, videoRef) => {
  const canvasRef = useRef();

  // Re-render the overlay only when data changes
  useEffect(() => {
    if (canvasRef.current === undefined) {
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (mapping) {
      if (chessboardPoints.length > 0) {
        renderChessboardPoints(ctx, chessboardPoints);
        highlightOuterCorner(
          ctx,
          chessboardPoints,
          chessboardRows,
          chessboardCols,
        );
      }
    }

    // Render the gnomon and tool path using the homography
    if (cameraToCNC !== undefined && window.cv !== undefined) {
      const cncToCam = mat3.invert(mat3.create(), cameraToCNC);

      renderGnomon(ctx, cncToCam);

      if (toolpath !== undefined) {
        renderToolpath(ctx, toolpath, cncToCam);
      }
    }
  }, [mapping, chessboardPoints, cameraToCNC, toolpath]);

  return (
    <AnnotatedVideo ref={videoRef} canvasRef={canvasRef} />
  );
});

function mapStateToProps(state) {
  return {
    cncConnected: state.cnc.connected,
    cncAtHome: state.cnc.atHome,
    cncPosition: state.cnc.lastCommandedPos,
    toolpath: state.cnc.toolpath,
    chessboardRows: state.calibration.chessboard.rows,
    chessboardCols: state.calibration.chessboard.cols,
    cameraToCNC: state.calibration.cameraToCNC,
    chessboardPoints: state.calibration.chessboard.detectedPoints,
    mapping: state.app.mapping,
  };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(CameraUI);
