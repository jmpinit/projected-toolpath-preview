import cvPromise from '@techstark/opencv-js';
import { mat3, vec3 } from 'gl-matrix';
import { videoToCanvas } from './cam';

(async () => {
  console.log('Loading OpenCV...');
  window.cv = await cvPromise;
  console.log('OpenCV loaded');
})();

export function chessboardOuterCorners(corners, rows, cols) {
  // Grid points in "U" shape order for the user to navigate to in sequence
  return [
    corners[0], // Upper left
    corners[cols - 1], // Upper right
    corners[rows * cols - 1], // Lower right
    corners[(rows - 1) * cols], // Lower left
  ];
}

export function swapOrder(mat) {
  const size = Math.sqrt(mat.length);

  if (size % 1 !== 0) {
    throw new Error('Matrix must be square');
  }

  const swappedMat = mat3.create();
  for (let col = 0; col < size; col += 1) {
    for (let row = 0; row < size; row += 1) {
      swappedMat[col * 3 + row] = mat[row * size + col];
    }
  }

  return swappedMat;
}

/**
 * Convert the image data in a canvas to a Mat
 * The caller must ensure that the Mat is deleted
 * @param canvas
 * @returns {Mat}
 */
export function canvasToMat(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Deleted by caller
  return cv.matFromImageData(imageData);
}

/**
 * Generate a MatVector of chessboard points
 * The caller must ensure that the MatVector and its contents are deleted
 * @param count - how many chessboards-worth of points to generate
 * @param columns - how many inner columns of corners the chessboard will have
 * @param rows - how many inner rows of corners the chessboard will have
 * @param gridSizeM - the size of each grid square in meters
 * @returns {MatVector}
 */
export function generateChessboardPoints(count, columns, rows, gridSizeM = 0.03) {
  const pts = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      pts.push(x * gridSizeM);
      pts.push(y * gridSizeM);
      pts.push(0);
    }
  }

  // Deleted by caller
  const objectPoints = new cv.MatVector();
  for (let i = 0; i < count; i += 1) {
    // Deleted by caller
    objectPoints.push_back(cv.matFromArray(columns * rows, 3, cv.CV_32FC1, pts));
  }

  return objectPoints;
}

/**
 * Find the chessboard corners in the current video frame
 * @param video - the video element to find the corners in
 * @param workCanvas - an optional canvas to use for working
 */
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

  // Deleted after use below
  let frameMat = canvasToMat(canvas);
  cv.cvtColor(frameMat, frameMat, cv.COLOR_BGR2GRAY, 0);
  const size = new cv.Size(9, 6);

  // Deleted after being converted to a regular JS array below
  let cornersMat = new cv.Mat();
  cv.findChessboardCorners(
    frameMat,
    size,
    cornersMat,
    // cv.CALIB_CB_FAST_CHECK,
    cv.CALIB_CB_NORMALIZE_IMAGE + cv.CALIB_CB_ADAPTIVE_THRESH,
  );

  if (cornersMat.rows === 0) {
    return undefined;
  }

  const winSize = new cv.Size(5, 5);
  const zeroZone = new cv.Size(-1, -1);
  const criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS + cv.TermCriteria_COUNT, 40, 0.001);
  cv.cornerSubPix(frameMat, cornersMat, winSize, zeroZone, criteria);
  frameMat.delete(); frameMat = undefined;

  // Convert corners to a regular JS array instead of passing it around and
  // risking a memory leak
  const corners = [];
  for (let i = 0; i < cornersMat.rows; i += 1) {
    corners.push([
      cornersMat.data32F[i * 2],
      cornersMat.data32F[i * 2 + 1],
    ]);
  }

  cornersMat.delete(); cornersMat = undefined;

  return corners;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function deepDeleteMatVector(matVec) {
  for (let i = 0; i < matVec.size(); i += 1) {
    // TODO: does this do anything? The documentation seems to imply that a new
    //  object is created when `get` is called: https://docs.opencv.org/3.4/de/d06/tutorial_js_basic_ops.html
    matVec.get(i).delete();
  }
  matVec.delete();
}

/**
 * Calibrate the camera using the given image points, which should correspond to
 * the inner points of a 6x9 chessboard
 * @param imagePoints - An array of chessboard point arrays. Each chessboard
 * array should contain 9x6 [x, y] points.
 * @param rows - how many inner rows of corners the chessboard will have
 * @param columns - how many inner columns of corners the chessboard will have
 * @returns {{
 *  fx: number, fy: number, cx: number, cy: number, distortionCoeffs: Float64Array, error: number
 * }}
 */
export function calibrateCamera(imagePoints, rows = 9, columns = 6) {
  // Deleted after use below
  let objectPointsVec = generateChessboardPoints(imagePoints.length, columns, rows);

  // Convert the image points to a MatVector
  // Deleted after use below
  let imagePointsVec = new cv.MatVector();
  imagePoints.forEach((corners) => {
    // Deleted after use below
    const cornersMat = cv.matFromArray(rows * columns, 2, cv.CV_32FC2, corners);
    imagePointsVec.push_back(cornersMat);
  });

  // FIXME: track from camera video dimensions and validate at capture time
  const imageSize = new cv.Size(1280, 720);

  // All deleted after use below
  let camMat = new cv.Mat();
  let distCoeffs = new cv.Mat();
  let rVecs = new cv.MatVector();
  let tVecs = new cv.MatVector();
  let stdDeviationsIntrinsics = new cv.Mat();
  let stdDeviationsExtrinsics = new cv.Mat();
  let perViewErrors = new cv.Mat();

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
    // All deleted after use below
    let objPoints = objectPointsVec.get(i);
    let rotVec = rVecs.get(i);
    let transVec = tVecs.get(i);

    // Deleted after use below
    let ptsOutMat = new cv.Mat(objPoints.rows, 2, cv.CV_32F);
    cv.projectPoints(objPoints, rotVec, transVec, camMat, distCoeffs, ptsOutMat);
    rotVec.delete(); rotVec = undefined;
    transVec.delete(); transVec = undefined;

    if (objPoints.rows !== ptsOutMat.rows) {
      throw new Error('objPoints.rows !== ptsOutMat.rows');
    }

    // Deleted after use below
    let imgPoints = imagePointsVec.get(i);
    for (let j = 0; j < objPoints.rows; j += 1) {
      const x1 = imgPoints.data32F[j * 2];
      const y1 = imgPoints.data32F[j * 2 + 1];

      const x2 = ptsOutMat.data32F[j * 2];
      const y2 = ptsOutMat.data32F[j * 2 + 1];

      reprojectionError += distance(x1, y1, x2, y2);
    }
    objPoints.delete(); objPoints = undefined;
    imgPoints.delete(); imgPoints = undefined;
    ptsOutMat.delete(); ptsOutMat = undefined;
  }

  // Delete objects we don't need anymore
  deepDeleteMatVector(imagePointsVec); imagePointsVec = undefined;
  deepDeleteMatVector(objectPointsVec); objectPointsVec = undefined;
  deepDeleteMatVector(rVecs); rVecs = undefined;
  deepDeleteMatVector(tVecs); tVecs = undefined;
  stdDeviationsIntrinsics.delete(); stdDeviationsIntrinsics = undefined;
  stdDeviationsExtrinsics.delete(); stdDeviationsExtrinsics = undefined;
  perViewErrors.delete(); perViewErrors = undefined;

  const calibrationData = {
    fx: camMat.data64F[0],
    fy: camMat.data64F[4],
    cx: camMat.data64F[2],
    cy: camMat.data64F[5],
    distortionCoeffs: distCoeffs.data64F,
    error: reprojectionError,
  };

  camMat.delete(); camMat = undefined;
  distCoeffs.delete(); distCoeffs = undefined;

  return calibrationData;
}

/**
 * Compute the homography from the camera to the CNC machine
 * @param chessboardPoints - the chessboard points in the camera's coordinate system
 * @param rows - number of inner corners the chessboard has
 * @param columns - number of inner corners the chessboard has
 * @param otherPointsByCorner - the points in the CNC machine's coordinate system
 * @returns {*} - the homography matrix in column-major order (glMatrix)
 */
export function computeCameraToX(chessboardPoints, rows, columns, otherPointsByCorner) {
  const otherPoints = [
    otherPointsByCorner.upperLeft,
    otherPointsByCorner.upperRight,
    otherPointsByCorner.lowerRight,
    otherPointsByCorner.lowerLeft,
  ].map((pt) => [pt.x, pt.y]);

  const imagePoints = chessboardOuterCorners(chessboardPoints, rows, columns);

  // Figured out the data formats via
  // https://stackoverflow.com/a/63695553
  // Deleted after use below
  let machinePointsMat = cv.matFromArray(4, 2, cv.CV_32F, otherPoints.flat());
  // Deleted after use below
  let imagePointsMat = cv.matFromArray(4, 2, cv.CV_32F, imagePoints.flat());
  // Deleted after use below
  let imageToMachine = cv.findHomography(imagePointsMat, machinePointsMat); // CV_64F
  machinePointsMat.delete(); machinePointsMat = undefined;
  imagePointsMat.delete(); imagePointsMat = undefined;

  const camToCNC = swapOrder(imageToMachine.data64F);
  imageToMachine.delete(); imageToMachine = undefined;

  return camToCNC;
}

export function applyHomography(homography, x, y) {
  // z is 1 bc these are homogeneous coordinates
  const inPos = vec3.fromValues(x, y, 1);
  const outPos = vec3.create();

  vec3.transformMat3(outPos, inPos, homography);
  const [wx, wy, w] = outPos;

  return [wx / w, wy / w];
}
