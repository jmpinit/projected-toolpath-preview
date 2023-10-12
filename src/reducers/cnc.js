import art from '../data/apriltag.json';

export default function appReducer(state, action) {
  if (state === undefined) {
    return {
      connected: false,
      atHome: undefined,
      lastCommandedPos: undefined,
      // FIXME: Hard-coding AxiDraw V3/A3 dimensions for testing
      // https://shop.evilmadscientist.com/productsmenu/890
      bedDimensions: {
        widthMM: 430,
        heightMM: 297,
      },
      toolpath: art,
      annotation: [], // Annotations are added by the user in cam space
      project: [], // Debug points in projector space
    };
  }

  switch (action.type) {
    case 'CNC_CONNECTED':
      return {
        ...state,
        connected: true,
        atHome: true,
      };
    case 'CNC_DISCONNECTED':
      return {
        ...state,
        connected: false,
        atHome: undefined,
      };
    case 'CNC_MOVED': {
      const { x, y } = action.payload;

      return {
        ...state,
        atHome: x === 0 && y === 0,
        lastCommandedPos: { x, y },
      };
    }
    case 'ANNOTATE': {
      const { x, y } = action.payload;

      return {
        ...state,
        annotation: [[x, y]],
      };
    }
    case 'PROJECT': {
      const points = action.payload;

      return {
        ...state,
        project: points,
      };
    }
    default:
      return state;
  }
}
