import React, { forwardRef, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { mat3 } from 'gl-matrix';
import { chessboardOuterCorners } from '../cv';
import ProjectedCanvas from './ProjectedCanvas';
import { renderChessboard, renderGnomon, renderToolpath } from '../render';

const ProjectionUI = forwardRef(({
  mapping,
  toolpath,
  annotation,
  project,
  cameraToCNC,
  cameraToProjector,
  chessboardRows,
  chessboardCols,
  chessboardPosition,
  chessboardScale,
  dispatch,
}, projectionCanvasRef) => {
  const triggerRerender = [
    projectionCanvasRef,
    mapping,
    toolpath,
    chessboardRows,
    chessboardCols,
    chessboardPosition,
    chessboardScale,
  ];

  const render = useCallback(() => {
    if (mapping) {
      const innerCorners = renderChessboard(
        projectionCanvasRef.current,
        chessboardRows,
        chessboardCols,
        chessboardPosition.x,
        chessboardPosition.y,
        chessboardScale,
      );

      dispatch({
        type: 'CALIBRATION_PROJECTION_RESIZED',
        payload: {
          width: projectionCanvasRef.current.width,
          height: projectionCanvasRef.current.height,
        },
      });

      const [
        upperLeft,
        upperRight,
        lowerRight,
        lowerLeft,
      ] = chessboardOuterCorners(innerCorners, chessboardRows, chessboardCols)
        .map(([x, y]) => ({ x, y }));

      dispatch({
        type: 'CALIBRATION_PROJECTION_POINTS',
        payload: {
          upperLeft,
          upperRight,
          lowerRight,
          lowerLeft,
        },
      });

      return;
    }

    const cncToCam = mat3.invert(mat3.create(), cameraToCNC);
    const cncToProj = mat3.multiply(mat3.create(), cameraToProjector, cncToCam);

    const canvas = projectionCanvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderGnomon(ctx, cncToProj);
    renderToolpath(ctx, toolpath, cncToProj);
  }, [...triggerRerender, dispatch]);

  useEffect(() => render(), triggerRerender);

  return (
    <ProjectedCanvas ref={projectionCanvasRef} onResize={render} />
  );
});

function mapStateToProps(state) {
  return {
    mapping: state.app.mapping,
    toolpath: state.cnc.toolpath,
    annotation: state.cnc.annotation,
    project: state.cnc.project,
    cameraToCNC: state.calibration.cameraToCNC,
    cameraToProjector: state.calibration.cameraToProjector,
    chessboardRows: state.calibration.chessboard.rows,
    chessboardCols: state.calibration.chessboard.cols,
    chessboardPosition: state.calibration.chessboard.position,
    chessboardScale: state.calibration.chessboard.scale,
  };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(ProjectionUI);
