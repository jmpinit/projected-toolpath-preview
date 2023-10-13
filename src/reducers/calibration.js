export default function calibrationReducer(state, action) {
  if (state === undefined) {
    return {
      chessboard: {
        rows: 6,
        cols: 9,
      },
      projectorPoints: undefined,
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
      // cameraToCNC: [1.4564155842080435, -0.041361980291978684, -704.9867964857889, 0.056877782393596435, 1.4490153119886213, -438.2576648615399, 0.00005919776472411878, 0.000020409742824481332, 1],

      // At Folk
      // cameraToCNC: [0.043075534603640026, 2.730826537185337, -48.10767263743354, 1.8356781625603118, 0.818966622068917, -1043.3082560072555, 0.0004288015688203449, 0.0012790422394770606, 1],
      cameraToCNC: [0.043468848155803194, 2.6840343212866253, 9.61377611642553, 1.7296076605400583, 0.8239892121898468, -953.5498532197872, 0.00039772559511427376, 0.001306631740046312, 1],

      // cameraToCNC: undefined,
      // cameraToCNC: [
      //   1, 0, 0,
      //   0, 1, 0,
      //   0, 0, 1,
      // ], // Found by MachineCalibrator
      cameraToProjector: [
        2.623392169736774, -0.13872943344422045, -791.714146921159, 0.11037737311120215, 2.609361254543735, -509.26906654732244, 0.000003930237039655115, -0.000028803213970079883, 1 ],
      //   1, 0, 0,
      //   0, 1, 0,
      //   0, 0, 1,
      // ], // Found by ProjectorCalibrator
    };
  }

  switch (action.type) {
    case 'CALIBRATION_CAM_TO_CNC':
      if (action.payload.length !== 9) {
        throw new Error('Expected a flat array representing a 3x3 matrix');
      }

      console.log('CALIBRATION_CAM_TO_CNC', action.payload);

      return {
        ...state,
        cameraToCNC: action.payload,
      };
    case 'CALIBRATION_PROJECTOR_POINTS':
      return {
        ...state,
        projectorPoints: action.payload,
      };
    case 'CALIBRATION_CAM_TO_PROJECTOR':
      if (action.payload.length !== 9) {
        throw new Error('Expected a flat array representing a 3x3 matrix');
      }

      console.log('CALIBRATION_CAM_TO_PROJECTOR', action.payload);

      return {
        ...state,
        cameraToProjector: action.payload,
      };
    default:
      return state;
  }
}
