export const MODE_UI = 'ui';
export const MODE_PROJECTION = 'projection';

export default function appReducer(state, action) {
  if (state === undefined) {
    return {
      cvReady: false,
      mode: MODE_UI,
    };
  }

  switch (action.type) {
    case 'CV_READY':
      return {
        ...state,
        cvReady: true,
      };
    case 'SET_UI_MODE':
      return {
        ...state,
        mode: MODE_UI,
      };
    case 'SET_PROJECTION_MODE':
      return {
        ...state,
        mode: MODE_PROJECTION,
      };
    default:
      return state;
  }
}
