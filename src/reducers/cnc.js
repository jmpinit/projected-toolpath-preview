import defaultToolpath from '../data/smiley.json';

export default function appReducer(state, action) {
  if (state === undefined) {
    return {
      interfaceType: 'manual',
      connected: false,
      atHome: undefined,
      lastCommandedPos: { x: 0, y: 0 }, // { x, y }
      feedRate: undefined, // mm/min
      toolpath: defaultToolpath,
    };
  }

  switch (action.type) {
    case 'CNC_SET_TOOLPATH':
      return {
        ...state,
        toolpath: action.payload,
      };
    case 'CNC_SET_INTERFACE_TYPE':
      return {
        ...state,
        interfaceType: action.payload,
      };
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
    case 'CNC_FEED_RATE_SET': {
      return {
        ...state,
        feedRate: action.payload,
      };
    }
    default:
      return state;
  }
}
