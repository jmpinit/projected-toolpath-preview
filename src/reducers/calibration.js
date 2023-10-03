export default function calibrationReducer(state, action) {
  if (state === undefined) {
    return {
      chessboard: {
        rows: 6,
        cols: 9,
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
      cameraToCNC: undefined, // Found by MachineCalibrator
    };
  }

  switch (action.type) {
    case 'CALIBRATION_CAM_TO_CNC':
      if (action.payload.length !== 9) {
        throw new Error('Expected a flat array representing a 3x3 matrix');
      }

      return {
        ...state,
        cameraToCNC: action.payload,
      };
    default:
      return state;
  }
}
