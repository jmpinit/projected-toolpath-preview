import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import AnnotatedVideo from './AnnotatedVideo';
import { calibrateCamera, findChessboard } from '../cv';
import { chunk } from '../util';

const CalibrationContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function CameraCalibrator() {
  const [imagePoints, setImagePoints] = useState([]);
  const [videoEl, setVideoEl] = useState();
  const [calibration, setCalibration] = useState();

  const handleUpdate = useCallback((video, canvas) => {
    if (videoEl === undefined) {
      setVideoEl(video);
    }

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const allPoints = imagePoints.reduce((acc, corners) => [...acc, ...corners.data32F], []);
    const points = chunk(allPoints, 2);
    if (points.length === 0) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    points.forEach(([x, y]) => ctx.fillRect(x - 5, y - 5, 10, 10));
  }, [setVideoEl, imagePoints]);

  const captureCalibrationPoints = useCallback(() => {
    const corners = findChessboard(videoEl);

    if (corners === undefined) {
      return;
    }

    const newImagePoints = [...imagePoints, corners];
    setImagePoints(newImagePoints);
  }, [videoEl, imagePoints, setImagePoints, setCalibration]);

  const calibrate = useCallback(() => {
    setCalibration(calibrateCamera(imagePoints));
  }, [imagePoints, setCalibration]);

  const clearCalibrationPoints = useCallback(() => {
    setImagePoints([]);
    setCalibration(undefined);
  }, [setImagePoints, setCalibration]);

  return (
    <CalibrationContainer>
      <button type="button" onClick={captureCalibrationPoints}>Capture</button>
      <button type="button" onClick={calibrate}>Calibrate</button>
      <AnnotatedVideo onUpdate={handleUpdate} />
      <button type="button" onClick={clearCalibrationPoints}>Reset</button>
      {calibration !== undefined && (
        <>
          <table>
            <thead>
              <tr>
                <td>Property</td>
                <td>X</td>
                <td>Y</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Optical Center</td>
                <td>{calibration.cx}</td>
                <td>{calibration.cy}</td>
              </tr>
              <tr>
                <td>Focal Length</td>
                <td>{calibration.fx}</td>
                <td>{calibration.fy}</td>
              </tr>
            </tbody>
          </table>
          <span>Distortion Coefficients:</span>
          <span>{calibration.distortionCoeffs.join(', ')}</span>
          <span>Re-projection Error:</span>
          <span>{calibration.error}</span>
        </>
      )}
    </CalibrationContainer>
  );
}
