import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ProjectedChessboard from './ProjectedChessboard';
import { findChessboard, applyHomography } from '../cv';
import requestCamAccess from '../cam';
import { chunk } from '../util';

let searchInterval; // HACK

function ProjectorCalibrator({ chessboardRows, chessboardCols, projectorPoints, dispatch }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    requestCamAccess(video).then();
    searchInterval = undefined;
  }, []);

  const detectChessboard = useCallback((imagePoints) => {
    console.log("detectChessboard", imagePoints, projectorPoints);
    if (searchInterval !== undefined) {
      clearInterval(searchInterval);
    }
    imagePoints = imagePoints || projectorPoints;

    console.log('Looking for the chessboard...');

    searchInterval = setInterval(() => {
      const camImagePts = findChessboard(videoRef.current, canvasRef.current);

      if (camImagePts === undefined) {
        console.log('No chessboard found');
        return;
      }

      // FIXME: just for debugging
      window.camImagePts = chunk(camImagePts.data32F, 2);

      const projImagePts = cv.matFromArray(imagePoints.length, 2, cv.CV_32F, imagePoints.flat());
      const camToProjector = cv.findHomography(camImagePts, projImagePts); // CV_64F

      dispatch({
        type: 'CALIBRATION_CAM_TO_PROJECTOR',
        payload: Array.from(camToProjector.data64F),
      });

      // FIXME: just for debugging
      // dispatch({
      //   type: 'PROJECT',
      //   payload: imagePoints,
      // });

      clearInterval(searchInterval);
      searchInterval = undefined;
      setDone(true);
    }, 3000);

    return () => {
      clearInterval(searchInterval);
      searchInterval = undefined;
    };
  }, [setDone, projectorPoints]);

  return (
    <>
      {done ? (
        <>
          <h1>Done!</h1>
          <button type="button" onClick={() => setDone(false)}>Reset</button>
        </>
      ) : (
        <ProjectedChessboard
          onFullscreen={detectChessboard}
          chessboardCols={chessboardCols}
          chessboardRows={chessboardRows}
        />
      )}
      <button onClick={() => { detectChessboard() }}>Detect</button>
      <video ref={videoRef} hidden />
      <canvas ref={canvasRef} hidden />
    </>
  );
}

ProjectorCalibrator.propTypes = {
  chessboardCols: PropTypes.number.isRequired,
  chessboardRows: PropTypes.number.isRequired,
  projectorPoints: PropTypes.array.isOptional,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    chessboardCols: state.calibration.chessboard.cols,
    chessboardRows: state.calibration.chessboard.rows,
    projectorPoints: state.calibration.projectorPoints
  };
}

export default connect(mapStateToProps)(ProjectorCalibrator);
