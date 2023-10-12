import cvPromise from '@techstark/opencv-js';
import { videoToCanvas } from './cam';

(async () => {
  console.log('Loading OpenCV...');
  window.cv = await cvPromise;
  console.log('OpenCV loaded');
})();

export function canvasToMat(canvas) {
  if (cv === undefined) {
    throw new Error('OpenCV not loaded');
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return cv.matFromImageData(imageData);
}

export function generateChessboardPoints(count, width, height, gridSizeM = 0.03) {
  const pts = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      pts.push(x * gridSizeM);
      pts.push(y * gridSizeM);
      pts.push(0);
    }
  }

  const objectPoints = new cv.MatVector();
  for (let i = 0; i < count; i += 1) {
    objectPoints.push_back(cv.matFromArray(width * height, 3, cv.CV_32FC1, pts));
  }

  return objectPoints;
}

export function findChessboard(video, workCanvas) {
  if (video === null) {
    return undefined;
  }

  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    return undefined;
  }

  const canvas = workCanvas === undefined
    ? document.createElement('canvas')
    : workCanvas;

  videoToCanvas(video, canvas);

  const frameMat = canvasToMat(canvas);
  cv.cvtColor(frameMat, frameMat, cv.COLOR_BGR2GRAY, 0);
  const size = new cv.Size(9, 6);

  const corners = new cv.Mat();
  cv.findChessboardCorners(
    frameMat,
    size,
    corners,
    // cv.CALIB_CB_FAST_CHECK,
    cv.CALIB_CB_NORMALIZE_IMAGE + cv.CALIB_CB_ADAPTIVE_THRESH,
  );

  if (corners.rows === 0) {
    return undefined;
  }

  const winSize = new cv.Size(5, 5);
  const zeroZone = new cv.Size(-1, -1);
  const criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS + cv.TermCriteria_COUNT, 40, 0.001);
  cv.cornerSubPix(frameMat, corners, winSize, zeroZone, criteria);

  // Free objects we don't need anymore
  frameMat.delete();

  return corners;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function deepDeleteMatVector(matVec) {
  for (let i = 0; i < matVec.size(); i += 1) {
    matVec.get(i).delete();
  }
  matVec.delete();
}

export function calibrateCamera(imagePoints) {
  const objectPointsVec = generateChessboardPoints(imagePoints.length, 9, 6);

  // Convert the image points to a MatVector
  const imagePointsVec = new cv.MatVector();
  imagePoints.forEach((corners) => imagePointsVec.push_back(corners));

  // FIXME: track from camera video dimensions and validate at capture time
  const imageSize = new cv.Size(1280, 720);

  const camMat = new cv.Mat();
  const distCoeffs = new cv.Mat();
  const rVecs = new cv.MatVector();
  const tVecs = new cv.MatVector();
  const stdDeviationsIntrinsics = new cv.Mat();
  const stdDeviationsExtrinsics = new cv.Mat();
  const perViewErrors = new cv.Mat();

  cv.calibrateCameraExtended(
    objectPointsVec,
    imagePointsVec,
    imageSize,
    camMat,
    distCoeffs,
    rVecs,
    tVecs,
    stdDeviationsIntrinsics,
    stdDeviationsExtrinsics,
    perViewErrors,
  );

  let reprojectionError = 0;
  for (let i = 0; i < rVecs.size(); i += 1) {
    const objPoints = objectPointsVec.get(i);
    const rotVec = rVecs.get(i);
    const transVec = tVecs.get(i);

    const ptsOutMat = new cv.Mat(objPoints.rows, 2, cv.CV_32F);
    cv.projectPoints(objPoints, rotVec, transVec, camMat, distCoeffs, ptsOutMat);

    if (objPoints.rows !== ptsOutMat.rows) {
      throw new Error('objPoints.rows !== ptsOutMat.rows');
    }

    const imgPoints = imagePointsVec.get(i);
    for (let j = 0; j < objPoints.rows; j += 1) {
      const x1 = imgPoints.data32F[j * 2];
      const y1 = imgPoints.data32F[j * 2 + 1];

      const x2 = ptsOutMat.data32F[j * 2];
      const y2 = ptsOutMat.data32F[j * 2 + 1];

      reprojectionError += distance(x1, y1, x2, y2);
    }

    ptsOutMat.delete();
  }

  // Delete objects we don't need anymore
  deepDeleteMatVector(imagePointsVec);
  deepDeleteMatVector(objectPointsVec);
  deepDeleteMatVector(rVecs);
  deepDeleteMatVector(tVecs);
  stdDeviationsIntrinsics.delete();
  stdDeviationsExtrinsics.delete();
  perViewErrors.delete();

  return {
    fx: camMat.data64F[0],
    fy: camMat.data64F[4],
    cx: camMat.data64F[2],
    cy: camMat.data64F[5],
    distortionCoeffs: distCoeffs.data64F,
    error: reprojectionError,
  };
}

export function applyHomography(homography, x, y) {
  // z is 1 bc these are homogeneous coordinates
  const inPos = cv.matFromArray(3, 1, cv.CV_32F, [x, y, 1]);
  const outPos = new cv.Mat();
  cv.gemm(homography, inPos, 1.0, new cv.Mat(), 0.0, outPos, 0);

  const [wx, wy, w] = outPos.data32F;

  inPos.delete();
  outPos.delete();

  return [wx / w, wy / w];
}
