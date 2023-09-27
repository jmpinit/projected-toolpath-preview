import React, { useCallback, useEffect, useRef, useState } from 'react';
import cvPromise from '@techstark/opencv-js';
import styled from 'styled-components';
import { vec3 } from 'gl-matrix';
import requestCamAccess, { videoToCanvas } from '../cam';
import { useAnimationFrame } from '../hooks';
import { chunk, opencvMatToGlMat } from '../util';
import { AxiDraw } from '../axidraw';
import MachineJogControl from './MachineJogControl';

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

function findChessboard(video, canvas) {
  if (canvas === null || video === null) {
    return undefined;
  }

  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    return undefined;
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
    return undefined;
  }

  // Free objects we don't need anymore
  frameMat.delete();

  return corners;
}

export default function CalibrationUI() {
  const videoRef = useRef();
  const camCanvasRef = useRef();
  const [hasCamAccess, setHasCamAccess] = useState(false);
  const [imagePoints, setImagePoints] = useState([]);
  const [axidraw] = useState(new AxiDraw());
  const [machineHomography, setMachineHomography] = useState();

  useEffect(() => {
    console.log('Waiting for OpenCV to load');

    cvPromise.then((_cv) => {
      cv = _cv;
      window.cv = cv; // FIXME: delete
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

    const corners = findChessboard(videoRef.current, camCanvasRef.current);

    if (corners === undefined) {
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

  // MACHINE CALIBRATION

  const [chessboardOnMachine, setChessboardOnMachine] = useState();
  const [upperLeftPos, setUpperLeftPos] = useState({ x: 102, y: 82 });
  const [upperRightPos, setUpperRightPos] = useState({ x: 312, y: 82 });
  const [lowerLeftPos, setLowerLeftPos] = useState({ x: 102, y: 213 });
  const [lowerRightPos, setLowerRightPos] = useState({ x: 312, y: 213 });

  const handleClick = useCallback((event) => {
    if (!axidraw.connected) {
      axidraw.connect().then(() => axidraw.penUp());
    }

    if (machineHomography === undefined) {
      return;
    }

    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const glMat = opencvMatToGlMat(machineHomography);
    const mousePos = vec3.fromValues(clickX, clickY, 1);
    const machinePos = vec3.transformMat3(vec3.create(), mousePos, glMat);

    const [sx, sy] = mousePos;
    const [mx, my] = machinePos;
    console.log(`(${sx}, ${sy}) -> (${mx}, ${my})`);

    axidraw.moveTo(mx, my).then();
  }, [axidraw, machineHomography, chessboardOnMachine, camCanvasRef]);

  const handleMachineJog = useCallback((delta) => {
    (async () => {
      const pos = await axidraw.currentPosition();
      await axidraw.moveTo(
        pos.x + delta.x,
        pos.y - delta.y,
      );
    })();
  }, []);

  const findChessboardOnMachine = useCallback(() => {
    if (!hasCamAccess) {
      return;
    }

    const corners = findChessboard(videoRef.current, camCanvasRef.current);

    if (corners === undefined) {
      console.log('Failed to find chessboard');
      return;
    }

    // Found the chessboard
    console.log(corners);
    setChessboardOnMachine(corners);
  }, [hasCamAccess, setChessboardOnMachine]);

  const markUpperLeft = useCallback(() => {
    axidraw
      .currentPosition()
      .then((pos) => setUpperLeftPos(pos));
  }, [setUpperLeftPos]);

  const markUpperRight = useCallback(() => {
    axidraw
      .currentPosition()
      .then((pos) => setUpperRightPos(pos));
  }, [setUpperRightPos]);

  const markLowerLeft = useCallback(() => {
    axidraw
      .currentPosition()
      .then((pos) => setLowerLeftPos(pos));
  }, [setLowerLeftPos]);

  const markLowerRight = useCallback(() => {
    axidraw
      .currentPosition()
      .then((pos) => setLowerRightPos(pos));
  }, [setLowerRightPos]);

  const solveMachineHomography = useCallback(() => {
    // Figured out the data formats via
    // https://stackoverflow.com/a/63695553

    const machinePoints = [
      upperLeftPos,
      upperRightPos,
      lowerLeftPos,
      lowerRightPos,
    ].map(({ x, y }) => [x, y]).flat();
    const machinePointsMat = cv.matFromArray(4, 2, cv.CV_32F, machinePoints);

    const chunkedChessPts = chunk(chessboardOnMachine.data32F, 2);
    const chessboardPoints = [
      { x: chunkedChessPts[0][0], y: chunkedChessPts[0][1] },
      { x: chunkedChessPts[8][0], y: chunkedChessPts[8][1] },
      { x: chunkedChessPts[9 * 6 - 1 - 8][0], y: chunkedChessPts[9 * 6 - 1 - 8][1] },
      { x: chunkedChessPts[9 * 6 - 1][0], y: chunkedChessPts[9 * 6 - 1][1] },
    ].map(({ x, y }) => [x, y]).flat();
    const chessboardPointsMat = cv.matFromArray(4, 2, cv.CV_32F, chessboardPoints);

    console.log(machinePoints, chessboardPoints);
    const homography = cv.findHomography(chessboardPointsMat, machinePointsMat);
    setMachineHomography(homography);
  }, [setMachineHomography, chessboardOnMachine, upperLeftPos, upperRightPos, lowerLeftPos, lowerRightPos]);

  return (
    <div>
      <Controls onCapture={captureCalibrationPoints} onCalibrate={calibrateCamera} />
      <div>
        <button type="button" onClick={findChessboardOnMachine}>Find Chessboard</button><br />
        <button type="button" onClick={markUpperLeft}>Mark Upper Left</button>
        <p>{JSON.stringify(upperLeftPos)}</p>
        <button type="button" onClick={markUpperRight}>Mark Upper Right</button>
        <p>{JSON.stringify(upperRightPos)}</p>
        <button type="button" onClick={markLowerLeft}>Mark Lower Left</button>
        <p>{JSON.stringify(lowerLeftPos)}</p>
        <button type="button" onClick={markLowerRight}>Mark Lower Right</button>
        <p>{JSON.stringify(lowerRightPos)}</p>
        <button type="button" onClick={solveMachineHomography}>Solve Machine Homography</button>
      </div>
      <MachineJogControl onJog={handleMachineJog} />
      <VideoContainer>
        <AbsVideo ref={videoRef} />
        <AbsCanvas width={1280} height={720} ref={camCanvasRef} onClick={handleClick} />
      </VideoContainer>
    </div>
  );
}
