import React, { useCallback, useEffect, useRef, useState } from 'react';
import cvPromise from '@techstark/opencv-js';
import styled from 'styled-components';
import requestCamAccess, { videoToCanvas } from '../cam';
import { useAnimationFrame } from '../hooks';
import { chunk } from '../util';

let cv;

const VideoContainer = styled.div`
  position: absolute;
`;

const AbsCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`;

const AbsVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
`;

function canvasToMat(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return cv.matFromImageData(imageData);
}

function chessboardObjectPoints(count, width, height, gridSize = 0.03) {
  const pts = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pts.push(x * gridSize);
      pts.push(y * gridSize);
      pts.push(0);
    }
  }

  const objectPoints = new cv.MatVector();
  for (let i = 0; i < count; i += 1) {
    objectPoints.push_back(cv.matFromArray(width * height, 3, cv.CV_32FC1, pts));
  }

  return objectPoints;
}

function Controls({ onCalibrate, onCapture }) {
  return (
    <div>
      <button type="button" onClick={onCapture}>Capture</button>
      <button type="button" onClick={onCalibrate}>Calibrate</button>
    </div>
  );
}

const StyledControls = styled(Controls)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 8;
`;

export default function CalibrationUI() {
  const videoRef = useRef();
  const camCanvasRef = useRef();
  const [hasCamAccess, setHasCamAccess] = useState(false);
  const [imagePoints, setImagePoints] = useState([]);

  useEffect(() => {
    console.log('Waiting for OpenCV to load');

    cvPromise.then((_cv) => {
      cv = _cv;
      console.log('OpenCV ready');
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    (async () => {
      await requestCamAccess(video);
      setHasCamAccess(true);
    })();
  }, []);

  const captureCalibrationPoints = useCallback(() => {
    if (!hasCamAccess) {
      return;
    }

    const video = videoRef.current;
    const canvas = camCanvasRef.current;

    if (canvas === null || video === null) {
      return;
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    videoToCanvas(video, canvas);

    const frameMat = canvasToMat(canvas);
    cv.cvtColor(frameMat, frameMat, cv.COLOR_BGR2GRAY, 0);
    const size = new cv.Size(9, 6);

    const corners = new cv.Mat();
    cv.findChessboardCorners(
      frameMat,
      size,
      corners,
      cv.CALIB_CB_ADAPTIVE_THRESH + cv.CALIB_CB_NORMALIZE_IMAGE,
    );

    if (corners.length === 0) {
      console.log('No corners found');
      return;
    }

    // Found the chessboard

    const newImagePoints = [...imagePoints, corners];
    setImagePoints(newImagePoints);
  }, [hasCamAccess, imagePoints, setImagePoints]);

  useAnimationFrame(() => {
    if (imagePoints.length === 0) {
      return;
    }

    const corners = imagePoints[imagePoints.length - 1];
    const points = chunk(corners.data32F, 2);

    const canvas = camCanvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillStyle = 'green';
    points.forEach(([x, y]) => canvasCtx.fillRect(x - 5, y - 5, 10, 10));
  });

  const calibrateCamera = useCallback(() => {
    const objectPointsVec = chessboardObjectPoints(imagePoints.length, 9, 6);

    // Convert the image points to a MatVector
    const imagePointsVec = new cv.MatVector();
    imagePoints.forEach((corners) => imagePointsVec.push_back(corners));

    // FIXME: track from camera video dimensions and validate at capture time
    const imageSize = new cv.Size(1280, 720);

    const cameraMatrix = new cv.Mat();
    const distCoeffs = new cv.Mat();
    const rvecs = new cv.MatVector();
    const tvecs = new cv.MatVector();
    const stdDeviationsIntrinsics = new cv.Mat();
    const stdDeviationsExtrinsics = new cv.Mat();
    const perViewErrors = new cv.Mat();

    cv.calibrateCameraExtended(
      objectPointsVec,
      imagePointsVec,
      imageSize,
      cameraMatrix,
      distCoeffs,
      rvecs,
      tvecs,
      stdDeviationsIntrinsics,
      stdDeviationsExtrinsics,
      perViewErrors,
    );

    // TODO: delete all the mats!

    console.log(distCoeffs.data64F, cameraMatrix.data64F);
  }, [imagePoints]);

  return (
    <div>
      <Controls onCapture={captureCalibrationPoints} onCalibrate={calibrateCamera} />
      <VideoContainer>
        <AbsVideo ref={videoRef} />
        <AbsCanvas width={1280} height={720} ref={camCanvasRef} />
      </VideoContainer>
    </div>
  );
}
