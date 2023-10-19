import { computeCameraToX } from '../cv';

/**
 * If possible, compute the homography from the camera to the given points
 * add it to the state
 * @param state - Input state
 * @param otherPoints - Points in the target coordinate system
 * @param keyName - Key in the state where the homography should be stored
 * @returns {*} - Updated state
 */
function maybeCameraToX(state, otherPoints, keyName) {
  const haveAllPoints = Object
    .values(otherPoints)
    .every((pt) => pt !== undefined);

  if (haveAllPoints) {
    const { rows, cols, detectedPoints } = state.chessboard;

    if (detectedPoints.length > 0) {
      return {
        ...state,
        [keyName]: computeCameraToX(detectedPoints, rows, cols, otherPoints),
      };
    }
  }

  return state;
}

export default function calibrationReducer(state, action) {
  if (state === undefined) {
    return {
      chessboard: {
        rows: 6,
        cols: 9,
        scale: 1,
        position: { x: 0, y: 0 },
        detectedPoints: [],
      },

      projectionSize: {
        width: undefined,
        height: undefined,
      },

      projectionPoints: {
        upperLeft: undefined,
        upperRight: undefined,
        lowerRight: undefined,
        lowerLeft: undefined,
      },

      machinePoints: {
        // Default to AxiDraw dimensions just to make it quicker to demo
        lowerLeft: { x: 0, y: 0 },
        lowerRight: { x: 430, y: 0 },
        upperRight: { x: 430, y: 297 },
        upperLeft: { x: 0, y: 297 },
      },

      // https://github.com/thsant/3dmcap/blob/b9c5bb16e208c3e37f1ea6d5dc26c9304daf18cc/resources/Logitech-C920.yaml
      camera: {
        fx: 1394.6027293299926,
        fy: 1394.6027293299926,
        cx: 995.588675691456,
        cy: 599.3212928484164,
        distortionCoeffs: [
          0.11480806073904032,
          -0.21946985653851792,
          0.0012002116999769957,
          0.008564577708855225,
          0.11274677130853494,
        ],
      },
      cameraToCNC: undefined,
      cameraToProjector: undefined,
    };
  }

  switch (action.type) {
    case 'CALIBRATION_CHESSBOARD_PLACEMENT':
      return {
        ...state,
        chessboard: {
          ...state.chessboard,
          ...action.payload,
        },
      };
    case 'CALIBRATION_MACHINE_POINT': {
      const newMappedPoints = {
        ...state.machinePoints,
        ...action.payload,
      };

      let newState = {
        ...state,
        machinePoints: newMappedPoints,
      };

      newState = maybeCameraToX(newState, newState.machinePoints, 'cameraToCNC');
      newState = maybeCameraToX(newState, newState.projectionPoints, 'cameraToProjector');
      return newState;
    }
    case 'CALIBRATION_PROJECTION_POINTS': {
      const newMappedPoints = {
        ...state.projectionPoints,
        ...action.payload,
      };

      let newState = {
        ...state,
        projectionPoints: newMappedPoints,
      };

      newState = maybeCameraToX(newState, newState.machinePoints, 'cameraToCNC');
      newState = maybeCameraToX(newState, newState.projectionPoints, 'cameraToProjector');
      return newState;
    }
    case 'CALIBRATION_DETECTED_CHESSBOARD': {
      const { rows, cols } = state.chessboard;
      const expectedLength = rows * cols;

      if (action.payload.length !== expectedLength) {
        throw new Error(`Expected ${expectedLength} points for a ${cols}x${rows} chessboard, but got ${action.payload.length}`);
      }

      let newState = {
        ...state,
        chessboard: {
          ...state.chessboard,
          detectedPoints: action.payload,
        },
      };

      newState = maybeCameraToX(newState, newState.machinePoints, 'cameraToCNC');
      newState = maybeCameraToX(newState, newState.projectionPoints, 'cameraToProjector');
      return newState;
    }
    case 'CALIBRATION_PROJECTION_RESIZED':
      return {
        ...state,
        projectionSize: action.payload,
      };
    default:
      return state;
  }
}
